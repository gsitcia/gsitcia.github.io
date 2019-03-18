var audio = new AudioContext();
//var collector1 = audio.createBiquadFilter();
var bufferSize = 4096;
var collector = (function() {
    var b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    var node = audio.createScriptProcessor(bufferSize, 1, 1);
    node.onaudioprocess = function(e) {
        var input = e.inputBuffer.getChannelData(0);
        var output = e.outputBuffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            b0 = 0.99886 * b0 + input[i] * 0.0555179;
            b1 = 0.99332 * b1 + input[i] * 0.0750759;
            b2 = 0.96900 * b2 + input[i] * 0.1538520;
            b3 = 0.86650 * b3 + input[i] * 0.3104856;
            b4 = 0.55000 * b4 + input[i] * 0.5329522;
            b5 = -0.7616 * b5 - input[i] * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + input[i] * 0.5362;
            output[i] *= 0.11; // (roughly) compensate for gain
            b6 = input[i] * 0.115926;
        }
    }
    return node;
})();
collector.connect(audio.destination);
//collector.connect(collector1);
//collector1.frequency.value = 1000;
/*
you get a note with a config object
{note:'A4',wave:'triangle'}

types are: 
sine, square, sawtooth, and triangle

*/

var randType = function() {
    return ['sine','square','sawtooth','triangle'][Math.floor(Math.random()*4)];
}

var cache = {};
var nl = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
var sf = {'#':1,'b':-1};

var ntof = function(n) {
    var v;
    if (n.length == 3) {
        v = nl[n.charAt(0)]+sf[n.charAt(1)]+12*(n.charAt(2)-4);
    } else {
        v = nl[n.charAt(0)]+12*(n.charAt(1)-4);
    }
    return 440*Math.pow(2,(v-9)/12);
};

var getNote = function(n,w) {
    if (n) return new Note(ntof(n),w);
    var k = new Note(440,w);
    k.v=0;
    return k;
    /*if (cache[w+n]) {
        var t = cache[w+n];
        createNote(n,w);
        return t;
    }
    await createNote(n,w);
    return getNote(n,w);*/
};

var createNote = async function(n,w) {
    cache[w+n] = new Note(ntof(n),w);
};

var Note = function(f,w) {
    this.f = f;
    this.w = w;
    this.v = 0.25;
    this.osc = audio.createOscillator();
    this.osc.frequency.value = f;
    this.osc.type = w;
    this.gain = audio.createGain();
    this.gain.gain.value = 0;
    this.osc.connect(this.gain);
    this.gain.connect(collector);
    this.osc.onended = ()=>this.gain.disconnect(collector);
};

Note.prototype.start = function(t=0) {
    this.osc.start(audio.currentTime+t);
    this.gain.gain.setValueAtTime(0,audio.currentTime+t);
    this.gain.gain.linearRampToValueAtTime(this.v,audio.currentTime+t+0.01);
};

Note.prototype.stop = function(t=0) {
    if (this.stopped) return;
    this.osc.stop(audio.currentTime+t);
    this.gain.gain.setValueAtTime(this.v,audio.currentTime+t-0.01);
    this.gain.gain.linearRampToValueAtTime(0.0,audio.currentTime+t);
    this.stopped = true;
}