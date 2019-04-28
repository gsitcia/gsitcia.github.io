var device;

var openDevice = async function() {
  var d = await navigator.usb.requestDevice({filters:[{vendorId:0x0451}]});
  await d.open();
  await d.selectConfiguration(1);
  await d.claimInterface(0);
  return d;
};

var listize = function(d) {
  return (new Uint8Array(d.buffer)).slice(d.byteOffset);
};

var readPacket = function(d) {
  if (d.getUint16(0)!=0x54fd) {
    return -1;
  }
  var r = {
    src_addr: d.getUint16(2),
    src_sid: d.getUint16(4),
    dest_addr: d.getUint16(6),
    dest_sid: d.getUint16(8),
    data_chk: d.getUint16(10),
    data_siz: d.getUint8(12),
    ack: d.getUint8(13),
    seq: d.getUint8(14),
    head_chk: d.getUint8(15),
    data: new DataView(d.buffer,16)
  };
  r.data_hex = Array.from(listize(r.data)).map(e=>e.toString(16));
  r.data_str = (new TextDecoder).decode(r.data);
  r.data_ascii = (new TextDecoder('ascii')).decode(r.data);
  return r;
};

var clean = function(l) {
  var nl = [];
  for (var i = 0; i < l.length; i++) {
    var t;
    if (typeof(l[i])=='number') {
      nl.push(l[i]);
    }
    else if (typeof(l[i])=='string') {
      for (var j = 0; j < l[i].length; j++) {
        nl.push(l[i].charCodeAt(j));
      }
    }
    else if ((t=l[i].buffer||l[i]) instanceof ArrayBuffer) {
      nl.push(...new Uint8Array(t));
    }
    else {
      /* object like {0:9} */
      for (var j = 0; j < l[i][Object.keys(l[i])[0]]; j++) {
        nl.push(Object.keys(l[i])[0]|0);
      }
    }
  }
  return nl;
};

var createData = function(l) {
  if (!Array.isArray(l)) {
    return l;
  }
  l = clean(l);
  var d = new DataView(new ArrayBuffer(l.length));
  l.forEach((n,i)=>d.setUint8(i,n));
  return d;
};

var chksum = function(d) {
  var acc = 0;
  for (var i = 0; i < d.byteLength; i++) {
    let first = (d.getUint8(i)<<8)|(acc>>8);
    acc = acc&0xff;
    let second = (((acc & 0xf) << 4) ^ acc) << 8;
    let third = second >> 5;
    acc = third >> 7;
    acc = (acc ^ first ^ second ^ third) & 0xffff;
  }
  return acc;
};

var makePacket = function(src_addr,src_sid,dest_addr,dest_sid,ack,data,seq=globalseq) {
  /* data is like [0x15,0x40] or a dataview object */
  data = createData(data);
  var pckt = new DataView(new ArrayBuffer(16+data.byteLength));
  for (var i = 0; i < data.byteLength; i++) {
    pckt.setUint8(16+i,data.getUint8(i));
  }
  pckt.setUint16(0,0x54fd);
  pckt.setUint16(2,src_addr);
  pckt.setUint16(4,src_sid);
  pckt.setUint16(6,dest_addr);
  pckt.setUint16(8,dest_sid);
  pckt.setUint16(10,chksum(data));
  pckt.setUint8(12,data.byteLength);
  pckt.setUint8(13,ack);
  pckt.setUint8(14,seq);
  var chk = 0;
  for (i = 0; i < 15; i++) {
    chk += pckt.getUint8(i);
  }
  pckt.setUint8(15,chk%256);
  return pckt;
};

var globalseq = 1;

var listenIn = async function(d,f) {
  while (d.opened) {
    f(readPacket((await d.transferIn(1,270)).data));
  }
};

var zfill = function(s,n) {
  s = s.toString(16);
  while (s.length < n) {
    s = "0"+s;
  }
  return s;
};

var prettify = function(p) {
  var s = `${zfill(p.src_addr,4)}:${zfill(p.src_sid,4)}->${zfill(p.dest_addr,4)}:${zfill(p.dest_sid,4)} AK:${p.ack} SQ:${p.seq}
  [${p.data_hex}] ${p.data_ascii}`;
  return s;
};

var callbacks = [];
/* will have {match:{},func:function(){},lifetime:1} */

/* I could add don't match, but if it seems useful, I will */
var setCallback = function(match) {
  return new Promise((res,rej)=>callbacks.push({match:match,func:res,lifetime:1}));
};

var respond = function(p) {
  console.log('They sent',prettify(p),p);
  if (p.src_addr==0) {
    /* this is the initial thing... */
    var rp = makePacket(0x6400,0x4003,0x6401,0x4003,0,[0x64,0x01,0xff,0x00],1);
    console.log('We sent',prettify(readPacket(rp)),readPacket(rp));
    device.transferOut(1,rp);
  } else if (p.ack == 0) {
    /* we need to acknowledge them */
    var rp = makePacket(0x6400,0x00ff,0x6401,p.dest_sid,0x0a,[p.dest_sid>>8,p.dest_sid&0xff],p.seq);
    console.log('We sent',prettify(readPacket(rp)),readPacket(rp));
    device.transferOut(1,rp);
  } else {
    /* they acknowledged something */
    /* globalseq += 1; */
    globalseq = globalseq==255?1:globalseq+1;
  }
  /* find matches */
  for (var j = 0; j < callbacks.length; j++) {
    let match = callbacks[j].match;
    (function(){
      for (i in match) {
        if (match[i]!=p[i]) {
          return;
        }
      }
      callbacks[j].func(p,callbacks[j].lifetime);/* we call the function first, because they may change their lifetime*/
      if(1==callbacks[j].lifetime--) {
        callbacks.splice(j,1);
      }
    })();
  }
};

var init = function() {
  globalseq = 1;
  return openDevice().then(d=>{device=d;listenIn(d,respond)});
};

var disconnect = function(dest) {
  var p = makePacket(0x6400,0x40de,0x6401,dest,0,[0x80,0x01],1);
  console.log('We sent',prettify(readPacket(p)));
  globalseq -= 1;/* this is before the transfer, because after the transfer, the calc will send back an ack and loop */
  device.transferOut(1,p);
};

var sendMessage = function(dest,data) {
  var p = makePacket(0x6400,0x8001,0x6401,dest,0,data);
  console.log('We sent',prettify(readPacket(p)));
  device.transferOut(1,p);/*.then(()=>disconnect(dest));/* lol */
};

var tmppp;

var readFile = async function(fn) {
  /* send recieve request and listen for stuff */
  /* please have disconnected before hand */
  sendMessage(0x4060,[7,1,fn,{0:9}]); /* at least 8 */
  var p = await setCallback({ack:0});
  /*console.log('WE GOT THISSSSSS',p);*/
  tmppp = p;
  var sz = p.data.getUint32(11);
  console.log(sz);
  var numtransfers = Math.floor((sz-1)/253)+1;/* 253 characters is 1 transfer */
  var l = [];
  sendMessage(0x4060,[4]);
  var yo;
  callbacks.push({match:{ack:0},lifetime:numtransfers,func:(p,lif)=>{
    /*console.log('yo yo yo its me ya boy joe');*/
    l=[...l,...listize(p.data).slice(1)];
    if (lif==1) {
      yo();
    }
  }});
  await new Promise(res=>yo=res);/* so that the callback can call yo eventually */
  sendMessage(0x4060,[0xff,0x00]);
  await setCallback({ack:10});
  disconnect(0x4060);
  return (new TextDecoder).decode((new Uint8Array(l)).buffer);
};

var getScreenShot = async function() {
  sendMessage(0x4024,[0]);
  var p = await setCallback({ack:0});
  var sz = p.data.getUint32(1);
  console.log(sz);
  var numtransfers = Math.floor((sz-1)/253)+1;/* 253 characters is 1 transfer */
  var l = [];
  var yo;
  callbacks.push({matc:{ack:0},lifetime:numtransfers,func:(p,lif)=>{
    l=[...l,...listize(p.data).slice(1)];
    if (lif==1) {
      yo();
    }
  }});
  await new Promise(res=>yo=res);
  disconnect(0x4024);/* am i supposed to send a success ? */
  return new DataView((new Uint8Array(l)).buffer);
};

var decodeScreenShot = function(b) {
  var i = 0;
  var index = 0;
  l = new DataView(new ArrayBuffer(320*240*2)); /* where we'll put the screenshot */
  while (i < b.byteLength) {
    var a = b.getInt8(i);
    if (a >= 0) {
      a = a+1;
      var v = b.getUint32(i+1);
      var t = index;
      for (;index<t+a*4;index+=4) {
        l.setUint32(index,v);
      }
      i += 5;
    } else {
      a = 1-a;
      for (var j = 0; j < a*4; j+=4) {
        var v = b.getUint32(i+1+j);
        l.setUint32(index+j,v);
      }
      index += a*4;
      i += a*4+1;
    }
  }
  console.log(index);
  return a565torgba(l.buffer);
};

var a565torgba = function(b) {
  b = new Uint16Array(b);/* just in case */
  var l = new Uint8Array(b.byteLength*2);
  for (var i = 0; i < b.byteLength/2; i++) {
    var v = b[i];
    l[i*4+0]=v>>11<<3;
    l[i*4+1]=(v>>5&0b111111)<<2;
    l[i*4+2]=(v&0b11111)<<3;
    l[i*4+3]=0xff;
  }
  return l;
};

var showOnCanvas = async function(rgba,canvas) {
  var ctx = canvas.getContext('2d');
  var q = ctx.createImageData(320,240);
  q.data.set(rgba);
  ctx.putImageData(q,0,0);
};

var getScreenBlob = async function(rgba) {
  var canvas = document.createElement('canvas');
  canvas.width=320;
  canvas.height=240;
  showOnCanvas(rgba,canvas);
  var b = await new Promise(r=>canvas.toBlob(r));
  return b;
};

var download = function(link,name) {
  var a = document.createElement('a');
  a.download=name;
  a.href=link;
  a.click();
}

var sendFile = async function(fn,data) {
  data = createData([data]);
  var sz = data.byteLength;
  console.log(sz);
  var sza = new DataView(new ArrayBuffer(4));
  data = data.buffer;/* now i can slice */
  sza.setUint32(0,sz);
  if (fn.length < 8) {
    fn = createData([fn,{0:8}]).buffer.slice(0,8);
  }
  sendMessage(0x4060,[3,1,fn,0,sza]);
  var p = await setCallback({ack:0});
  if (p.data.getUint8()==0xff) {
    if (p.data.getUint8(1)==0x14) {
      throw new Error('Invalid Path');
    }
    if (p.data.getUint8(1)==0x15) {
      throw new Error('Path does not end in .tns');
    }
    throw new Error('Unknown Error');
  }
  for (var i = 0; i < sz; i+=253) {
    sendMessage(0x4060,[5,data.slice(i,i+253)]);
    await setCallback({ack:10});
  }
  await setCallback({ack:0});
  disconnect(0x4060);
  return setCallback({ack:10});
};

var Fs='string thing hopefully you dont use this';
var F8='8 bit int yep ... sad';
var F16='16 bit int... security by obscurity';
var F32='32 bit int... there was probably a better way';
var Fb='boolean... for fun?';

var parseData = function(d,fmt) {
  /* format is an array */
  /* flags include s,u8,u16,u32 */
  /* string ignores it's size argument, because they'll be null terminated anyways */
  l = [];
  var j = 0;
  for (var i = 0; i < fmt.length; i++) {
    var f = fmt[i];
    if (f==Fs) {
      var s = '';
      var t = j+9;
      while (d.getUint8(j)!=0) {
        s += String.fromCharCode(d.getUint8(j++));
      }
      j++;
      j = Math.max(j,t);
      l.push(s);
    } else if (f==F8) {
      l.push(d.getUint8(j));
      j += 1;
    } else if (f==F16) {
      l.push(d.getUint16(j));
      j += 2;
    } else if (f==F32) {
      l.push(d.getUint32(j));
      j += 4;
    } else if (f==Fb) {
      l.push(Boolean(d.getUint8(j)));
      j += 1;
    } else {
      /* why should I check? */
      j += typeof(f)=='number'?1:f.length;
    }
  }
  return l;
};

var ls = async function(d) {
  sendMessage(0x4060,[0xd,d,{0:9}]);
  var p = await setCallback({ack:0});
  if (p.data.getUint16()==0xff0a) {
    throw new Error('directory doesn\'t exist');
  }
  if (p.data.getUint16()==0xff0f) {
    throw new Error('invalid directory name');
  }
  if (p.data.getUint16()!=0xff00) {
    throw new Error('unknown error');
  }
  var r = [];
  while (true) {
    sendMessage(0x4060,[0xe]);
    p = await setCallback({ack:0});
    if (p.data.getUint8()==0xff) {
      break;
    }
    var nm,sz,dt,dirr;
    [nm,sz,dt,dirr] = parseData(p.data,[10,0,0,Fs,F32,F32,Fb,0]);
    r.push({name:nm,size:sz,date:dt,directory:dirr});
  }
  sendMessage(0x4060,[0xf]);
  await setCallback({ack:0});
  disconnect(0x4060);
  return r;
};

var createDirectory = async function(d) {
  sendMessage(0x4060,[0xa,3,d,{0:9}]);
  await setCallback({ack:0});
  disconnect(0x4060);
  return setCallback({ack:10});
}

/*
var tmp = console.log;console.log=function(){};readFile('/Apps/utils/bob.txt.tns').then(console.warn);console.log()=tmp;
*/