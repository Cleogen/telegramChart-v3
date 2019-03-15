function map(num, in_min, in_max, out_min, out_max) {
	return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function midPoint(p1, p2) {
	return {
		x: p1.x + (p2.x - p1.x) / 2,
		y: p1.y + (p2.y - p1.y) / 2
	};
}

function animateFunction(callback, frameRate, obj) {
	let again = true;
	setTimeout(function () {
		this.finish = function () {
			again = false;
		};
		this.obj = obj;
		callback();
		if (again) animateFunction(callback, frameRate, this.obj);
	}, 1000 / frameRate);
}

Array.prototype.double = function () {
	let l = this.length;
	let arr = [];
	for (let i = 1; i < l; i++) {
		arr.push(this[i - 1], (this[i - 1] + this[i]) / 2);
	}
	arr.push(this[l - 1]);
	return arr;
};

function onTouchAndMove(callback, object, tP) {
	let dragging = false;
	object.onmousedown = function (e) {
		e.preventDefault();
		e.stopPropagation();
		e.x = e.pageX;
		e.y = e.pageY;
		if ((e.x >= tP.xS && e.x <= tP.xE) && (e.y >= tP.yS && e.y <= tP.yE))
			dragging = true;
	};
	object.onmousemove = function (e) {
		e.preventDefault();
		e.stopPropagation();
		if (dragging)
			callback(e);
	};
	object.onmouseup = function (e) {
		e.preventDefault();
		e.stopPropagation();
		dragging = false;
	};
}