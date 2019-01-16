var allcards = [];
var currentActiveCard = null;
var currentHoverCard = null;

var deactivateAllCards = function() {
    for (i in allcards) {
        if (allcards[i].div.classList.contains('active')) {
            allcards[i].div.classList.toggle('active');
        }
    }
}

var Card = function(name,mm) {
    this.name = name;
    this.max = mm;
    this.mana = 0;
    this.bound = [];
    this.row = document.createElement('tr');
    this.td = document.createElement('td');
    this.div = document.createElement('div');
    this.ns = document.createElement('span');
    this.is = document.createElement('span');
    this.ns.innerText = this.name;
    this.is.innerText = '0/'+this.max;
    this.ns.style.float = 'left';
    this.is.style.float = 'right';
    this.bd = document.createElement('div');
    this.bt = document.createElement('table');/*
    this.br = document.createElement('tr');
    this.bi = document.createElement('th');
    this.bi.innerText = this.bound.length+' bound';
    this.br.appendChild(this.bi);
    this.bt.appendChild(this.br);
    this.br.classList.toggle('boundno');/**/
    this.bd.appendChild(this.bt);
    this.div.appendChild(this.ns);
    this.div.appendChild(this.is);
    this.td.appendChild(this.div);
    this.td.appendChild(this.bd);
    this.row.appendChild(this.td);
    this.div.classList.toggle('infoblurb');
    this.div.addEventListener('click',() => {
        var t = this.div.classList.contains('active');
        deactivateAllCards();
        if (!t) {
            this.div.classList.toggle('active');
            currentActiveCard = this;
        } else {
            currentActiveCard = null;
        }
    });
    this.div.addEventListener('mouseover',() => {currentHoverCard = this;});
    this.div.addEventListener('mouseout',() => {currentHoverCard = null;});
    this.partof = null;
    this.depth = 0;
    this.redraw();
    allcards.push(this);
}

Card.prototype.redraw = function() {
    //this.bi.innerText = this.bound.length+' bound';
    if (this.partof) {
        this.depth = this.partof.depth+1;
    } else {
        this.depth = 0;
    }
    this.td.style.backgroundColor = ['#abc','#cba'][this.depth%2];
    if (this.bound.length == 0) {
        this.bd.style.display = 'none';
    } else {
        this.bd.style.display = null;
    }
    for (i in this.bound) {
        this.bound[i].redraw();
    }
}

Card.prototype.addto = function(p) {
    if (this.partof) {
        this.partof.bound.splice(this.partof.bound.indexOf(this),1);
        this.partof.bt.removeChild(this.row);
        this.partof.redraw();
    }
    this.partof = p;
    this.partof.bound.push(this);
    this.partof.bt.appendChild(this.row);
    this.partof.redraw();
    this.redraw();
    //this.row.style.backgroundColor = randcolor();
}