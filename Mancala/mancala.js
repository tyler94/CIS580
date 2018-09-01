
   var lslots = [4, 4, 4, 4, 4, 4, 0];
   var rslots = [4, 4, 4, 4, 4, 4, 0];

    var currentTurn = 'player 1';

//reset the board for a new game
function resetBoard(){
    lslots = [4, 4, 4, 4, 4, 4, 0];
    rslots = [4, 4, 4, 4, 4, 4, 0];
    currentTurn = 'player 1';
    document.getElementById('board').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('header-text').innerHTML = "Mancala"
    document.getElementById('alert-messages').classList.remove('hidden');
    document.getElementById('alert-messages').innerHTML = "It is " + currentTurn + "'s turn"
    updateBoard();
}

//moves the pebbles around the board or displays a message if it is not their turn
function move(turn, slot) {
    var turnOriginal = turn;
    var numpebbles = 0;
    var opponentSide = '';
	if(turn === currentTurn){
		if(turn === 'player 1'){
			numpebbles = rslots[slot];
			opponentSide = 'player 2';
			rslots[slot] = 0;
		}
		else if(turn === 'player 2'){
			numpebbles = lslots[slot];
			opponentSide = 'player 1';
			lslots[slot] = 0;
		}
		
		for(var i = 1; i <= numpebbles; i++){
			if(i === numpebbles){
				handleEnd(turn, turnOriginal, opponentSide, slot+i); 
			}
			else{
				if(slot + i === 6){
                    addPebble(turn, slot+i);
					slot = 0;
					numpebbles = numpebbles - i;
					i = 0;
					var temp = turn;
					turn = opponentSide;
                    opponentSide = temp;
                    if(i + 1 === numpebbles){
                        handleEnd(turn, turnOriginal, opponentSide, slot+i);
                        break; 
                    }
                    else{
                        addPebble(turn, slot+i);
                        numpebbles--;
                    }
				}
				else if (slot + i < 6){
					addPebble(turn, slot+i);
				}
			}
		}
	}
	else{
	document.getElementById('alert-messages').innerHTML = "<h2>Please wait until your turn!</h2>";
		setTimeout(function(){ document.getElementById('alert-messages').innerHTML = "It is " + currentTurn + "'s turn";}, 3000);
	
	}
    
}

//handles the end of a turn depending on whose turn it was and where the last pebble landed, then calls checkBoard
function handleEnd(turn, turnOriginal, opponentSide, endSlot) {
    if(turn !== turnOriginal && endSlot !== 6){
        //ending on opponent's side, simply add the pebble
        addPebble(turn, endSlot);
        currentTurn = turn;
    }
    else if(turn !== turnOriginal && endSlot === 6){
        //loop back around and put last pebble in first slot
        handleEnd(turnOriginal, turnOriginal, opponentSide, 0);
        currentTurn = turn;
    }
    else{
        if(turn === 'player 2'){
            if(lslots[endSlot] === 0 && endSlot !== 6 && rslots[5-endSlot] > 0){
                lslots[6] += rslots[5-endSlot] + 1
                rslots[5-endSlot] = 0;
                currentTurn = 'player 1';
            }
            else if(lslots[endSlot] === 0 && endSlot !== 6 && rslots[5-endSlot] === 0){
                addPebble(turn, endSlot);
                currentTurn = 'player 1';
            }
            else if(endSlot === 6){
                addPebble(turn, endSlot);
                currentTurn = 'player 2';
            }
            else{
                addPebble(turn, endSlot);
                currentTurn = 'player 1';
            }
        }
        else{
            if(rslots[endSlot] === 0 && endSlot !== 6 && lslots[5-endSlot] > 0){
                rslots[6] += lslots[5-endSlot] + 1
                lslots[5-endSlot] = 0;
                currentTurn = 'player 2';
            }
            else if(rslots[endSlot] === 0 && endSlot !== 6 && lslots[5-endSlot] === 0){
                addPebble(turn, endSlot);
                currentTurn = 'player 2';
            }
            else if(endSlot === 6){
                addPebble(turn, endSlot);
                currentTurn = 'player 1';
            }
            else{
                addPebble(turn, endSlot);
                currentTurn = 'player 2';
            }
        }
    }
    checkBoard();
}

//add a pebble to a slot
function addPebble(turn, slot){
    if(turn === 'player 2'){
        lslots[slot] += 1;
    }
    else if (turn === 'player 1'){
        rslots[slot] += 1;
    }
}

//check if either player has no more pebbles and if so end the game
function checkBoard(){
    var allZeroes1 = true;
    var allZeroes2 = true;
    console.log(lslots);
    console.log(rslots);
    console.log(currentTurn);
    for(var i = 0; i < 6; i++){
        if(lslots[i] !== 0){
            allZeroes1 = false;
        }
        if(rslots[i] !== 0){
            allZeroes2 = false;
        }
    }
    if(allZeroes1 || allZeroes2){
        console.log('all zeroes');
        for(var i = 0; i < 6; i++){
            lslots[6] += lslots[i];
            lslots[i] = 0;
            rslots[6] += rslots[i];
            rslots[i] = 0;
        }
        if(lslots[6] > rslots[6]){
            declareWinner('player 2');
        }
        else if(lslots[6] < rslots[6]){
            declareWinner('player 1');
        }
        else if(lslots[6] < rslots[6]){
            declareDraw();
        }
    }
    else{
        updateBoard();
    }
}

//update the view of the board
function updateBoard(){
    for(var i = 0; i < 7; i++){
        document.getElementById('l'+ i.toString()).innerHTML = lslots[i];
        document.getElementById('r'+ i.toString()).innerHTML = rslots[i];
        document.getElementById('l'+ i.toString() + '-pebbles').innerHTML = '';
        document.getElementById('r'+ i.toString() + '-pebbles').innerHTML = '';

        for(var j = 0; j < lslots[i]; j++){
            var node = document.createElement("span");
            var textnode = document.createTextNode(".");
            node.appendChild(textnode);
            node.classList.add('p2-pebble');
            document.getElementById('l'+ i.toString() + '-pebbles').appendChild(node);
        }

        for(var j = 0; j < rslots[i]; j++){
            var node = document.createElement("span");
            var textnode = document.createTextNode(".");
            node.appendChild(textnode);
            node.classList.add('p1-pebble');
            document.getElementById('r'+ i.toString() + '-pebbles').appendChild(node);
        }

    }
    document.getElementById('l6').innerHTML = lslots[6];
    document.getElementById('r6').innerHTML = rslots[6];
    document.getElementById('alert-messages').innerHTML = "It is " + currentTurn + "'s turn"
}

//hide board and show the game over screen
function declareWinner(winner){
    document.getElementById('board').classList.add('hidden');
    document.getElementById('alert-messages').classList.add('hidden');
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('header-text').innerHTML = winner + " wins!";
    if(winner === 'player 1'){
        document.getElementById('reset-button').classList.add('p1-reset');
    }
    else{
        document.getElementById('reset-button').classList.add('p2-reset');
    }
    
    document.getElementById('p2-score').innerHTML = lslots[6];
    document.getElementById('p1-score').innerHTML = rslots[6];
}

//hide board and show the draw game screen
function declareDraw(){
    document.getElementById('board').classList.add('hidden');
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('header-text').innerHTML = "Draw Game!"
}

resetBoard();