var audio = new AudioContext();
var collector = audio.createBiquadFilter();
collector.connect(audio.destination);
collector.frequency.value = 1000;
//var no = 0;
var DIVC = Math.log(2)/12;
var SUBC = Math.log(440);
var keys = {};
var kks = 'zsxdcvgbhnjmq2w3er5t6y7ui';
//tyi7tyi7tyi7tyi7tyi7
var imp = document.getElementById('imp');
var arp = document.getElementById('arp');
var res = document.getElementById('reset');
var arping = false;
var arper = null;
var current = 0;

var fromk = function(k) {
    return 440*(2**(k/12));
};

var quantize = function(f) {
    var k = Math.round((Math.log(f)-SUBC)/DIVC);
    return fromk(k);
};

var panic = function() {
    for (i in keys) {
        if (keys[i]) {
            keys[i].stop();
            keys[i] = undefined;
        }
    }
};

var Note = function(f,a,d) {
    this.frequency = f||440;
    this.attack = a||10;
    this.decay = d||1000;
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

var tn = function(f,t) {
    var l = new Note(f);
    l.start();
    l.stop(t);
};

var tk = function(k,t) {
    if (kks.indexOf(k)>=0) {
        tn(fromk(kks.indexOf(k)-33),t);
    }
};

var Arpeggiator = function(v) {
    this.osc = audio.createOscillator();
    this.osc.frequency.value = fromk(kks.indexOf(v.charAt(0))-33);
    this.osc.type = 'sawtooth';
    this.gain = audio.createGain();
    this.gain.gain.value = 0;
    this.osc.connect(this.gain);
    this.gain.connect(collector);
    this.n = 0;
    this.v = v;
    this.t = null;
    this.osc.start(0);
}

Arpeggiator.prototype.start = function() {
    this.n = 0;
    this.osc.frequency.value = fromk(kks.indexOf(this.v.charAt(0))-33);
    var lol = () => {
        this.osc.frequency.linearRampToValueAtTime(fromk(kks.indexOf(this.v.charAt(this.n))-33),audio.currentTime+0.005);
        this.n += 1;
        if (this.n == this.v.length) {
            this.n = 0;
        }
    };
    this.t = setInterval(lol,150);
    this.gain.gain.linearRampToValueAtTime(0.3,audio.currentTime+0.01);
}

Arpeggiator.prototype.stop = function() {
    this.gain.gain.linearRampToValueAtTime(0,audio.currentTime+0.02);
    clearInterval(this.t);
}

document.addEventListener('keydown',function(e) {
    var k = e.key;
    e.preventDefault();
    if (kks.indexOf(k)>-1 && !keys[k]) {
        keys[k] = new Note(fromk(kks.indexOf(k)-33));
        keys[k].start();
        //console.log('Starting key: ',k);
    }
});

document.addEventListener('keyup',function(e) {
    var k = e.key;
    e.preventDefault();
    if (kks.indexOf(k)>-1) {
        keys[k].stop();
        keys[k] = undefined;
        //console.log('Stopping key: ',k);
    }
    if (k == 'p') {
        panic();
    }
});

window.addEventListener('blur',panic);

imp.addEventListener('keydown',function(e) {
    if (kks.indexOf(e.key) >= 0) {
        imp.value += e.key;
        //e.preventDefault();
    }
    if (e.keyCode == 8) {
        imp.value = imp.value.slice(0,-1);
    }
    if (e.key == '-') {
        imp.value += e.key;
    }
});

res.addEventListener('click',function() {
    imp.value = '';
    arping = false;
    clearInterval(arper);
    imp.disabled = arping;
    current = 0;
});

arp.addEventListener('click',function() {
    if (imp.value == '') {
        return;
    }
    arping = !arping;
    imp.disabled = arping;
    if (arping) {
        arper = setInterval(()=>{
            tk(imp.value.charAt(current),0.15);
            current += 1;
            if (current == imp.value.length) {
                current = 0;
            }
        },150);
    } else {
        clearInterval(arper);
        current = 0;
    }
});

var test = function() {
    var lol = new Arpeggiator('zdbhbd');
    lol.start();
    return lol;
};