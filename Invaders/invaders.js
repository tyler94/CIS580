
    var HEIGHT = 740;
    var WIDTH = 480;
    var gamescreen = document.createElement('canvas');
    var start = null;
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
        reset: false
    }

    var prevInput = {
        space: false,
        left: false,
        right: false,
        reset: false
    }

    var x = 240;
    var y = 680;
    var bullets = [];
    var enemies = [];
    var lives = 3;
    var gameOver = false;
    var enemyReserves = 20;
    var score = 0;
    var enemyInterval;

    function reset(){
        x = 240;
        y = 680;
        bullets = [];
        enemies = [];
        lives = 3;
        gameOver = false;
        enemyReserves = 20;
        score = 0;

        enemyInterval = setInterval(function(){  
            if(enemies.length < 5 && enemyReserves > 0){
                enemies.push(new Enemy(10, 10));
                enemyReserves--; 
            }
            else if (enemies.length === 0 && enemyReserves === 0){
                clearInterval(enemyInterval);
                winLose = 'win';
                gameOver = true;
            }
            enemies.forEach(function(enemy, key){
                enemy.update();
                // enemy.bullets.forEach(function(bullet, index){
                //     bullet.checkCollision(bullet.x, bullet.y, bullet.r, index, enemy);
                // });
            });
        }, 300);
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
      console.log(currentInput, prevInput)
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
      case 'r':
        currentInput.reset = false;
        break;
    }
  }
  // Attach keyup event handler to the window
  window.addEventListener('keyup', handleKeyup);

    function update(elapsedTime){
        if(currentInput.reset) {
            clearInterval(enemyInterval);
            reset();
        }
        if(currentInput.space && !prevInput.space && bullets.length < 3) {
                bullets.push(new Bullet(x+10, y-11, 5));
        }
        if(currentInput.right){
            x +=0.1*elapsedTime //move right
        }
        if(currentInput.left){
            x -=0.1*elapsedTime //move right
        }
        bullets.forEach(function(bullet, index){
            bullet.checkCollision(bullet.x, bullet.y, bullet.r, index);
            bullet.update(elapsedTime);
        });
        enemies.forEach(function(enemy, key){
            enemy.bullets.forEach(function(bullet, index){
                bullet.checkCollision(bullet.x, bullet.y, bullet.r, index, enemy);
                bullet.update(elapsedTime);
            });
        });
    }

    function render(context){
        if(gameOver){
            if(winLose === 'win'){
                context.fillStyle="green";
                context.font = "50px Arial";
                context.fillText("Game Over",120,350);
                context.font = "30px Arial";
                context.fillText("You Win!",180,400);
            }
            else{
                context.fillStyle="#ff0000";
                context.font = "50px Arial";
                context.fillText("Game Over",120,350);
                context.font = "30px Arial";
                context.fillText("You Lose!",180,400);
            }
            context.font = "15px Arial";
            context.fillText("(press 'r' to restart)",170,450);
        }
        else{
            context.clearRect(0,0,WIDTH,HEIGHT);
            context.font = "15px Arial";
            context.fillText("Enemy Reserves: " + enemyReserves,10,730);
            context.fillText("Score: " + score, 230,730);
            context.fillText("Lives: " + lives, 400,730);
            context.fillStyle="#ff0000";
            context.fillRect(x,y,20,20);
            bullets.forEach(function(bullet){
                bullet.render(context);
              });
              enemies.forEach(function(enemy){
                enemy.render(context);
                enemy.bullets.forEach(function(bullet){
                    bullet.render(context);
                  });
              });
        }
    }

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

      function Bullet(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
      }
      
      Bullet.prototype.update = function(deltaT) {
        this.y -= deltaT * 0.5;
      }
      
      Bullet.prototype.render = function(context) {
        context.beginPath();
        context.fillStyle = 'green';
        context.arc(this.x - this.r, this.y - this.r, 2*this.r, 2*this.r, 0, 2 * Math.pi);
        context.fill();
      }

      Bullet.prototype.checkCollision = function(myx, myy, myr, bulletIndex) {
          console.log(bullets);

        if(myy <= 0 + myr){ 
            bullets.splice(bulletIndex, 1);
        }
        else{
            enemies.forEach(function(enemy, key){

                var distX = Math.abs(myx - enemy.x-10);
                var distY = Math.abs(myy - enemy.y-10);
                var dx = distX-10;
                var dy = distY-10;
    
                if(distX <= 10 && distY <= 10 || (dx*dx+dy*dy <= (this.r*this.r))){
                    enemies.splice(key, 1);
                    bullets.splice(bulletIndex, 1);
                    score += 100;
                }
    
            //     enemy.bullets.forEach(function(bullet, index){
            //     if(Math.pow((myr + bullet.r), 2) <= Math.pow((this.x - bullet.x), 2) + Math.pow((this.y - bullet.y), 2)){
            //         enemy.bullets.splice(index, 1);
            //         bullets.splice(bulletIndex, 1);
            //     }
            // });
            });
        }
    }

      function Enemy(x, y) {
        this.x = x;
        this.y = y;
        this.direction = 'right';
        this.bullets = [];
      }
      
      //move the enemy and randomly fire shots at the player, end game if the enemy reaches the player
      Enemy.prototype.update = function() {
        var shootChance = Math.floor(Math.random() * 101); 
        if(this.direction === 'right'){
            if(this.x >= WIDTH-20){
                this.y += 30;
                this.direction = 'left';
            }
            else{
                this.x += 30;
            }
        }
        else{
            if(this.x <= 10){
                this.y += 30;
                this.direction = 'right';
            }
            else{
                this.x -= 30;
            } 
        }
        if(shootChance >=99){
            console.log('fire!!!')
            this.bullets.push(new EnemyBullet(this.x+10, this.y+11, 5));
        }
        if(this.y >= y-10){
            clearInterval(enemyInterval);
            winLose = 'lose';
            gameOver = true;
        }
      }
      
      Enemy.prototype.render = function(context) {
        context.fillStyle="#ff0000";
        context.fillRect(this.x,this.y,20,20);
      }

      function EnemyBullet(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
      }
      
      EnemyBullet.prototype.update = function(deltaT) {
        this.y += deltaT * 0.2;
      }
      
      EnemyBullet.prototype.render = function(context) {
        context.beginPath();
        context.fillStyle = 'blue';
        context.arc(this.x - this.r, this.y - this.r, 2*this.r, 2*this.r, 0, 2 * Math.pi);
        context.fill();
      }

      EnemyBullet.prototype.checkCollision = function(myx, myy, myr, bulletIndex, enemy) {

        // check to see if bullet is off-screen
        if(myy >= HEIGHT + myr){
            enemy.bullets.splice(bulletIndex, 1);
        }
        else{
            var distX = Math.abs(myx - x-10);
            var distY = Math.abs(myy - y-10);
            var dx = distX-10;
            var dy = distY-10;

            if(distX <= 10 && distY <= 10 || (dx*dx+dy*dy <= (this.r*this.r))){
                enemy.bullets.splice(bulletIndex, 1);
                if(lives > 1){
                    lives--;
                }
                else{
                    clearInterval(enemyInterval);
                    lives = 0;
                    winLose = 'lose';
                    gameOver = true;
                }
                console.log(lives);
            }
        } 

        

    }