;
(function() {
	'use strict';

	/*** Constants ***/
	const BLOCKSIZE = 64;
	const MV_SPD = 4;
	const ATT_TM = {
		up: 250, // Uptime
		cd: 50 // Cooldown
	};
	const PLYR_INT = {
		x: 7,
		y: 7
	};

	/*** Global vars ***/
	var screenObjects = [];
	var player;
	var myGameArea = {
		// Get the correct element from the HTML
		canvas: document.getElementById('canvas'),

		// Init
		start: function(width, height) {
			// Set dimensions
			this.canvas.width = width * BLOCKSIZE;
			this.canvas.height = height * BLOCKSIZE;
			this.context = this.canvas.getContext("2d");

			// Animation
			this.interval = setInterval(updateGameArea, 20);

			// Interactivity events
			window.addEventListener('keydown', function(e) {
				e.preventDefault();
				myGameArea.keys = (myGameArea.keys || []);
				myGameArea.keys[e.keyCode] = (e.type == 'keydown');
			});
			window.addEventListener('keyup', function(e) {
				myGameArea.keys[e.keyCode] = (e.type == 'keydown');
			});
		},

		// Stop animating
		stop: function() {
			clearInterval(this.interval);
		},

		// Empty the field
		clear: function() {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
	};

	/*** Simple functions ***/
	/**
	 * returns where a point is located (vertically) in perspective with a line.
	 * @param  {object}  arg{x1,x2,y1,y2 describe points of the line; px,py of the to evaluate point}
	 * @return {integer} -1 when under, 0 when on top, 1 when above   
	 */
	var isAboveLine = function(arg) {
		var y = (((arg.y2 - arg.y1) / (arg.x2 - arg.x1)) * (arg.px - arg.x1) + arg.y1);
		if (y === arg.py) return 0;
		return (y < arg.py) ? 1 : -1;
	};

	// Component constructor (Arg needs x, y, code, optional extraVars)
	function component(arg) {
		this.extraVars = arg.extraVars || {};
		this.type = mapDict[arg.code].type || '???';
		this.shape = mapDict[arg.code].shape || '???';
		this.code = arg.code || '???';
		this.color = mapDict[arg.code].color || 'hotpink';
		this.x = arg.x || 0;
		this.y = arg.y || 0;
		this.width = arg.width || BLOCKSIZE;
		this.height = arg.height || BLOCKSIZE;

		this.speedY = 0;
		this.speedX = 0;

		this.update = function() {
			var ctx = myGameArea.context;
			var spr = document.getElementById('sprites');

			// Pre-op
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.fillStyle = this.color;

			// Non-sprite
			/*
			switch (this.shape) {
				case 'triTL':
					ctx.beginPath();
					ctx.moveTo(this.width, 0); // TR
					ctx.lineTo(this.width, this.height); // BR
					ctx.lineTo(0, this.height); // BL
					ctx.fill();
					break;

				case 'triTR':
					ctx.beginPath();
					ctx.moveTo(0, 0); // TL
					ctx.lineTo(this.width, this.height); // BR
					ctx.lineTo(0, this.height); // BL
					ctx.fill();
					break;

				case 'triBL':
					ctx.beginPath();
					ctx.moveTo(this.width, 0); // TR
					ctx.lineTo(this.width, this.height); // BR
					ctx.lineTo(0, 0); // TL
					ctx.fill();
					break;

				case 'triBR':
					ctx.beginPath();
					ctx.moveTo(this.width, 0); // TR
					ctx.lineTo(0, 0); // TL
					ctx.lineTo(0, this.height); // BL
					ctx.fill();
					break;

				case 'rect':
				default:
					ctx.fillRect(0, 0, this.width, this.height);
					break;
			}
			*/

			// Sprites
			var s = mapDict[this.code];
			switch (this.code) {
				case 'playerD1':
				case 'playerD2':
				case 'playerL1':
				case 'playerL2':
				case 'playerR1':
				case 'playerR2':
				case 'playerU1':
				case 'playerU2':
					switch (this.extraVars.direction) {
						case 'down':
							s = mapDict[(parseInt(this.y / (BLOCKSIZE / 2)) % 2) === 1 ? 'playerD1' : 'playerD2'];
							break;

						case 'up':
							s = mapDict[(parseInt(this.y / (BLOCKSIZE / 2)) % 2) === 1 ? 'playerU1' : 'playerU2'];
							break;

						case 'right':
							s = mapDict[(parseInt(this.x / (BLOCKSIZE / 2)) % 2) === 1 ? 'playerR1' : 'playerR2'];
							break;

						case 'left':
							s = mapDict[(parseInt(this.x / (BLOCKSIZE / 2)) % 2) === 1 ? 'playerL1' : 'playerL2'];
							break;
					}
					ctx.drawImage(
						// src
						spr,

						// original
						s.x,
						s.y,
						s.width,
						s.height,

						// now
						0,
						0,
						this.width,
						this.width
					);
					break;

				default:
					ctx.drawImage(
						// src
						spr,

						// original
						s.x,
						s.y,
						s.width,
						s.height,

						// now
						0,
						0,
						this.width,
						this.width
					);
					break;
			}

			// Post-op
			ctx.restore();
		};

		this.newPos = function() {
			if (this.type !== 'player') {
				// todo
			} else {
				// Future vals
				var fX = this.x + (this.speedX * MV_SPD);
				var fY = this.y - (this.speedY * MV_SPD);

				// Collision detection
				for (var i = 0; i < screenObjects.length; i++) {
					// Player
					if ('player' === screenObjects[i].type) continue;

					// Wall
					if ('wall' === screenObjects[i].type) {
						if ((((fX > screenObjects[i].x) && (fX < (screenObjects[i].x + screenObjects[i].width))) || (((fX + this.width) > screenObjects[i].x) && ((fX + this.width) < (screenObjects[i].x + screenObjects[i].width)))) && (((fY > screenObjects[i].y) && (fY < (screenObjects[i].y + screenObjects[i].height))) || (((fY + this.height) > screenObjects[i].y) && ((fY + this.height) < (screenObjects[i].y + screenObjects[i].height))))) {
							if ('rect' !== screenObjects[i].shape) {
								var xy = {
									x1: screenObjects[i].x,
									x2: screenObjects[i].x + screenObjects[i].width,
									y1: screenObjects[i].y,
									y2: screenObjects[i].y + screenObjects[i].height,
									px: 0,
									py: 0
								};

								// swap
								if ((screenObjects[i].shape === 'triTL') || (screenObjects[i].shape === 'triBR')) {
									var a = xy.x1;
									xy.x1 = xy.x2;
									xy.x2 = a;
								}

								switch (screenObjects[i].shape) {
									case 'triTL':
										xy.px = fX + this.width;
										xy.py = fY + this.height;
										break;

									case 'triTR':
										xy.px = fX;
										xy.py = fY + this.height;
										break;

									case 'triBL':
										xy.px = fX + this.width;
										xy.py = fY;
										break;

									case 'triBR':
										xy.px = fX;
										xy.py = fY;
										break;
								}

								if ((screenObjects[i].shape === 'triTL') || (screenObjects[i].shape === 'triTR')) {
									if (isAboveLine(xy) === 1) {
										fX = this.x;
										fY = this.y;
									}
								} else {
									if (isAboveLine(xy) === -1) {
										fX = this.x;
										fY = this.y;
									}
								}

							} else return;

						}
					}
				}

				// New screen
				if (this.type === 'player') {
					// left
					if (fX < BLOCKSIZE / 8) {
						console.log('Area not done yet!');
						fX = BLOCKSIZE / 8;
					}

					// right
					if ((fX + this.width) > myGameArea.canvas.width - BLOCKSIZE / 8) {
						console.log('Area not done yet!');
						fX = myGameArea.canvas.width - this.width - BLOCKSIZE / 8;
					}

					// top
					if (fY < BLOCKSIZE / 8) {
						console.log('Area not done yet!');
						fY = BLOCKSIZE / 8;
					}

					// bottom
					if ((fY + this.height) > myGameArea.canvas.height - BLOCKSIZE / 8) {
						console.log('Area not done yet!');
						fY = myGameArea.canvas.height - this.height - BLOCKSIZE / 8;
					}
				}

				// Set new vals
				this.x = fX;
				this.y = fY;
			}
		};
	}

	// Movement, canvas refreshing etc.
	function updateGameArea() {
		// Empty slate
		myGameArea.clear();

		// Update each and everyone of the objects
		for (var i = 0; i < screenObjects.length; i++) {
			// Player specifics
			if (screenObjects[i].type === 'player') {

				// Reset velocity
				screenObjects[i].speedY = 0;
				screenObjects[i].speedX = 0;

				// Check for new velocity (delete else for omnidirection)
				if (myGameArea.keys && myGameArea.keys[37]) {
					if (screenObjects[i].extraVars.direction !== 'left') screenObjects[i].extraVars.direction = 'left';
					else screenObjects[i].speedX = -1;
				} else if (myGameArea.keys && myGameArea.keys[39]) {
					if (screenObjects[i].extraVars.direction !== 'right') screenObjects[i].extraVars.direction = 'right';
					else screenObjects[i].speedX = 1;
				} else if (myGameArea.keys && myGameArea.keys[38]) {
					if (screenObjects[i].extraVars.direction !== 'up') screenObjects[i].extraVars.direction = 'up';
					else screenObjects[i].speedY = 1;
				} else if (myGameArea.keys && myGameArea.keys[40]) {
					if (screenObjects[i].extraVars.direction !== 'down') screenObjects[i].extraVars.direction = 'down';
					else screenObjects[i].speedY = -1;
				}

				// Attack (space)
				if (myGameArea.keys && myGameArea.keys[32] && screenObjects[i].extraVars.canAttack) {
					// no moving thanks			
					screenObjects[i].extraVars.canMove = false;
					// no instant attacking pls
					screenObjects[i].extraVars.canAttack = false;

					// Attack hitbox location
					var x = screenObjects[i].x;
					var y = screenObjects[i].y;
					switch (screenObjects[i].extraVars.direction) {
						case 'up':
							x -= BLOCKSIZE / 8;
							y -= (BLOCKSIZE / 8) + BLOCKSIZE;
							break;

						case 'down':
							x -= BLOCKSIZE / 8;
							y += screenObjects[i].height + (BLOCKSIZE / 8);
							break;

						case 'left':
							x -= (BLOCKSIZE / 8) + BLOCKSIZE;
							y -= BLOCKSIZE / 8;
							break;

						case 'right':
							x += screenObjects[i].width + (BLOCKSIZE / 8);
							y -= BLOCKSIZE / 8;
							break;
					};

					// Create the hitbox
					player.extraVars.attackHitbox = new component({
						code: 'playerAttack',
						x: x,
						y: y
					});

					// Add to the screenObjects
					screenObjects.push(player.extraVars.attackHitbox);

					// Timing
					setTimeout(function() {
						// attack disable here
						screenObjects.splice(screenObjects.indexOf(player.extraVars.attackHitbox), 1);
						player.extraVars.canMove = true;

						setTimeout(function() {
							player.extraVars.canAttack = true;
						}, ATT_TM.cd);
					}, ATT_TM.up);
				}

				// Actually move
				if (screenObjects[i].extraVars.canMove) screenObjects[i].newPos();
			}

			// Redraw it on the clean slate
			screenObjects[i].update();
		}
	}

	// Upon complete page load
	window.addEventListener('load', function() {
		// Canvas stuff
		myGameArea.start(map1[0].length, map1.length);

		// Map stuff
		for (var i = 0; i < map1.length; i++) {
			for (var j = 0; j < map1[i].length; j++) {
				// Empty
				if (map1[i][j] === '') continue;

				// Otherwise add
				screenObjects.push(new component({
					code: map1[i][j],
					x: j * BLOCKSIZE,
					y: i * BLOCKSIZE
				}));
			};
		};

		// Player stuff
		player = new component({
			code: 'playerD1',
			x: PLYR_INT.x * BLOCKSIZE,
			y: PLYR_INT.y * BLOCKSIZE,
			extraVars: {
				prevLoc: {
					x: 0,
					y: 0
				},
				direction: 'down',
				canMove: true,
				canAttack: true
			},
			height: (BLOCKSIZE / 8) * 6,
			width: (BLOCKSIZE / 8) * 6
		});
		screenObjects.push(player);
	});
})();