// This is a /*copypasta*/ library that handles establishing connections and sending events and things
// You must have come from the lobby for this to work
// This thing sets up an event based system
// When it receives a command from the other, it makes an event of that type and throws it at document
// hahaha the actual copypasta is <script src="connect.js"></script>, just copy that right into <head>
// The everything loaded event is just that. 'startall'

var lobbyLocation = './lobby.html';

if (!localStorage || !localStorage.id) {
    //alert(JSON.stringify(Cookies));
    alert("Your local storage is no bueno! Go to the lobby!");
    location = lobbyLocation;
}
var peer = new Peer(localStorage.id);
var conn;

var setupc = function(c) { // sets up recieving events and starting the game
    c.on('open',function() {
        document.dispatchEvent(new Event('startall'));
        localStorage.connected=c.id;
    });
    c.on('data',function(d) {
        var e = new Event(d.type);
        for (i in d) {
            e[i] = d[i];
        }
        document.dispatchEvent(e);
    });
}

if (Cookies.connect) { // Then we will do the connecting
    conn = peer.connect(localStorage.connect);
    setupc(conn);
} else { // we'll be waiting
    peer.on('connection',function(c) {
        conn = c;
        setupc(conn);
    });
}