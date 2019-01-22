//var names = {us:Cookies.name||randname(),them:''}; // we are transitioning to localStorage instead of cookies
var names = {us:localStorage.name||randname(),them:''};
playerName.value = names.us;
var connected = false;
var peer,conn;
var started = false;
const DESTINATION = 'cardselect.html';
//clearallcookies(); rather than doing this, just get rid of id and connect and connected
//clearcookie('id');
//clearcookie('connect');
//clearcookie('connected');
localStorage.removeItem('id');
localStorage.removeItem('connect');
localStorage.removeItem('connected'); // This is sort of unnecessary

/*
So the way this works, there are two players, the initiator and the connector.

We ignore all cookies already in place, because a new game is being created.
If the url has a 'id' search param, then they are the connector
Else, they are the initiator

The initiator connects to the webpage, so:
    a peer is made for them,
    a cookie "id" is made, 
    a link with our id is created

The connector connects to the webpage, so:
    a peer is made for them,
    a cookie "id" is made,
    a cookie "connect" is made with initiator id,
    the peer connects to the initiator,
    the connector name is sent to the peer

The initiator:
    a cookie "connected" is made with connector id,
    the connector name is updated,
    the initiator name is sent to the connector

Both:
    start game button is unlocked

Either may send their new name as {type:'name',name:'whatever'}, in which case the peer that recieves it will update the name
Either player may press the start button which sends {type:'start'}. If both have recieved the start signal, then they both redirect to the game page
*/

playerName.addEventListener('input',function() {
    names.us = playerName.value;
});

names.watch('us',function(a,b,c) {
    if (connected) {
        conn.send({type:'name',name:c});
    }
    return c;
});

names.watch('them',function(a,b,c) {
    otherName.innerText = c;
    return c;
});

var redirect = function(p) {
    location = './'+p;
}

var dealwithit = function(d) {
    console.log(d);
    switch(d.type) {
        case 'name':
            names.them = d.name;
            break;
        case 'start':
            if (started) {
                redirect(d.place);
            } else {
                started = d.place;
                helpfulinf.innerText = 'The other player has started.';
            }
            break;
    }
}

startGame.addEventListener('click',function() {
    startGame.disabled = true;
    conn.send({type:'start',place:DESTINATION});
    if (started) {
        redirect(started);
    } else {
        started = true;
    }
});

var ck;
if (ck=url.searchParams.get('key')) {
    // You are the connector
    peer = new Peer();
    conn = peer.connect(ck);
    //document.cookie='connect='+ck;
    localStorage.connect = ck;
    peer.on('open',function() {
        //document.cookie='id='+peer.id;
        localStorage.id = peer.id;
    });
    conn.on('open',function() {
        conn.send({type:'name',name:names.us});
        connected = true;
        startGame.disabled = false;
        otherNameBox.hidden = false;
    });
    conn.on('data',dealwithit);
} else {
    peer = new Peer();
    peer.on('open',function() {
        //document.cookie='id='+peer.id;
        localStorage.id = peer.id;
        link.hidden = false;
        var nl = location.origin+location.pathname+'?key='+peer.id;
        link.value = nl;
        navigator.clipboard.writeText(nl);
    });
    peer.on('connection',function(c) {
        conn = c;
        conn.on('data',dealwithit);
        conn.on('open',function() {
            //document.cookie='connected='+conn.id;
            localStorage.connected = conn.id;
            console.log(conn.id);
            conn.send({type:'name',name:names.us});
            connected = true;
            startGame.disabled = false;
            otherNameBox.hidden = false;
        });
    });
}
