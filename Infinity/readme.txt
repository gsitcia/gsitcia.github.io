The flow of this is as follows:
One of the players navigates to the lobby, where they recieve a link that they send to the other player.
Once they are both connected, they select start game and wind up on the card select screen (where they are not connected) and can select their archive. Then they can join the actual game.

I'm thinking of having the system automatically send events both ways, that way everyone just acts on events alone, and whoever sends the event doesn't need to worry. (I have implemented)

The way the actual game works is as follows:

The first player is selected randomly. (that works by exploiting the fact that the lobby left behind details of who initiated the connection)
Maybe I'll set it up so that all happens in the lobby (and you can choose)...
The reason I'm not adding a chat thing to the lobby is because you can just chat using the same method you sent the link. (and if you really care, just mess with your name)

This game will probably be ridiculously hackable (like worse than protobowl), (so minifiying/obfuscation is probably in order). But I'm ok with that, because nothing is really permanent anyways (other than your deck?), you can throw a real life game, and I'll do my best to not include any remote code inclusions.

I mean you can just change the power or cost of a card. (please don't do that)... this is why everything is calculated on both sides, but you can still spoof an event that would normally do that (because I don't plan on implementing checks as that would be too hard)

I really prefer to think of creature cards as spells that summon a creature, it just makes more sense, but I don't think it makes too much difference implementation wise.

START OF THE GAME
=================

- to be written




MORE INTERNALS
==============

- Both sides keep track of everything independently (that means both sides keep track of both sides cards

- The way I'm thinking about doing the card (creature) effects is like this: 
    Most cards that have special actions take them when something happens, like if a card enters, or if a different card targets it, or whatever. Which to me     indicates that an event based architecture is perfect.
    
- The other kind of card I can think of is like Archaeologist, which I guess I can set up flags or something for that sort of situation (which Archaeologist and stuff can change). (Archaeologist, Librarian, Combustible Lemon?)

- Then there are spells... they have an effect when they are cast... (so events)

- one problem I have is that I need to make sure events happen during the right phase, but I suppose that's the point of registering/deregistering event listeners.

- allcards.js has code for individual cards.

- cards have an array of functions, that are registered when they are placed on the battlefield and stuff like that

- stuff like battle sculpt and time warp are gonna be hard to implement, because they demand so much

- the plan is NOT A ZONE, cards in the battlefield that get planned, remain in the battlefield

- I don't think I'll have cards have an "owner", just because it's an unnecessary hassle

- speaking of standard events, they will include the following:
    - Change a card's values (that includes changing a cards area) (just a reminder, cards keep a record of their previous area, because bindings and actual         zones are treated the same) (this includes almost everything... adding mana, killing a card, binding a card, etc.)
    - Adding an action to the plan (of course this will be implemented as a heap, and the only things that go here are a card attacking, or a spell casting)
    - Change flags
    - New plan (for turns within turns (whyyyyyy))
    - Send a prompt to a player (this one doesn't really need to be confirmed, but probably should be anyways)
    - Data (sending data? ... I guess a prompt... but really I don't think sending prompts is a good idea, one side should initiate the prompt for itself
    - Selecting a card (so that things like star or chosen one can interfere... although I guess chosen one interference should really happen earlier)
    - 


I NEED TO FIGURE OUT HOW TO PROMPT THE PLAYER...

I'd rather not just stick an overlay over the screen, because that would just suck, but that might be the easiest way (transparent, of course)

I think I'll add focus covers... (what is terminology?) so it would darken everything around an area.
