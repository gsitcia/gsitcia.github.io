var canvas, gfx, events;
var areas;
var cute = {1:'00',2:'10',3:'10',4:'10',5:'10',6:'10',6663:'21',6664:'21',521:'20',6666:'21',11:'01',4111:'03',7553:'42',531:'20',532:'12',21:'01',22:'11',3332:'12',431:'02',541:'20',542:'02',31:'20',544:'02',5552:'31',7771:'20',6662:'21',551:'20',552:'31',553:'12',7722:'31',555:'32',6531:'20',3311:'21',776:'22',51:'20',7732:'51',53:'40',54:'31',55:'41',3111:'03',61:'20',7742:'51',63:'40',64:'50',65:'41',66:'51',6211:'50',5543:'23',7751:'20',72:'30',7753:'51',74:'50',75:'60',76:'60',6221:'20',6222:'12',7761:'20',7762:'60',7763:'13',7764:'23',7765:'03',7766:'32',1111:'01',5431:'20',7611:'30',5211:'40',7772:'41',7773:'32',7774:'32',7775:'32',7777:'32',6331:'20',5221:'20',5222:'12',621:'20',622:'40',433:'02',6661:'20',4211:'11',631:'20',771:'20',633:'22',4221:'20',4222:'11',533:'22',611:'30',641:'20',642:'12',7531:'20',644:'31',651:'20',775:'22',653:'02',654:'12',655:'02',3221:'20',3222:'02',663:'31',7711:'30',7321:'20',666:'31',111:'01',52:'30',2211:'03',7331:'20',7332:'22',7333:'22',7541:'20',2221:'12',2222:'13',6321:'20',6322:'21',773:'50',6655:'21',543:'02',6332:'21',6333:'21',522:'40',5311:'30',42:'30',32:'11',211:'02',711:'30',5321:'20',5322:'03',632:'50',765:'02',721:'20',722:'40',5331:'20',7741:'20',5333:'23',4311:'30',7:'10',731:'20',732:'50',221:'11',222:'12',4321:'02',4322:'02',741:'20',6111:'40',743:'22',744:'32',4331:'02',4332:'11',4333:'02',751:'20',752:'60',753:'50',754:'60',7411:'30',755:'22',7322:'60',41:'20',3321:'20',3322:'12',763:'02',764:'12',7421:'20',766:'02',3331:'12',772:'51',3333:'12',774:'51',7431:'20',7432:'03',7433:'03',6411:'30',77:'61',5421:'20',554:'32',7441:'20',7442:'32',7443:'23',7444:'23',6421:'20',6422:'21',6532:'21',6431:'20',6432:'21',6433:'21',5411:'02',7551:'20',6441:'20',6442:'21',6443:'21',6444:'21',7733:'23',5422:'02',733:'60',6642:'01',7731:'20',311:'02',5432:'02',5433:'02',4411:'11',7221:'20',321:'02',5442:'02',5443:'02',5444:'02',7222:'60',4422:'11',652:'02',331:'20',332:'11',333:'11',4431:'20',4432:'11',4433:'11',777:'62',43:'21',7511:'30',4441:'20',4442:'11',4443:'11',4444:'11',7653:'01',7521:'20',7522:'31',33:'21',742:'60',6641:'12',7752:'32',762:'02',7655:'02',7532:'50',7533:'23',6511:'30',643:'22',62:'30',7542:'03',7543:'50',7544:'23',6521:'20',6522:'21',7743:'03',661:'20',7552:'50',7744:'23',7554:'42',7555:'33',5332:'13',6533:'21',5511:'30',3211:'02',6551:'01',5441:'02',6541:'01',6542:'02',6543:'12',6544:'01',5521:'20',5522:'13',665:'31',6552:'01',6553:'01',6554:'01',411:'30',5532:'03',5533:'03',4421:'20',7721:'20',5531:'20',5541:'20',422:'12',7665:'33',5544:'22',2111:'02',71:'20',7311:'30',7652:'01',662:'41',5551:'20',432:'02',5553:'42',5554:'33',5555:'22',73:'40',441:'20',442:'21',443:'21',444:'21',7754:'51',6555:'02',7755:'32',7621:'02',7622:'02',7111:'40',322:'11',7631:'20',7632:'02',7633:'02',6611:'30',761:'20',7641:'01',7642:'60',7643:'01',7644:'60',6621:'20',6622:'21',421:'20',7651:'01',6665:'21',5542:'31',7654:'13',6631:'20',6632:'21',6633:'21',664:'31',6311:'30',44:'31',7661:'02',7662:'03',7663:'02',7664:'02',7211:'50',7666:'02',6643:'01',6644:'21',7422:'31',5111:'40',6651:'31',6652:'12',6653:'01',6654:'01',511:'30',7776:'32'};

var inBox = function(tx,ty,x,y,w,h) {
    return tx > x && ty > y && tx <= x+w && ty <= y+h;
}

var Area = function(x,y,w,h) {
    this.x = 105*x+5;
    this.y = 105*y+5;
    this.w = 105*w-5;
    this.h = 105*h-5;
    this.hasmouse = false;
    this.c = '#D3D3D3';
    this.events = document.createElement('div');
    this.events.style = `overflow:hidden; position: absolute; width: ${this.w}px; height: ${this.h}px; left: ${this.x}px; top: ${this.y}px;`;
    document.body.appendChild(this.events);
    this.exists = true;
    /*
    this.addEventListener('mouseover',()=>{this.hasmouse = true;});
    this.addEventListener('mouseout',()=>{this.hasmouse = false;});
    */
}

Area.prototype.draw = function() {
    gfx.fillStyle = this.c;
    gfx.fillRect(this.x,this.y,this.w,this.h);
}

Area.prototype.addEventListener = function(e,h) {
    this.events.addEventListener(e,h)
}

var drawRect = function(x,y,w,h) {
    gfx.fillRect(105*x+5,105*y+5,105*w-5,105*h-5);
}

var getSquare = function(x,y) {
    return areas[x*4+y];
}

var clearSquare = function(xo,yo) {
    for (var x = xo; x < 7; x++) {
        for (var y = yo; y < 4; y++) {
            getSquare(x,y).c = '#000000';
            getSquare(x,y).exists = false;
        }
    }
}

var drawBoard = function() {
    gfx.clearRect(0,0,canvas.width,canvas.height);
    //gfx.fillStyle = '#D3D3D3';
    //gfx.fillRect(5,5,100,625);
    //gfx.fillRect(110,5,100,625);
    for (var i = 0; i < areas.length; i++) {
        areas[i].draw();
    }
}

var getNum = function() {
    n = '';
    for (var y = 3; y >= 0; y--) {
        i=0;
        for (var x = 0; x < 7; x++) {
            if (getSquare(x,y).exists) {
                i++;
            }
        }
        n += i;
    }
    n = ''+Math.floor(n);
    z = '';
    for (var i = n.length-1; i >= 0; i--) {
        z += n[i];
    }
    return z;
}

var reset = function() {
    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 7; x++) {
            getSquare(x,y).exists = true;
            getSquare(x,y).c = '#D3D3D3';
        }
    }
    getSquare(0,0).c = '#D30000';
}

var startLoading = function() {
    canvas = document.getElementById('GraphicsBox');
    gfx = canvas.getContext('2d');
    events = document.getElementById('EventCatcher');
    areas = [];
    for (var x = 0; x < 7; x++) {
        for (var y = 0; y < 4; y++) {
            var k = new Area(x,y,1,1);
            areas.push(k);
            (function(a,b,c) {
                c.addEventListener('click',function() {
                    if (c.exists) {
                        clearSquare(a,b);
                        console.log(a+','+b);
                        m = cute[getNum()];
                        clearSquare(Math.floor(m[0]),Math.floor(m[1]));
                        if (m == '00') {
                            alert('You won!');
                            reset();
                        }
                    }
                });
            })(x,y,k);
        }
    }
    getSquare(0,0).addEventListener('click',function() {
        alert('You lost!');
        reset();
    });
    getSquare(0,0).c = '#D30000';
    setInterval(mainLoop,25);
    document.addEventListener('keydown',function(e) {
        console.log(e);
        if (e.keyCode == 82) {
            reset();
        }
    });
}

var mainLoop = function() {
    drawBoard();
    //drawCards();
}