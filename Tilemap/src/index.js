import Game from './game';
import Player from './player';

// Create the game
 var game = new Game(1344, 960);
//var game = new Game(2000, 2000);

// Create the player and add it to the game
game.addEntity(new Player(155, 580));

// Start the main game loop
game.loop();
