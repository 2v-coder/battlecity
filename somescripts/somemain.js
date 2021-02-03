/*
	Made By Vahan Gevorgyan
	1990 "Battle City" copy with some changes.
	Every 20 seconds, 4 enemy tanks are spawning.
	The goal is to destroy all 4 of them and survive as many waves as possible.

	Controls:
	Movement: WASD, Arrows also work
	Fire: Space Button
	
	PS... Sorry for some awful parts of the code and bugs. 	

*/

// TO DO
// 1. Implement Collision (Done, I hope)
// 2. Add Bullets (Done)
// 3. Add Enemies (Done)
// 4. Add Winning Condition (Done)
// 5. Add Interval check (Done)

window.onload = (function () {
	// Texture Loads
	const brick = document.createElement('img');
	brick.src = 'https://i.pinimg.com/originals/ce/ef/5b/ceef5b4e92d1cc73e0468e495b70c131.png';
	const tank = document.createElement('img');
	tank.src = 'someassets/tank.png';
	const grass = document.createElement('img');
	grass.src = 'https://i.stack.imgur.com/A8BXP.png';
	const bullet = document.createElement('img');
	bullet.src = 'someassets/firebullet.png'
	const side = 50;
	const tank_side = 40;
	let wave = 1;
	const canvas = document.getElementById("some_canvas");
	const lives = document.getElementById('lives');
	const waveNumber = document.getElementById('waveN');
	const time_left = document.getElementById('time');
	const cur_score = document.getElementById('score');
	canvas.width = side * 13 
	canvas.height = side * 13
	const context = canvas.getContext("2d");
	let enemiesArr = [];
	let canX = true;
	let canY = true;
	let canSpawn = true;
	let enemiesKilled = 0;
	let time;
	let keyState = {}; 
	let data = {
		player: {
			lives: 3,
			xDelta: 0,
			yDelta: 0,
			startPoint: {
				x: 305,
				y: 560
			},
			speed: 2,
			direction: 'Up',
			bullets: [
				
			]

		}
	}
	let enemyCount = 20;
	let enemyPerWave = 4;
	let timer;	
	let score = 0;
	let won = false;
	// Level 1 Matrix
	const level1 = [
		[2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2],
		[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
		[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
		[1, 0, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 1],
		[1, 2, 2, 2, 0, 0, 0, 0, 0, 2, 2, 2, 1],
		[1, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 1],
		[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
		[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
		[2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2],
	]
	// Level 2 Matrix
	const level2 = [
		[5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
		[5, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 5],
		[5, 2, 0, 2, 0, 0, 0, 0, 0, 2, 0, 2, 5],
		[5, 2, 4, 2, 0, 2, 0, 2, 0, 2, 4, 2, 5],
		[5, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 5],
		[5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
		[5, 0, 2, 2, 0, 2, 0, 2, 0, 2, 2, 0, 5],
		[5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
		[5, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 5],
		[5, 2, 0, 2, 0, 2, 2, 2, 0, 2, 0, 2, 5],
		[5, 2, 4, 2, 0, 2, 0, 2, 0, 2, 4, 2, 5],
		[5, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 5],
		[5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
	]
	let cur_level = level2;
	function currentLevel() {
		return cur_level;
	}

	function random(min, max) {
	  return Math.floor(Math.random() * (max - min)) + min;
	}
    


	function EnemyTank(x,y) {
		// Add Collision Detection with player (Done)
		
		this.x = x;
		this.y = y;
		this.yDelta = 0;
		this.xDelta = 0;
		this.speed = 1;
		this.direction = 'Up';
		this.src = 'someassets/enemy.png';
		this.bullets = [];
		this.collisionDetection = function(level) {
			for(var y in level) {
				for(var x in level[y]) {
					if(level[y][x] != 0 && level[y][x] != 4) {
						if (this.x < x*side + side &&
						   this.x + tank_side > x*side &&
						   this.y < y*side + side &&
						   this.y + tank_side > y*side) {
							
						    return true;
						    
						}
					}  
				}
			}
		}

		this.move = function() {
			// AWFUL CODE
			if(this.direction == "Up") {
				if(!this.collisionDetection(currentLevel())) {
					this.y -= this.speed;

				} 
				if(this.collisionDetection(currentLevel())) {
					this.y += this.speed;
				}
			} else if(this.direction == "Down") {
				if(!this.collisionDetection(currentLevel())) {
					this.y += this.speed;	
				} 
				if(this.collisionDetection(currentLevel())) {
					this.y -= this.speed;
				}
			} else if(this.direction == "Right") {
				if(!this.collisionDetection(currentLevel())) {
					this.x += this.speed;	
				} 
				if(this.collisionDetection(currentLevel())) {
					this.x -= this.speed;
				}
			} else {
				if(!this.collisionDetection(currentLevel())) {
					this.x -= this.speed;	
				} 
				if(this.collisionDetection(currentLevel())) {
					this.x += this.speed;
				}
			}
 		}
 		

 		this.changeDirection = function() {
 			
 			let rand = Math.floor(Math.random() * 4);
			if(rand == 1) {
				this.direction = 'Up';
				this.src = 'someassets/enemy.png'
			} else if(rand == 2) {
				this.direction = 'Down';
				this.src = 'someassets/enemy_down.png'
			} else if(rand == 3) {
				this.direction = 'Left';
				this.src = 'someassets/enemy_left.png'
			} else if(rand == 4) {
				this.direction = 'Right';
				this.src = 'someassets/enemy_right.png'
			}
 		} 

	}
		
	
	function checkCollision(level) {
		for(var y in level) {
			for(var x in level[y]) {
				if(level[y][x] != 0 && level[y][x] != 4 && level[y][x] != 5) {
					if (data.player.startPoint.x < x*side + side &&
					   data.player.startPoint.x + tank_side > x*side &&
					   data.player.startPoint.y < y*side + side &&
					   data.player.startPoint.y + tank_side > y*side) {
						
					    return true;
					    
					}
				}  
			}
		}
	}

	function bulletEnvCollision(level) {
		data.player.bullets.forEach(function(bullet) {
			for(var y in level) {
				for(var x in level[y]) {
					if(level[y][x] != 0 && level[y][x] != 4 && level[y][x] != 5) {
						if (bullet.x < x*side + side &&
						   bullet.x + bullet.width > x*side &&
						   bullet.y < y*side + side &&
						   bullet.y + bullet.height > y*side) {
							
						   for(var i in data.player.bullets) {
						   		if(data.player.bullets[i] == bullet) {
						   			data.player.bullets.splice(i,1);
						   		}
						   }
						    
						}
					}  
				}
			}
		})
	}




	function generateLevel(matrix) {
		cur_level = matrix;
		for(var y in matrix) {
	        for(var x in matrix[y]) {
	            
	            if(matrix[y][x] == 1) {
	                context.drawImage(grass, x*side, y*side, side, side);
	            }
	            else if(matrix[y][x] == 2) {
	                context.drawImage(brick, x*side, y*side, side, side);
	            }
	            
	            
	        }
	    }

	    context.drawImage(tank, data.player.startPoint.x, data.player.startPoint.y, tank_side, tank_side);
	}

	function gameReload(level) {
		enemiesArr = [];
		enemyCount = 20;
		canSpawn = true;
		enemyPerWave = 4;
		wave = 1;
		score = 0;
		won = false;
		enemiesKilled = 0;
		time = 20;
		time_left.innerHTML = 'Time Left: ' + time;
		cur_score.innerHTML = 'Score: ' + score;
 		clearInterval(timer);
		timer = setInterval(function(){
			time--;
			if(time <= 0 && enemiesKilled != 4 && enemyCount != 0) {
				alert('Time out\nYour score is: ' + score)
				gameReload(currentLevel());
				
			}

			if(time <= 0 && enemiesKilled == 4) {
				time = 20;
				enemiesKilled = 0;
				enemyPerWave = 4;
				if(enemyPerWave > 0) {
					for(var y in cur_level) {
				        for(var x in cur_level[y]) {
				            if(cur_level[y][x] == 4) {
				            	enemiesArr.push(new EnemyTank(x*side, y*side));
				            	enemyPerWave--;
				            	
				       
				            	
				            }   
				        }
				    }
				    wave++;
				    //enemies_Left.innerHTML = 'Enemies Left: ' + enemyCount;
				    waveNumber.innerHTML = "Wave: " + wave;
				    console.log('Count: ' + enemyCount)
					console.log('Per Wave: ' + enemyPerWave)
				}
				
			}

			time_left.innerHTML = 'Time Left: ' + time;
		}, 1000)
		if(enemyPerWave > 0) {
			for(var y in cur_level) {
		        for(var x in cur_level[y]) {
		            if(cur_level[y][x] == 4) {
		            	enemiesArr.push(new EnemyTank(x*side, y*side));
		            	enemyPerWave--;
		    			

		            }   
		        }
		    }
		}
		//enemies_Left.innerHTML = 'Enemies Left: ' + enemyCount;
	    data.player.startPoint.x = 305;
	    data.player.startPoint.y = 560;
	    data.player.lives = 3;
	    lives.innerHTML = 'Lives: ' + data.player.lives
	    waveNumber.innerHTML = "Wave: " + wave;
	    data.player.yDelta = 0;
		data.player.xDelta = 0;
		tank.src = 'someassets/tank.png'
		keyState = {}
		console.clear();
		console.log('Welcome to Battle City');
		console.log('You have ' + data.player.lives + ' lives left')

	}

    function checkForLose() {
    	if(data.player.lives <= 0) {
    		alert('Game Over\nYour Score is: ' + score)
    		gameReload(currentLevel());

    	} else {
    		if(data.player.lives > 1) {

    			console.log('You lost. You have ' + data.player.lives + ' lives left')
    		} else {
    			console.log('You lost. You have ' + data.player.lives + ' live left')
    		}
    		lives.innerHTML = 'Lives: ' + data.player.lives
    	}
    }

	function enemyPlayerCollisionCheck(cur_level) {
		enemiesArr.forEach(function(enemy) {
			if(data.player.startPoint.x < enemy.x + tank_side && 
				data.player.startPoint.x + tank_side > enemy.x &&
				data.player.startPoint.y < enemy.y + tank_side && 
				data.player.startPoint.y + tank_side > enemy.y) {
				enemiesArr = [];
				//enemyCount = 20;
				enemiesKilled = 0;
				enemyPerWave = 4;
				if(enemyPerWave > 0) {
					for(var y in cur_level) {
				        for(var x in cur_level[y]) {
				            if(cur_level[y][x] == 4) {
				            	enemiesArr.push(new EnemyTank(x*side, y*side));
				            	enemyPerWave--;
				    			//enemyCount--;
				    		
				    			
				            }   
				        }
				    }
				}
			    data.player.startPoint.x = 305;
			    data.player.startPoint.y = 560;
			    time = 20;
			    if(score >= 70) {
			    	score -= 70;
			    } else {
			    	score = 0;
			    }
			    cur_score.innerHTML = 'Score: ' + score;
			    time_left.innerHTML = 'Time Left: ' + time;
			    data.player.yDelta = 0;
			    data.player.xDelta = 0;
			    data.player.lives--;

			    checkForLose();
			    
			}
		})
	}
	

	function enemyBulletCollision(cur_level) {
		enemiesArr.forEach(function(enemy) {
			data.player.bullets.forEach(function(bullet) {
				if(bullet.x < enemy.x + tank_side && 
					bullet.x + bullet.width > enemy.x &&
					bullet.y < enemy.y + tank_side && 
					bullet.y + bullet.height > enemy.y) {
					
				    for(var i in enemiesArr) {
				    	if(enemiesArr[i] == enemy) {
				    		enemiesArr.splice(i, 1)
				    		enemiesKilled += 1;
				    		// if(enemiesKilled == 4 && enemyCount == 0) {
				    		// 	alert('You Won')
				    		// 	enemiesKilled = 0;
				    		// 	won = true;
				    		// 	gameReload(currentLevel());
				    		// }
				    		// if(enemiesKilled >= 4) {
				    		// 	enemiesKilled = 0;
				    		// 	setTimeout(function() {
				    		// 		enemyPerWave = 4;
				    		// 	}, 2000)
				    		// }
				    		score += 25;
				    		cur_score.innerHTML = "Score: " + score;
				    	}
				    }
				    for(var i in data.player.bullets) {
				    	if(data.player.bullets[i] == bullet) {
				    		data.player.bullets.splice(i, 1);
				    	}
				    }
				    //lives.innerHTML = 'Lives: ' + data.player.lives
				    
				}
			})
		})
	}

	function update() {
		if(!checkCollision(currentLevel())) {
			data.player.startPoint.y += data.player.yDelta;
			data.player.startPoint.x += data.player.xDelta;
					
		} 
		if(checkCollision(currentLevel()) || data.player.startPoint.x + tank_side > canvas.width || data.player.startPoint.x < 0 || data.player.startPoint.y < 0 || data.player.startPoint.y + tank_side > canvas.height) {
			data.player.startPoint.y -= data.player.yDelta;
			data.player.startPoint.x -= data.player.xDelta;
		}

		
		enemyPlayerCollisionCheck(currentLevel());
		enemyBulletCollision(currentLevel());
		bulletEnvCollision(currentLevel());

		data.player.bullets = data.player.bullets.filter(function(bullet) {
			if(bullet.x > canvas.width || bullet.x < 0 || bullet.y < 0 || bullet.y > canvas.height) {
				return false;
			}
			
			return true;
		})




		data.player.bullets.forEach(function(bullet) {
			bullet.x += bullet.xDelta;
			bullet.y += bullet.yDelta;
		});






	}
	
	function draw() {
		
		context.clearRect(0, 0, canvas.width, canvas.height)
		generateLevel(cur_level);
		
		enemiesArr.forEach(function(enim) {
			let enemy = document.createElement('img');
			enemy.src = enim.src
			context.drawImage(enemy, enim.x, enim.y, tank_side, tank_side)
			enim.move();
		})

		data.player.bullets.forEach(function(blt) {
			context.drawImage(bullet, blt.x, blt.y, blt.width, blt.height) 
		});
	}
	gameReload();
    setInterval(function() {
    	enemiesArr.forEach(function(enim) {
    		enim.changeDirection();

    	})
    }, random(500, 2000))
	
    // setInterval(function() {	
		
		
    // }, random(2000, 5000))

	function loop() {
		requestAnimationFrame(loop);
		update();
		draw();
	}
	loop();
	
	
	document.addEventListener("keydown", function(e) {
		if(e.keyCode == 32) {
			if(data.player.direction == 'Up') {
				data.player.bullets.push(
		    		{
						xDelta: 0,
						yDelta: -4,
						x: data.player.startPoint.x + tank_side/2 - 2,
						y: data.player.startPoint.y - tank_side/2,
						width: 5,
						height: 10
					}
	    		)
			}
			else if(data.player.direction == "Down") {
				data.player.bullets.push(
		    		{
						xDelta: 0,
						yDelta: 4,
						x: data.player.startPoint.x + tank_side / 2 - 3,
						y: data.player.startPoint.y + tank_side + 5,
						width: 5,
						height: 10
					}
	    		)
			}
			else if(data.player.direction == "Right") {
				data.player.bullets.push(
		    		{
						xDelta: 4,
						yDelta: 0,
						x: data.player.startPoint.x + tank_side + 5,
						y: data.player.startPoint.y + tank_side/2 - 3,
						width: 10,
						height: 5
					}
	    		)
			}
			else if(data.player.direction == "Left") {
				data.player.bullets.push(
		    		{
						xDelta: -4,
						yDelta: 0,
						x: data.player.startPoint.x - 10,
						y: data.player.startPoint.y + tank_side/2 - 3,
						width: 10,
						height: 5
					}
	    		)
			}
		}
		else {
			keyState[e.keyCode || e.which] = true; 
		}	
	})
	
	function movementLoop() {
		if (keyState[39] || keyState[68]){
        	if(canX) {
				if(data.player.yDelta != 0) {
					data.player.yDelta = 0;
				}
				data.player.xDelta = data.player.speed;
				tank.src = 'someassets/tank_right.png'
				data.player.direction = 'Right';
				canY = false;
			}	    
		}    
	    if (keyState[37] || keyState[65]){
	        if(canX) {
				if(data.player.yDelta != 0) {
					data.player.yDelta = 0;
				}
				data.player.xDelta = -data.player.speed;
				tank.src = 'someassets/tank_left.png'
				data.player.direction = 'Left';
				canY = false;
			}
	    }
	    if(keyState[38] || keyState[87]) {
	    	if(canY) {
				if(data.player.xDelta != 0) {
					data.player.xDelta = 0;
				}
				data.player.yDelta = -data.player.speed;
				tank.src = 'someassets/tank.png'
				data.player.direction = 'Up';
				canX = false;
			}
	    }
	    if(keyState[40] || keyState[83]) {
	    	if(canY) {
				if(data.player.xDelta != 0) {
					data.player.xDelta = 0;
				}
				data.player.yDelta = data.player.speed;
				tank.src = 'someassets/tank_down.png'
				data.player.direction = 'Down';


				canX = false;
			}
	    }
	    
	    setTimeout(movementLoop, 10);
	}
	movementLoop();
	document.addEventListener("keyup", function(e) {
		keyState[e.keyCode || e.which] = false;
		data.player.xDelta = 0;
		data.player.yDelta = 0;
		canY = true;
		canX = true;
	})
});
