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

function getMinMax(data) {
	let min = 0;
	let max = -Infinity;
	for (let i = 0; i < data.length; i++) {
		if (Array.isArray(data[i])) {

		} else {

		}
	}
}

function onTouchAndMove(callback, object, targetP, caller) {
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
	let func = callback.bind(caller);
	let begin = {};
	object.onmousedown = function (evt) {
		let e = getPosition(evt);
		for (let i = 0; i < targetP.length; i++) {
			let point = targetP[i];
			if ((e.x >= point.x && e.x <= point.x + point.w) &&
				(e.y >= point.y && e.y <= point.y + point.h)) {
				evt.preventDefault();
				evt.stopPropagation();
				dragging = targetP[i];
				begin.x = e.x;
				begin.y = e.y;
				break;
			}
		}
	};
	object.onmousemove = function (evt) {
		let e = getPosition(evt);
		if (dragging !== null) {
			evt.preventDefault();
			evt.stopPropagation();
			e.begin = begin;
			func(e, dragging);
			begin.x = e.x;
			begin.y = e.y;
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

function createInput(container, id, name, call, obj) {
	let label = document.createElement("label");
	label.innerText = name;
	let input = document.createElement("input");
	input.setAttribute("plot-data", id);
	input.className = "plot-check";
	input.checked = true;
	input.type = "checkbox";
	call = call.bind(obj);
	input.onchange = function () {
		call(this);
	};
	label.appendChild(input);
	container.appendChild(label);
}