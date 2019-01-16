var randcolor = function() {
    return '#'
        +'abcdef'.charAt(Math.floor(Math.random()*6))
        +'abcdef'.charAt(Math.floor(Math.random()*6))
        +'abcdef'.charAt(Math.floor(Math.random()*6));
}

var names = ["Keena Kuester","Francie Felker","Cordell Camarena","Wendi Whitford","Marcellus Matchett","Lillie Lamacchia","Melodie Mcentee","Lezlie Lira","Trudi Trivette","Herbert Hoda","Thora Torbett","Yuriko Younker","Dominica Dimas","Gia Goosby","Ok Overton","Carolynn Creasman","Shandi Silas","Janet Jenning","Avery Akers","Nicolas Nishioka","Sergio Smythe","Xiomara Xu","Megan Matton","Lovetta Lucus","Jin Jurgensen","Patsy Pettus","Berta Burg","Deeann Dorothy","Adena Anselmo","Mariah Mund","Temeka Troche","Winona Walburn","Marylouise Mcquaig","Vera Vanwart","Florrie Fogarty","Blake Briant","Ignacio Innis","Arletha Abdulla","Darius Devaney","Shanell Strand","Bunny Bowersox","Ian Ito","Krystin Keeney","Luis Lawerence","Natosha Noland","Azzie Angle","Merle Mar","Dinorah Delrosario","Verlie Villanueva","Calvin Caraballo"];

var randname = function() {
    return names[Math.floor(Math.random()*names.length)];
}