var mapDict = [];

// Green wall
mapDict['0'] = {
	x: 480,
	y: 208,

	width: 64,
	height: 64,

	shape: 'rect',
	type: 'wall',
	color: 'green'
};

// Green half-wall
mapDict['1'] = {
	x: 480,
	y: 140,

	width: 64,
	height: 64,

	shape: 'rect',
	type: 'wall',
	color: 'green'
};

// Green TL
mapDict['2'] = {
	x: 412,
	y: 140,

	width: 64,
	height: 64,

	shape: 'triTL',
	type: 'wall',
	color: 'green'
};

// Green TR
mapDict['3'] = {
	x: 548,
	y: 140,

	width: 64,
	height: 64,

	shape: 'triTR',
	type: 'wall',
	color: 'green'
};

// Green BL
mapDict['4'] = {
	x: 412,
	y: 208,

	width: 64,
	height: 64,

	shape: 'triBL',
	type: 'wall',
	color: 'green'
};

// Green BR
mapDict['5'] = {
	x: 548,
	y: 208,

	width: 64,
	height: 64,

	shape: 'triBR',
	type: 'wall',
	color: 'green'
};

// Cave
mapDict['C'] = {
	x: 276,
	y: 72,

	width: 64,
	height: 64,

	shape: 'rect',
	type: 'empty',
	color: 'black'
};

// Player attack
mapDict['playerAttack'] = {
	// x: <x location in sprite>,
	// y: <y location in sprite>,

	// width: <size in sprite>,
	// height: <size in sprite>,

	shape: 'rect',
	type: 'hitbox',
	color: 'red'
};

// Player
mapDict['player'] = {
	x: 4,
	y: 548,

	width: 64,
	height: 64,

	shape: 'rect',
	type: 'player',
	color: 'blue'
};

// Example

/*
mapDict[''] = {
	x: <x location in sprite>,
	y: <y location in sprite>,

	width: <size in sprite>,
	height: <size in sprite>,

	shape: <shape in case of no spritesheet>,
	type: <behavior>,
	color: <color in case of no spritesheet>
};
*/