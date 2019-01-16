if (!Object.prototype.watch) {
    Object.defineProperty(Object.prototype, "watch", {
        enumerable: false,
        configurable: true,
        writable: false,
        value: function (prop, handler) {
            var oldval = this[prop],
            newval = oldval,
            getter = function () {
                return newval;
            },
            setter = function (val) {
                oldval = newval;
                return newval = handler.call(this, prop, oldval, val);
            };
            if (delete this[prop]) {
                Object.defineProperty(this, prop, {
                    get: getter,
                    set: setter,
                    enumerable: true,
                    configurable: true
                });
            }
        }
    });
}; // sauce: https://gist.github.com/eligrey/384583

var clearallcookies = function () {
    var cookies = document.cookie.split("; ");
    for (var c = 0; c < cookies.length; c++) {
        var d = window.location.hostname.split(".");
        while (d.length > 0) {
            var cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';
            var p = location.pathname.split('/');
            document.cookie = cookieBase + '/';
            while (p.length > 0) {
                document.cookie = cookieBase + p.join('/');
                p.pop();
            };
            d.shift();
        }
    }
} //Clear all cookies... credit goes to https://stackoverflow.com/users/78639/jan

var clearcookie = function(c) {
    document.cookie = c+'=; expires=Thu, 01-Jan-1970 00:00:01 GMT';
}

Object.defineProperty(window, "Cookies", {
    get: function() {
        return document.cookie.split(';').reduce(function(cookies, cookie) {
            if (cookie.indexOf('=') != -1) {
                cookies[cookie.split("=")[0].trim()] = unescape(cookie.split("=")[1].trim());
            }
            return cookies;
        }, {});
    }
});

var randcolor = function() {
    return '#'
        +'abcdef'.charAt(Math.floor(Math.random()*6))
        +'abcdef'.charAt(Math.floor(Math.random()*6))
        +'abcdef'.charAt(Math.floor(Math.random()*6));
}

var url = new URL(location.href);

var rnames = ["Keena Kuester","Francie Felker","Cordell Camarena","Wendi Whitford","Marcellus Matchett","Lillie Lamacchia","Melodie Mcentee","Lezlie Lira","Trudi Trivette","Herbert Hoda","Thora Torbett","Yuriko Younker","Dominica Dimas","Gia Goosby","Ok Overton","Carolynn Creasman","Shandi Silas","Janet Jenning","Avery Akers","Nicolas Nishioka","Sergio Smythe","Xiomara Xu","Megan Matton","Lovetta Lucus","Jin Jurgensen","Patsy Pettus","Berta Burg","Deeann Dorothy","Adena Anselmo","Mariah Mund","Temeka Troche","Winona Walburn","Marylouise Mcquaig","Vera Vanwart","Florrie Fogarty","Blake Briant","Ignacio Innis","Arletha Abdulla","Darius Devaney","Shanell Strand","Bunny Bowersox","Ian Ito","Krystin Keeney","Luis Lawerence","Natosha Noland","Azzie Angle","Merle Mar","Dinorah Delrosario","Verlie Villanueva","Calvin Caraballo"];

var randname = function() {
    return rnames[Math.floor(Math.random()*rnames.length)];
}

var searchList = function(s,l) {
    return l.filter(i=>i.match(RegExp(s,'i')));
}

var search = function(s) {
    return searchList(s,cardnames);
}

var currentHover = null;
var hoverover = [];
var hoverout = [];

var addHoverDetect = function(e,p) {
    p = p===undefined?e:p;
    e.addEventListener('mouseover',()=>{
        currentHover = p;
        for (var i = 0; i < hoverover.length; i++) {
            hoverover[i]();
        }
    });
    e.addEventListener('mouseout',()=>{
        if (currentHover == p) {
            currentHover = null;
            for (var i = 0; i < hoverout.length; i++) {
                hoverout[i]();
            }
        }
    });
}