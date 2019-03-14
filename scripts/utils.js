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

Array.prototype.double = function () {
	let l = this.length;
	for (let i = 1; i < l; i += 2) {
		this.splice(i, 0, parseInt((this[i - 1] + this[i]) / 2));
	}
	return this;
};

