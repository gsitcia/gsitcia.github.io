/*var new_arp = document.getElementById('new_arp');
var new_drone = document.getElementById('new_drone');
var list = document.getElementById('list');*/

var audio = new AudioContext();
var collector = audio.createBiquadFilter();
collector.connect(audio.destination);
collector.frequency.value = 1000;
var keys = {};
var kks = 'zsxdcvgbhnjmq2w3er5t6y7ui,';
var arps = [];
var step = function() {
    for (i in arps) {
        arps[i].play();
    }
}
var int = setInterval(step,100);

var stopall = function() {
    for (i in arps) {
        if (arps[i].playing) {
            arps[i].start.click();
        }
    }
    for (i in keys) {
        if (keys[i]) {
            keys[i].stop();
        }
    }
}

var startall = function() {
    stopall();
    for (i in arps) {
        arps[i].start.click();
    }
}

var fromk = function(k) {
    return 440*(2**(k/12));
}

var froms = function(s) {
    if (s==',') {
        return fromk(-21);
    }
    if (kks.indexOf(s) >= 0) {
        return fromk(kks.indexOf(s)-33);
    }
}

var Note = function(f,a,d) {
    this.frequency = f||440;
    this.attack = a||10;
    this.decay = d||10;
    this.osc = audio.createOscillator();
    this.gain = audio.createGain();
    this.gain.gain.value = 0;
    this.osc.frequency.value = this.frequency;
    this.osc.type = 'triangle';
    this.osc.connect(this.gain);
    this.gain.connect(collector);
    this.osc.onended = () => {
        this.gain.disconnect(collector);
    };
};

Note.prototype.start = function() {
    this.osc.start(0);
    this.gain.gain.linearRampToValueAtTime(0.3,audio.currentTime+this.attack/1000);
};

Note.prototype.stop = function(w) {
    w = w||0;
    if (!this.stopped) {
        this.stopped = true;
        this.osc.stop(audio.currentTime+this.decay/1000+w);
        this.gain.gain.linearRampToValueAtTime(0.3,audio.currentTime+w);
        this.gain.gain.linearRampToValueAtTime(0,audio.currentTime+this.decay/1000+w);
    }
};

var Arp = function() {
    this.li = document.createElement('li');
    this.div = document.createElement('div');
    this.li.appendChild(this.div);
    this.inp = document.createElement('input');
    this.start = document.createElement('button');
    this.start.innerText = 'Start arp';
    this.reset = document.createElement('button');
    this.reset.innerText = 'Reset';
    this.info = document.createElement('span');
    this.info.style.float = 'right';
    this.info.innerText='(0)';
    this.inpspan = document.createElement('span');
    this.inpspan.appendChild(this.inp);
    this.inpspan.style.paddingRight = '5px';
    this.div.appendChild(this.info);
    this.div.appendChild(this.reset);
    this.div.appendChild(this.start);
    this.div.appendChild(this.inpspan);
    this.playing = false;
    this.note = 0;
    this.curr = null;
    this.inp.addEventListener('keydown',(e) => {
        e.preventDefault();
        var k = e.key;
        if ((kks+'-/').indexOf(k) > -1) {
            this.inp.value += k;
        }
        if (e.keyCode == 8) {
            this.inp.value = this.inp.value.slice(0,-1);
        }
        this.info.innerText = `(${this.inp.value.length})`;
    });
    this.reset.addEventListener('click',() => {
        this.note = 0;
        this.playing = false;
        this.inp.value = '';
        this.info.innerText = '(0)';
        this.inp.disabled = false;
        this.start.innerText = 'Start arp';
    });
    this.start.addEventListener('click',() => {
        if (this.inp.value.length == 0) {
            return;
        }
        this.playing = !this.playing;
        this.inp.disabled = this.playing;
        this.info.innerText = `(${this.inp.value.length})`;
        if (this.playing) {
            this.start.innerText = 'Stop arp';
        } else {
            this.start.innerText = 'Start arp';
        }
    });
}

Arp.prototype.play = function() {
    if (!this.playing) {
        this.note = 0;
        if (this.curr) {
            this.curr.stop();
            this.curr = null;
        }
        return;
    }
    this.info.innerText=`(${this.note+1}/${this.inp.value.length})`;
    var n = this.inp.value.charAt(this.note);
    if (n == '/') {
        if (this.curr) {
            this.curr.stop();
            this.curr = null;
        }
    }
    if (kks.indexOf(n) > -1) {
        if (this.curr) {
            this.curr.stop();
        }
        this.curr = new Note(froms(n));
        this.curr.start();
    }
    this.note += 1;
    if (this.note == this.inp.value.length) {
        this.note = 0;
    }
}

new_arp.addEventListener('click',function() {
    var lol = new Arp();
    list.appendChild(lol.li);
    arps.push(lol);
});

document.addEventListener('keydown',function(e) {
    var k = e.key;
    e.preventDefault();
    if (kks.indexOf(k)>-1 && !keys[k]) {
        keys[k] = new Note(froms(k));
        keys[k].start();
        //console.log('Starting key: ',k);
    }
});

document.addEventListener('keyup',function(e) {
    var k = e.key;
    e.preventDefault();
    if (kks.indexOf(k)>-1) {
        //e.preventDefault();
        keys[k].stop();
        keys[k] = undefined;
        //console.log('Stopping key: ',k);
    }
});

stop_all.addEventListener('click',stopall);
start_everything.addEventListener('click',startall);

new_drone.addEventListener('click',function() {
    new_drone.innerText='(unimplemented)';
    how_to_drone.innerText='Just hold down shift while you release a note to make a drone (press the note again to stop drone)';
});

var addString = function(s) {
    new_arp.click();
    arps[arps.length-1].inp.value=s;
    arps[arps.length-1].inp.dispatchEvent(new KeyboardEvent('keydown'));
}

var enc = s => btoa(s).replace(/\//g,'_').replace(/\+/g,'-');
var dec = s => atob(s.replace(/_/g,'/').replace(/-/g,'+'));

var u;
if ((u=new URL(location.href)).searchParams.has('magic')) {
    var s = u.searchParams.get('magic');
    if (s.charAt(0) == '!') {
        s = dec(s.slice(1));
    }
    s.split('_').forEach(addString);
}