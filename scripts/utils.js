function map(num, in_min, in_max, out_min, out_max) {
	return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function constrain(value, min, max) {
	if (value < min) return min;
	if (value > max) return max;
	return value
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

function createInput(container, id, name, color, call, obj) {
	let group = document.createElement("div");
	group.className = "inputGroup";
	let input = document.createElement("input");
	input.setAttribute("plot-data", id);
	input.checked = true;
	input.type = "checkbox";
	input.id = input.name = "check_" + id;
	let label = document.createElement("label");
	label.htmlFor = "check_" + id;
	label.pseudoStyle("after", "background-color", color);
	let span = document.createElement("span");
	span.innerText = name;
	call = call.bind(obj);
	input.onchange = function () {
		call(this);
	};
	group.appendChild(input);
	label.appendChild(span);
	group.appendChild(label);
	container.appendChild(group);
}

const UID = {
	_current: 0,
	getNew: function () {
		this._current++;
		return this._current;
	}
};

HTMLElement.prototype.pseudoStyle = function (element, prop, value) {
	let _this = this;
	let _sheetId = "pseudoStyles";
	let _head = document.head || document.getElementsByTagName('head')[0];
	let _sheet = document.getElementById(_sheetId) || document.createElement('style');
	_sheet.id = _sheetId;
	let className = "pseudoStyle" + UID.getNew();

	_this.className += " " + className;

	_sheet.innerHTML += " ." + className + ":" + element + "{" + prop + ":" + value + "}";
	_head.appendChild(_sheet);
	return this;
};