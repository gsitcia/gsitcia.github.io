var bob = new Card('Vampiric Mathemagic',10);
var sam = new Card('Sam',5);
var jim = new Card('Jim',7);
var joe = new Card('Joe',9999);

var plan = new Area();
field1div.appendChild(plan.table);
bob.addto(plan);
jim.addto(plan);
joe.addto(bob);
sam.addto(bob);

for (var jwoeifj = 0; jwoeifj < 100; jwoeifj++) {
    var lol = new Card(randname(),Math.floor(Math.random()*100));
    console.log(lol);
    lol.addto(allcards[Math.floor(Math.random()*(allcards.length-1))]);
}