class Plot {
	constructor(canvas, types, names, colors, xAxis, labelFormat) {
		this.ctx = canvas.getContext("2d"); //TODO("Clean up here, not all members are actually required to be in this object");
		this.padding = 50;
		this.h = canvas.height;
		this.w = canvas.width;
		this.labelFormat = labelFormat;
		this.names = names;
		this.types = types;
		this.xAxis = xAxis;
		this.lines = {};
		this.xLimit = 10;
		this.yLimit = 10;
		this.dataset = null; // TODO ("In the code I am passing around dataset too much, that's probably redundant");

		let keys = Object.keys(types);
		for (let i = 0; i < keys.length; i++) {
			this.lines[keys[i]] = new Line(this.ctx, colors[keys[i]]);
		}
	};

	plot(dataset) {
		this.dataset = dataset;
		let mM_y = this.drawYAxis(),
			step = (this.xAxis.length - 1) / this.xLimit,
			count = 0,
			labelValue = 0,
			label = "",
			point = null,
			x = this.xAxis;

		for (let i = 0; i < x.length; ++i) {
			label = "";
			if (i === Math.round(count * step)) {
				label = this.formatLabel(x[i]);
				++count;
			}
			labelValue = map(x[i], x[0], x[x.length - 1], this.padding, this.w - this.padding);
			point = new Point(this.ctx, labelValue, this.h - 10, label);
			point.draw();
			this.updateLines(i, mM_y, labelValue);
		}

		Object.values(this.lines).forEach(function (el) {
			el.draw();
		});
	};

	animateDraw(dataset) {
		let axis = this.xAxis;
		this.xAxis = [];
		animateFunction(function () {
			args[0].xAxis.push(axis.shift());
			args[0].redraw(dataset);
			if (axis.length === 0)
				finish();
		}, 60, this);
	}

	drawYAxis() {
		let minY = Infinity,
			maxY = -Infinity;
		this.dataset.forEach(function (numbers) {
			numbers.slice(1).forEach(function (num) {
				minY = Math.min(minY, num);
				maxY = Math.max(maxY, num);
			});
		});

		let dif = (maxY - minY) / this.yLimit,
			val = 0,
			point = null;
		for (let i = 0; i <= this.yLimit; i++) {
			val = map(minY + dif * i, minY, maxY, this.h - this.padding, this.padding);
			point = new Point(this.ctx, 10, val + 10, Math.round(minY + i * dif));
			point.draw();
		}

		return {"min": minY, "max": maxY};
	};

	updateLines(i, mM_y, labelValue) {
		let name = "",
			value = null;

		for (let j = 0; j < this.dataset.length; ++j) {
			name = this.dataset[j][0];
			value = map(this.dataset[j][i + 1], mM_y.min, mM_y.max, this.h - this.padding, this.padding);
			this.lines[name].addPoint(new Point(this.ctx, labelValue, value)); // TODO(" I am adding each point from one array to another this can be optimised, do it");
		}
	};

	redraw(dataset) {
		this.clearCanvas();
		Object.values(this.lines).forEach(function (el) {
			el.clean();
		});
		this.plot(dataset);
	}

	clearCanvas() {
		this.ctx.closePath();
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.w, this.h);
		this.ctx.beginPath();
	}

	validate () {
		let message = "";
		if (this.names === null)
			message += "Please specify names\n";
		if (this.types === null)
			message += "Please specify line types\n";
		if (this.xAxis === null)
			message += "Please specify xAxis\n";
		// TODO (Add checks for the cases when labels and types do not match);

//		console.error(message); //TODO("Show error message efficiently if possible");
		return message === "";
	};

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
	constructor(ctx, color) {
		this.ctx = ctx;
		this.points = [];
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
		this.ctx.lineWidth = 3; // TODO("Make everything here dynamic")
		this.ctx.shadowColor = this.color;
		this.ctx.shadowBlur = 4;
		this.ctx.strokeStyle = this.color;
		this.ctx.lineJoin = "round";
		this.ctx.lineCap = "round";
		this.ctx.beginPath();
		for (let i = 1; i < this.points.length; i++) {
			np = this.points[i];
			this.ctx.moveTo(pp.x, pp.y);
			pp = midPoint(pp, np);
			this.ctx.quadraticCurveTo(pp.x, pp.y, np.x, np.y);
			pp = np;
		}
		this.ctx.closePath();
		this.ctx.stroke();
	};
}

class Point {
	constructor(ctx, x, y, label = "", w = 0, h = 0, color = "#000") {
		this.ctx = ctx;
		this.ctx.shadowBlur = 0;
		this.color = color;
		this.label = label;
		this.xShift = this.ctx.measureText(label).width / 2;
		this.yShift = 5;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	};

	draw() {
		this.ctx.beginPath();
		this.ctx.ellipse(this.x, this.y, this.w, this.h, 0, 0, 2 * Math.PI);
		this.ctx.fillStyle = this.color;
		this.ctx.fill();
		this.ctx.fillText(this.label, this.x - this.xShift, this.y - this.yShift);
		this.ctx.closePath();
	}

	updatePos(x, y) {
		this.x = x;
		this.y = y;
		this.draw();
	}
}