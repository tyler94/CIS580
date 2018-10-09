
    var HEIGHT = 750;
    var WIDTH = 750;
    var gamescreen = document.createElement('canvas');
		var start = null;
		var laserNoise = new Audio("./Laser_Shoot5.wav");
		var bumpNoise = new Audio("./Hit_Hurt4.wav");
		var explosionNoise = new Audio("./Explosion3.wav");
		var deathNoise = new Audio("./Explosion.wav");
    screenCtx = gamescreen.getContext('2d');
    gamescreen.height = HEIGHT;
    gamescreen.width = WIDTH;

    var backBuffer = document.createElement('canvas');
    backBufferCtx  = gamescreen.getContext('2d');
    backBuffer.height = HEIGHT;
    backBuffer.width = WIDTH;

    document.body.appendChild(gamescreen);
    var currentInput = {
        space: false,
        left: false,
        right: false,
        up: false,
        reset: false
    }

    var prevInput = {
        space: false,
        left: false,
        right: false,
        up: false,
        reset: false
    }

		var gameMatrix = new Matrix(2, 3);
    var asteroids = [];
    var lives = 3;
    var gameOver = false;
    var asteroidReserves = 3;
    var score = 0;
    var asteroidInterval;
		var player = new PlayerShip();
		var currentLevel = 0

	//resets player position and lives. Then spawns asteroids
  function reset(){
			currentLevel += 1
	    player = new PlayerShip();
      asteroids = [];
      lives = 3;
      gameOver = false;
      asteroidReserves = currentLevel + 2;
		
		for (var i = 0; i < asteroidReserves; i++) {
		  var x = Math.random() * WIDTH;
		  var y = Math.random() * HEIGHT;
		  var velocityx = Math.random() * 4 - 2;
		  var velocityy = Math.random() * 4 - 2;
		  var velocityrotation = Math.random() * 2 - 1;
		  asteroids.push(new Asteroid(i, x, y, velocityx, velocityy, velocityrotation, 8));
		}
	}

  reset();

    /** @function handleKeydown
  * Event handler for keydown events
  * @param {KeyEvent} event - the keydown event
  */
function handleKeydown(event) {
    switch(event.key) {
      case ' ':
        currentInput.space = true;
        break;
      case 'ArrowLeft':
      case 'a':
        currentInput.left = true;
        break;
      case 'ArrowRight':
      case 'd':
        currentInput.right = true;
        break;
	  case 'ArrowUp':
      case 'w':
        currentInput.up = true;
        break;
      case 'r':
        currentInput.reset = true;
        break;  
    }
  }
  // Attach keyup event handler to the window
  window.addEventListener('keydown', handleKeydown);
  
  /** @function handleKeyup
    * Event handler for keyup events
    * @param {KeyEvent} event - the keyup event
    */
  function handleKeyup(event) {
    switch(event.key) {
      case ' ':
        currentInput.space = false;
        break;
      case 'ArrowLeft':
      case 'a':
        currentInput.left = false;
        break;
      case 'ArrowRight':
      case 'd':
        currentInput.right = false;
        break;
	  case 'ArrowUp':
      case 'w':
        currentInput.up = false;
        break;
      case 'r':
        currentInput.reset = false;
        break;
    }
  }
  // Attach keyup event handler to the window
  window.addEventListener('keyup', handleKeyup);

	  //update game object positions and reset it the player presses 'r'
    function update(elapsedTime){
        if(currentInput.reset) {
						score = 0;
						currentLevel = 0;
            reset();
				}
				
				player.update(elapsedTime/30);

        player.bullets.forEach(function(bullet, index){
            bullet.update(elapsedTime/30);
				});
				
				asteroids.forEach(function(asteroid, key){
					asteroid.update(elapsedTime/30);
        });
    }

		//render the game world, display text restart if there is a game over
    function render(context){
        if(gameOver){
                context.fillStyle="#ff0000";
                context.font = "50px Arial";
                context.fillText("Game Over",240,350);
                context.font = "30px Arial";
                context.fillText("You Lose!",300,400);
            
            context.font = "15px Arial";
            context.fillText("(press 'r' to restart)",300,450);
        }
        else{
						context.clearRect(0,0,WIDTH,HEIGHT);
						context.fillStyle="#000000";
						context.fillRect(0, 0, WIDTH, HEIGHT)
						context.font = "15px Arial";
						context.fillStyle="#ff0000";
            context.fillText("Level: " + currentLevel ,10,730);
            context.fillText("Score: " + score, 360,730);
            context.fillText("Lives: " + lives, 680,730);
						player.render(context);
            player.bullets.forEach(function(bullet){
                bullet.render(context);
            });
            asteroids.forEach(function(asteroid){
                asteroid.render(context);
            });
        }
    }

		//main game loop
    function loop(timestamp) {
        if(!start) start = timestamp;
        var elapsedTime = timestamp - start;
        start = timestamp;
        update(elapsedTime);
        render(backBufferCtx);
        screenCtx.drawImage(backBuffer,0,0);
        copyInput();
        window.requestAnimationFrame(loop);
      }

    /** @function copyInput
     * Copies the current input into the previous input
     */
    function copyInput() {
        prevInput = JSON.parse(JSON.stringify(currentInput));
    }
    requestAnimationFrame(loop);

		//bullet class
		function Bullet(index, x, y, velocityx, velocityy) {
			this.points = [0, 0];
			
			this.x = x;
			this.y = y;
			this.time = 0;
			this.index = index;
			this.context = backBufferCtx;
			
			this.vel = {
					x:   velocityx,
					y:   velocityy,
					rot: 0
				};
    }
			
	  //update the bullet position. remove from the game after it has been on screen for a certain amount of time
    Bullet.prototype.update = function(deltaT) {
        
		this.time += deltaT;
		
		if (this.time > 80) {
			player.bullets.splice(this.index, 1);
		  this.visible = false;
		  this.time = 0;
		}

		for (var j = 0; j < player.bullets.length; j++) {
			player.bullets[j].index = j;
		}
		
		this.x += this.vel.x * deltaT;
		this.y += this.vel.y * deltaT;
		
		//screen wrap
		if(this.x > WIDTH){
			this.x = 1;
		}
		if(this.x < 0){
			this.x = WIDTH -1;
		}
		if(this.y > HEIGHT){
			this.y = 1;
		}
		if(this.y < 0){
			this.y = HEIGHT -1;
		}
      }
			
		//render the bullet
		Bullet.prototype.render = function(context) {
			context.save();
			context.strokeStyle = '#f8ff2d';
		  context.lineWidth = 6;
		  context.beginPath();
		  context.moveTo(this.x-1, this.y-1);
		  context.lineTo(this.x+1, this.y+1);
		  context.moveTo(this.x+1, this.y-1);
		  context.lineTo(this.x-1, this.y+1);
		  context.stroke();
		  context.restore();
		}


		//asteroid class
		function Asteroid(index, x, y, velocityx, velocityy, velocityrotation, scale) {
				this.points = [-10, 0, -3, 4, 1, 6, 5, 10, 8, -2, 8, -6, -2, -8, -4, -5];
								
				this.x = x;
				this.y = y;
				this.rot = 0
				this.index = index;
				this.context = backBufferCtx;
								
				this.vel = {
						x:   velocityx,
						y:   velocityy,
						rot: velocityrotation
				};
				
				this.scale = scale;
			
    }
			
		//update asteroid position
		Asteroid.prototype.update = function(deltaT) {
				
				this.x += this.vel.x * deltaT;
				this.y += this.vel.y * deltaT;
				this.rot += this.vel.rot * deltaT;
				if (this.rot > 360) {
					this.rot -= 360;
				} else if (this.rot < 0) {
					this.rot += 360;
				}
				
				if(this.x > WIDTH){
					this.x = 1;
				}
				if(this.x < 0){
					this.x = WIDTH -1;
				}
				if(this.y > HEIGHT){
					this.y = 1;
				}
				if(this.y < 0){
					this.y = HEIGHT -1;
				}
		}
			
	  //render asteroids and check for collisions, collision detection is part of asteroids because they collide with everything
		Asteroid.prototype.render = function(context) {
				context.save();
				
				var rad = (this.rot * Math.PI)/180;

				context.translate(this.x, this.y);
				context.rotate(rad);
				context.scale(this.scale, this.scale);
				context.strokeStyle = '#3c11fc';
				context.lineWidth = 2;
				context.beginPath();

				context.moveTo(this.points[0], this.points[1]);
				for (var i = 1; i < this.points.length/2; i++) {
					var xi = i*2;
					var yi = xi + 1;
					context.lineTo(this.points[xi], this.points[yi]);
				}
				context.closePath();
				context.stroke();
				context.fillStyle = '#3c11fc';
				context.fill();

				//check for collision w/ bullets
				for (var i = 0; i < player.bullets.length; i++) {
					rotPoints = getRotatedPoints(player.bullets[i].x, player.bullets[i].y, player.bullets[i].points, 1, 0);
					var count = rotPoints.length/2;
					for (var j = 0; j < count; j++) {
						px = rotPoints[j*2];
						py = rotPoints[j*2 + 1];
						if (context.isPointInPath(px, py)) {
						player.bullets.splice(i, 1);
						this.explode()
						}
					}
				}

				//check for collision w/ other asteroids
				for (var i = 0; i < asteroids.length; i++) {
					if(asteroids[i].index !== this.index){
						rotPoints = getRotatedPoints(asteroids[i].x, asteroids[i].y, asteroids[i].points, asteroids[i].scale, asteroids[i].rot);
						var count = rotPoints.length/2;
						for (var j = 0; j < count; j++) {
							px = rotPoints[j*2];
							py = rotPoints[j*2 + 1];
							if (context.isPointInPath(px, py)) {
								bumpNoise.play();
								this.vel.x *= -1;
								this.vel.y *= -1;
								asteroids[i].vel.x *= -1;
								asteroids[i].vel.y *= -1;
							}
						}
					}
				}

				//check for collision w/ the player
					rotPoints = getRotatedPoints(player.x, player.y, player.points, 1, player.rot);
					var count = rotPoints.length/2;
					for (var j = 0; j < count; j++) {
						px = rotPoints[j*2];
						py = rotPoints[j*2 + 1];
						if (context.isPointInPath(px, py)) {
						this.explode();
						if(!player.invincible){
							player.die();
						}
						}
					}

				context.restore();
		}
		
		//break asteroid down into smaller pieces or destroy it completely if it is the smallest size
	  Asteroid.prototype.explode = function() {
			explosionNoise.play();
			score += 100*this.scale;
			this.scale /= 2;
			asteroids.splice(this.index, 1);
			if (this.scale > 1) {
				for (var i = 0; i < 2; i++) {
					if(i == 0){
						var x = this.x + 50;
						var y = this.y + 50;
					}
					else{
						var x = this.x - 50;
						var y = this.y - 50;
					}
					
					var velocityx = Math.random() * 4 - 2;
					var velocityy = Math.random() * 4 - 2;
					var velocityrotation = Math.random() * 2 - 1;
					asteroids.push(new Asteroid(asteroids.length + i, x, y, velocityx, velocityy, velocityrotation, this.scale));
				}
				
			}
			for (var j = 0; j < asteroids.length; j++) {
				asteroids[j].index = j;
			}
			if(asteroids.length <= 0){
				score += 1000;
				reset();
			}
	   }
		
	//class for the player ship
	function PlayerShip() {
		this.points = [-6, 5, 0, -10, 6, 5];
							
			this.x = 375;
			this.y = 375;
			this.rot = 0;
			this.invincible = false;
							
			this.vel = {
					x:   0,
					y:   0,
					rot: 0
				};

			this.acc = {
					x:   0,
					y:   0,
					rot: 0
				};
				
			this.context = backBufferCtx;
				
			this.bullets = [];

	};
		

	PlayerShip.prototype.update = function(deltaT) {
			this.vel.rot = 0;
			
					if(currentInput.space && !prevInput.space) {
					var rad = ((this.rot-90) * Math.PI)/180;
					var vectorx = Math.cos(rad);
					var vectory = Math.sin(rad);
							laserNoise.play();
							this.bullets.push(new Bullet(this.bullets.length, this.x + vectorx * 4, this.y + vectory * 4, 6 * vectorx + this.vel.x, 6 * vectory + this.vel.y));
					}
					if(currentInput.right){
							this.vel.rot = 6;
					}
					if(currentInput.left){
							this.vel.rot = -6;
					}
			if(currentInput.up){
						var rad = ((this.rot-90) * Math.PI)/180;
				this.acc.x = 0.5 * Math.cos(rad);
				this.acc.y = 0.5 * Math.sin(rad);
					}
			else {
				this.acc.x = 0;
				this.acc.y = 0;
			}
			
			this.vel.x += this.acc.x * deltaT;
			this.vel.y += this.acc.y * deltaT;
			this.x += this.vel.x * deltaT;
			this.y += this.vel.y * deltaT;
			this.rot += this.vel.rot * deltaT;
			if (this.rot > 360) {
				this.rot -= 360;
			} else if (this.rot < 0) {
				this.rot += 360;
			}
			
			
			if(this.x > WIDTH){
				this.x = 1;
			}
			if(this.x < 0){
				this.x = WIDTH -1;
			}
			if(this.y > HEIGHT){
				this.y = 1;
			}
			if(this.y < 0){
				this.y = HEIGHT -1;
			}
			// prevent ship from speeding up infinitely
			if (Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y) > 8) {
				this.vel.x *= 0.95;
				this.vel.y *= 0.95;
			}
	}
				
	PlayerShip.prototype.render = function(context) {
			context.save();
			
				var rad = (this.rot * Math.PI)/180;

			context.translate(this.x, this.y);
			context.rotate(rad);
			if(this.invincible){
				context.strokeStyle = '#f8ff2d';
				context.lineWidth = 8;
			}
			else{
				context.strokeStyle = '#42f4d4';
				context.lineWidth = 2;
			}
							
			context.beginPath();

			context.moveTo(this.points[0], this.points[1]);
			for (var i = 1; i < this.points.length/2; i++) {
				var xi = i*2;
				var yi = xi + 1;
				context.lineTo(this.points[xi], this.points[yi]);
			}
			context.closePath();
			context.stroke();
			context.fillStyle = '#42f4d4';
			context.fill();
			context.restore();
	}

	//handles player death: subtracts a life and resets position, turns on temporary invincibility in case there are asteroids at the spawn point
	PlayerShip.prototype.die = function() {
		deathNoise.play();
		lives -= 1;
		if(lives <= 0){
			gameOver = true;
		}
		else{
			this.x = 375;
			this.y = 375;
			this.rot = 0;
							
			this.vel = {
					x:   0,
					y:   0,
					rot: 0
				};

			this.acc = {
					x:   0,
					y:   0,
					rot: 0
				};
			player.invincible = true;
			setTimeout(() => {
				player.invincible = false;
			}, 3000);

		}
	}

 	//Matrix class that is used to handle the position of objects during collision detection, this was adapted from several examples found online.
	 function Matrix(rows, columns) {
	  var i, j;
	  this.data = new Array(rows);
	  for (i = 0; i < rows; i++) {
		this.data[i] = new Array(columns);
	  }

	  this.configure = function (rot, scale, transx, transy) {
		var rad = (rot * Math.PI)/180;
		var sin = Math.sin(rad) * scale;
		var cos = Math.cos(rad) * scale;
		this.set(cos, -sin, transx,
				 sin,  cos, transy);
		};
		
		this.set = function () {
			var k = 0;
			for (i = 0; i < rows; i++) {
				for (j = 0; j < columns; j++) {
				this.data[i][j] = arguments[k];
				k++;
				}
			}
			}

	  this.multiply = function () {
		var vector = new Array(rows);
		for (i = 0; i < rows; i++) {
		  vector[i] = 0;
		  for (j = 0; j < columns; j++) {
			vector[i] += this.data[i][j] * arguments[j];
		  }
		}
		return vector;
	  };
	};

	//uses the game matrix to determine the points to check with the asteroid
	function getRotatedPoints(x, y, points, scale, rotation) {
		var rotPoints = new Array(points.length);
		gameMatrix.configure(rotation, scale, x, y);
		for (var i = 0; i < points.length/2; i++) {
			var xi = i*2;
			var yi = xi + 1;
			var pts = gameMatrix.multiply(points[xi], points[yi], 1);
			rotPoints[xi] = pts[0];
			rotPoints[yi] = pts[1];
		}
		return rotPoints;
	};