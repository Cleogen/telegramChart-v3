class Plot {
	constructor(canvas, types, names, colors, xAxis, dataset, labelFormat) {
		this.ctx = canvas.getContext("2d"); //TODO("Clean up here, not all members are actually required to be in this object");
		this.h = canvas.height;
		this.w = canvas.width;
		this.mainC = {"minH": 5, "maxH": this.h * 0.8, "minW": 5, "maxW": this.w};
		this.sliderC = {"minH": this.mainC.maxH + 5, "maxH": this.h - 5, "minW": 5, "maxW": this.w};
		this.labelFormat = labelFormat;
		this.names = names;
		this.types = types;
		this.xAxis = xAxis;
		this.lines = {};
		this.sliderLines = {};
		this.xLimit = 5;
		this.yLimit = 5;
		this.dataset = dataset;
		this.slider = new Slider(this.ctx,
			{"x": this.sliderC.minW, "y": this.sliderC.minH},
			{"x": this.sliderC.maxW, "y": this.sliderC.maxH},
			10, this.updateRange, this);
		let keys = Object.keys(types);
		for (let i = 0; i < keys.length; i++) {
			this.lines[keys[i]] = new Line(this.ctx, colors[keys[i]], 2);
			this.sliderLines[keys[i]] = new Line(this.ctx, colors[keys[i]], 1);
		}
	};

	plot(s = 0, e = this.xAxis.length) {
		let mM_y = this.drawYAxis(),
			step = (this.xAxis.length - 1) / this.xLimit,
			count = 0,
			labelValue = 0,
			label = "",
			point = null,
			x = this.xAxis;

		for (let i = s; i < e; ++i) {
			label = "";
			if (i === (Math.round(count * step))) { // TODO("Choose the label points so that they wont overlap")
				label = this.formatLabel(x[i]);
				++count;
			}
			labelValue = map(x[i], x[0], x[x.length - 1], this.mainC.minW, this.mainC.maxW);
			point = new Point(this.ctx, labelValue, this.mainC.maxH, label);
			point.draw();
			this.updateLines(this.lines, i, mM_y, this.mainC.minH, this.mainC.maxH - 20, labelValue);
			this.updateLines(this.sliderLines, i, mM_y, this.sliderC.minH, this.sliderC.maxH, labelValue);
		}

		this.slider.draw();
		[].concat(Object.values(this.lines), Object.values(this.sliderLines)).forEach(function (value) {
			value.draw(); //TODO("The horizontal lines are drawn over the main lines, fix!");
		});
	};

	animateDraw() {
		let axis = this.xAxis;
		let dataset = this.dataset.map((data) => data.slice(1));
		this.dataset = this.dataset.map((data) => [data[0]]);
		this.xAxis = [];
		animateFunction(function () {
			obj.xAxis.push(axis.shift());
			for (let i = 0; i < dataset.length; i++)
				obj.dataset[i].push(dataset[i].shift());
			obj.redraw();
			if (axis.length === 0)
				finish();
		}, 60, this);
	}

	updateRange(start, end, me) {
		let s = parseInt(map(start, me.sliderC.minW, me.sliderC.maxW, 1, me.xAxis.length));
		let e = parseInt(map(end, me.sliderC.minW, me.sliderC.maxW, 1, me.xAxis.length));
		console.log(s, e);
		me.redraw(s, e);
	}
	drawYAxis() {
		let minY = 0,
			maxY = -Infinity;
		this.dataset.forEach(function (numbers) {
			numbers.slice(1).forEach(function (num) {
				minY = Math.min(minY, num);
				maxY = Math.max(maxY, num);
			});
		});

		let dif = (maxY - minY) / this.yLimit,
			val = 0,
			point = null,
			line = null;

		for (let i = 0; i <= this.yLimit; i++) {
			val = map(minY + dif * i, minY, maxY, this.mainC.maxH - 20, this.mainC.minH + 10);
			point = new Point(this.ctx, 15, val - 2, Math.round(minY + i * dif));
			point.draw();
			line = new Line(this.ctx, "#eeeeee", 1);
			line.points = [
				new Point(this.ctx, 0, val + 2),
				new Point(this.ctx, this.mainC.maxW, val + 2)];
			this.lines["del" + i] = line;
		}

		return {"min": minY, "max": maxY};
	};

	updateLines(lines, i, mM_y, top, bottom, labelValue) {
		let name = "",
			value = null;

		for (let j = 0; j < this.dataset.length; ++j) {
			name = this.dataset[j][0];
			value = map(this.dataset[j][i + 1], mM_y.min, mM_y.max, bottom, top);
			lines[name].addPoint(new Point(this.ctx, labelValue, value)); // TODO(" I am adding each point from one array to another this can be optimised, do it");
		}
	};

	redraw(s, e) {
		this.clearCanvas();
		[].concat(Object.values(this.lines), Object.values(this.sliderLines)).forEach(function (value) {
			value.clean();
		});
		this.plot(s, e);
	}

	clearCanvas() { // TODO ("Use save and restore to be more efficient when animating");
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.w, this.h);
		this.ctx.beginPath();
	}

	formatLabel(item) {
		let lab = null;
		if (this.labelFormat === "Date") {
			lab = new Date(item).toLocaleDateString("en-US", {
				day: "numeric",
				month: "short"
			});
		}
		return lab;
	}
}

class Line {
	constructor(ctx, color, lineW) {
		this.ctx = ctx;
		this.points = [];
		this.lineW = lineW;
		this.color = color;
	}

	addPoint(point) {
		this.points.push(point);
	}

	clean() {
		this.points = [];
	}

	draw() {
		let pp = this.points[0],
			np = null;
		this.ctx.beginPath();
		this.ctx.lineWidth = this.lineW; // TODO("Make everything here dynamic");
		this.ctx.strokeStyle = this.color; // TODO("Animate drawing lines");
		this.ctx.lineJoin = this.ctx.lineCap = "round";
		for (let i = 1; i < this.points.length; i++) {
			np = this.points[i];
			this.ctx.moveTo(pp.x, pp.y);
			pp = midPoint(pp, np);
			this.ctx.quadraticCurveTo(pp.x, pp.y, np.x, np.y);
			pp = np;
		}
		this.ctx.stroke();
		this.ctx.closePath();
	};
}

class Point {
	constructor(ctx, x, y, label = "", w = 0, h = 0, color = "#353535", type = "circle") {
		this.type = type;
		this.ctx = ctx;
		this.ctx.shadowBlur = 0;
		this.color = color;
		this.label = label;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	};

	draw() {
		this.ctx.beginPath();
		if (this.type === "circle")
			this.ctx.ellipse(this.x, this.y, this.w, this.h, 0, 0, 2 * Math.PI);
		else
			this.ctx.rect(this.x, this.y, this.w, this.h);
		this.ctx.fillStyle = this.color;
		this.ctx.fill();
		this.ctx.textAlign = "center";
		this.ctx.font = "bold 10pt Arial";
		this.ctx.fillText(this.label, this.x, this.y);
		this.ctx.closePath();
	}
}

class Slider {
	constructor(ctx, start, end, pusherWidth, callback, caller, colors = ["#d7e1e8", "#959fa6", "#ffffff"]) {
		this.fun = callback;
		this.obj = caller;
		let h = end.y - start.y;
		// TODO("Instead of having 2 left and right points, I shall have one dark from left to right. left and right should be json objects I really need only x,y,w,h: no need to draw")
		this.outer = new Point(ctx, start.x, start.y, "", end.x - start.x, h, colors[0], "rect");
		this.right = new Point(ctx, 0, start.y, "", pusherWidth, h, colors[1], "rect");
		this.left = new Point(ctx, 0, start.y, "", pusherWidth, h, colors[1], "rect");
		this.inner = new Point(ctx, 0, start.y + 4, "", 0, h - 8, colors[2], "rect");
		this.recalculate(this.outer);
		this.moving = false;
		onTouchAndMove(this.move, this.inner.ctx.canvas, [this.left, this.right, this.inner], this);
	};

	move(e, point) {
		//TODO("Slider is stopping when I am going out of bounds. One solution is not to move if it will be out of range")
		if (!e.me.moving && e.me.left.x >= e.me.outer.x && e.me.right.x + e.me.right.w <= e.me.outer.x + e.me.outer.w) {
			e.me.moving = true;
			point.x += e.x - e.begin.x;
			e.me.recalculate(point);
			e.me.fun(e.me.left.x, e.me.right.x + e.me.right.w, e.me.obj);
			e.me.moving = false;
		}
	};

	draw() {
		this.outer.draw();
		this.inner.draw();
		this.left.draw();
		this.right.draw();
	};

	recalculate(changed) {
		if (changed === this.inner) {
			this.left.x = this.inner.x - this.left.w;
			this.right.x = this.inner.x + this.inner.w;
		} else if (changed === this.left) {
			this.inner.x = this.left.x + this.left.w;
			this.inner.w = this.right.x - this.inner.x;
		} else if (changed === this.right) {
			this.inner.w = this.right.x - this.inner.x;
		} else if (changed === this.outer) {
			this.left.x = this.outer.x;
			this.right.x = this.outer.x + this.outer.w - this.right.w;
			this.inner.x = this.left.x + this.left.w;
			this.inner.w = this.right.x - this.inner.x;
		}
	};

}