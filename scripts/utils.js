function map(num, in_min, in_max, out_min, out_max) {
	return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function midPoint(p1, p2) {
	return {
		x: p1.x + (p2.x - p1.x) / 2,
		y: p1.y + (p2.y - p1.y) / 2
	};
}

function animateFunction(callback, frameRate, ...args) {
	let interval = setInterval(function () {
		this.args = args;
		this.finish = function () {
			clearInterval(interval)
		};
		callback();
	}, 1000 / frameRate);
}