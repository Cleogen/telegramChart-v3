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

function onTouchAndMove(callback, object, targetP, ...options) {
	const getPosition = function (e) {
		let x = 0, y = 0;
		if (e.touches !== undefined) {
			x = e.touches[0].pageX;
			y = e.touches[0].pageY;
		} else {
			x = e.pageX;
			y = e.pageY;
		}
		return {"x": x - object.offsetLeft, "y": y - object.offsetTop};
	};
	let dragging = null;
	object.onmousedown = function (evt) {
		let e = getPosition(evt);
		for (let i = 0; i < targetP.length; i++) {
			let point = targetP[i][1];
			if ((e.x >= point.x && e.x <= point.x + point.w) &&
				(e.y >= point.y && e.y <= point.y + point.h)) {
				evt.preventDefault();
				evt.stopPropagation();
				dragging = targetP[i][0];
				break;
			}
		}
	};
	this.args = options;
	object.onmousemove = function (evt) {
		let e = getPosition(evt);
		if (dragging !== null) {
			evt.preventDefault();
			evt.stopPropagation();
			callback(e, dragging);
		}
	};
	object.onmouseup = function (evt) {
		evt.preventDefault();
		evt.stopPropagation();
		dragging = null;
	};
	object.ontouchstart = (e) => object.onmousedown(e);
	object.ontouchmove = (e) => object.onmousemove(e);
	object.ontouchend = (e) => object.onmouseup(e);
}