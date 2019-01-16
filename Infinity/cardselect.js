if (!localStorage.decks) {
    localStorage.decks = JSON.stringify({
        'Grand Army': ['Recruit', 'Soldier', 'Infantry', 'Young General', 'Old General', 'Great General', 'Punish', 'Controlled Wrath'],
        'Angels Control': ['Grow', 'Kill', 'Firestorm', 'Explode', 'Raze', 'Angel of Triumph', 'Angel of Eternity', 'Giant'],
        'Commander Zoo': ["Will-o'-the-wisps", 'Muster', 'Recruiter', 'Twee Fwogs', 'Assemble', 'Inspire', 'Inspiring Commander', 'Rally'],
        'Wizard Spellslingers': ['Recall', 'Think Twice', 'Counterspell', 'Thunderbolt', 'Young Wizard', 'Old Wizard', 'Great Wizard', 'Manabound Octopus'],
        'Joust Aggro': ['Lancer', 'Strike', 'Star', 'Aspiring Squire', 'Knight', 'Shield', 'Arm', 'Bless'],
        'Binding Laws': ['Inquisitor', 'Veil Mage', 'Senator', 'Legislator', 'Jailer', 'Deranged Jailer', 'Breach Thoughts', 'Rune of Mana'],
        'Mana Artists': ['Blood Artist', 'Patron', 'Devoted Muse', 'Tempestuous Muse', 'Possibility Seeker', 'Glimpser of Beauty', 'Mana Burst', 'Time Warp'],
        'Cultist Sacrifice': ['Cursed Wanderer', 'Dark Cultist', 'Protective Grace', 'Cursed Cultist', 'Fiery Cultist', 'Cult Leader', 'Refleshment Vendor', 'Dragon-Reaper'],
        'Vampiric Unlife': ['Shadow of Life', 'Doctor', 'Vampire', 'Vampiric Creativity', 'Mage of Composure', 'Tragic Romance', 'Bloodfire', 'Vampiric Mathemagic']});
}

var decks = JSON.parse(localStorage.decks);
var activeDeck = null;
var cardSearch = '';
var cardos = {};
var activeCard = null;
var deckSlots = [];

for (var i = 0; i < 8; i++) {
    deckSlots.push(document.createElement('tr'));
    deckSlots[i].hidden=true;
    deckSlots[i].appendChild(document.createElement('td'));
    deckCards.appendChild(deckSlots[i]);
    addHoverDetect(deckSlots[i],i);
    deckSlots[i].addEventListener('click',((j)=>(()=>{
        console.log(allcards[activeDeck.list[j]].widget);
        if (activeCard) {
            activeCard.row.classList.toggle('active');
        }
        activeCard = allcards[activeDeck.list[j]].widget;
        activeCard.row.classList.toggle('active');
        updateInfo();
    }))(i));
}

var DeckWidget = function(name) {
    this.name = name;
    this.row = document.createElement('tr');
    this.td = document.createElement('td');
    this.label = document.createElement('label');
    this.label.style
    this.label.innerText = name;
    this.nameChange = document.createElement('input');
    this.nameChange.hidden = true;
    this.nameChange.value = name;
    this.remove = document.createElement('button');
    this.remove.innerText = 'Remove';
    this.remove.style.float='right';
    this.label.addEventListener('click',(e) => {
        e.preventDefault();
        this.label.hidden = true;
        this.nameChange.hidden = false;
        this.nameChange.focus();
    });
    this.nameChange.addEventListener('keydown',(e) => {
        if (e.keyCode==13 || e.keyCode==27) {
            this.changeName(this.nameChange.value);
            this.nameChange.hidden=true;
            this.label.hidden=false;
        }
    });
    this.nameChange.addEventListener('focusout',()=>{
        this.changeName(this.nameChange.value);
        this.nameChange.hidden=true;
        this.label.hidden=false;
    });
    this.remove.addEventListener('click',(e)=>{
        e.preventDefault();
        deckList.removeChild(this.row);
        delete decks[this.name];
        saveDecks();//hmmm should we keep this? if we get rid of it, you can just get your decks back by refreshing.
    });
    this.row.appendChild(this.td);
    this.td.appendChild(this.label);
    this.td.appendChild(this.nameChange);
    this.td.appendChild(this.remove);
    deckList.appendChild(this.row);
    this.td.addEventListener('click',(e)=>{
        console.log(this.name+' clicked');
        if (activeDeck) {
            activeDeck.widget.row.classList.toggle('active');
        }
        activeDeck = decks[this.name];
        this.row.classList.toggle('active');
        e.preventDefault();
        drawDeck();
        pleaseGetRidOfMe.hidden = true;
    });
}

DeckWidget.prototype.fixLabel = function() {
    var n = decks[this.name].list.indexOf(null);
    n = (n+1||9)-1;
    this.label.innerText = this.name + ' ('+n+'/8)';
}

DeckWidget.prototype.changeName = function(newName) {
    if (!(newName in decks)) {
        decks[newName]=decks[this.name];
        delete decks[this.name];
        this.name = this.nameChange.value;
        this.label.innerText=this.name;
        saveDecks();
    }
}

var Deck = function(name,l) {
    this.widget = new DeckWidget(name);
    addHoverDetect(this.widget.row,this);
    this.list = l||[null,null,null,null,null,null,null,null];
    this.name = name;
    this.widget.watch('name',(a,b,c)=>{this.name=c;return c;});
    decks[name] = this;
}

Deck.prototype.remove = function(c) {
    while (this.list.indexOf(c) > -1) {
        this.list.splice(this.list.indexOf(c),1);
        this.list.push(null);
    }
}

Deck.prototype.add = function(c) {
    if (this.list.indexOf(c) > -1) {
        return; // nothing to add/already there
    }
    if (this.list.indexOf(null) == -1) {
        return true; // nowhere to add/failed
    }
    this.list[this.list.indexOf(null)] = c;
}

var exportDeckList = function() {
    var o = {};
    for (i in decks) {
        o[i] = decks[i].list;
        decks[i].widget.fixLabel(); // just gonna sneak that in here
    }
    return JSON.stringify(o);
}

var saveDecks = function() {
    localStorage.decks = exportDeckList();
}

newDeck.addEventListener('click',() => {
    var n = 1;
    var dn;
    while ((dn=`New Deck #${n}`) in decks) {
        n += 1;
    }
    new Deck(dn);
    saveDecks();
});

var Card = function(name) {
    this.name = name;
    this.row = document.createElement('tr');
    this.td = document.createElement('td');
    this.row.appendChild(this.td);
    this.td.innerText = this.name;
    this.shown = false;
    cardList.appendChild(this.row);
    if (this.name in allcards) {
        allcards[this.name].widget = this;
    }
    this.row.addEventListener('click',()=>{
        //console.log('hi');
        if (activeCard) {
            activeCard.row.classList.toggle('active');
        }
        activeCard = this;
        activeCard.row.classList.toggle('active');
        updateInfo();
    });
    addHoverDetect(this.td,this);
}

Card.prototype.display = function() {
    var hidden = !this.name.match(RegExp(cardSearch,'i'));
    this.row.hidden = hidden;/* If you don't like your card disappearing just because you typed stuff, get rid of the first slash
    if (hidden) {
        if (activeCard == this) {
            activeCard = null;
            this.row.classList.toggle('active');
        }
    }/**/
}

searchBox.addEventListener('input',()=>{
    cardSearch = searchBox.value;
    for (i in allcards) {
        allcards[i].widget.display();
    }
});

var updateInfo = function() {
    var activeC = activeCard;
    if (currentHover != undefined) {
        //console.log(currentHover);
        if ((typeof currentHover) == "number") {
            activeC = allcards[activeDeck.list[currentHover]].widget;
        }
        else if ('shown' in currentHover) {
            //console.log(currentHover.name);
            activeC = allcards[currentHover.name].widget;
        }
    }
    if (activeC) {
        var card = allcards[activeC.name];
        cardName.hidden = false;
        cardName.innerText = activeC.name;
        cardType.hidden = false;
        cardType.innerText = card.type;
        cardCost.hidden = false;
        cardCost.innerText = 'Cost: '+card.cost;
        if (card.type == 'Creature') {
            cardPower.hidden = false;
            cardPower.innerText = 'Power: '+card.power;
        } else {
            cardPower.hidden = true;
        }
        cardText.innerText = card.text;
        if (activeDeck) {
            cardToggle.hidden = false;
            if (activeDeck.list.indexOf(activeC.name) == -1) {
                cardToggle.innerText = "Add this card";
                if (activeDeck.list.indexOf(null) == -1) {
                    cardToggle.hidden = true;
                }
            } else {
                cardToggle.innerText = "Remove this card";
            }
        } else {
            cardToggle.hidden = true;
        }
    } else {
        cardName.hidden = true;
        cardType.hidden = true;
        cardCost.hidden = true;
        cardPower.hidden = true;
        cardToggle.hidden = true;
        cardText.innerText = 'Select a card!'
    }
}

hoverover.push(updateInfo);
hoverout.push(updateInfo);

var drawDeck = function() {
    if (!activeDeck) {
        for (var i = 0; i < 8; i++) {
            deckSlots[i].hidden = true;
        }
        return;
    }
    for (var i = 0; i < 8; i++) {
        if (activeDeck.list[i]) {
            deckSlots[i].children[0].innerText = activeDeck.list[i];
            deckSlots[i].hidden = false;
        } else {
            deckSlots[i].hidden = true;
        }
    }
}

cardToggle.addEventListener('click',() => {
    if (activeDeck.list.indexOf(activeCard.name) == -1) {
        activeDeck.add(activeCard.name);
    } else {
        activeDeck.remove(activeCard.name);
    }
    updateInfo();
    drawDeck();
    saveDecks();
});

for (i in decks) {
    new Deck(i,decks[i]);
}

for (i in allcards) {
    new Card(i);
}

updateInfo();
saveDecks();

