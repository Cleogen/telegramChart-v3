class Plot {
	constructor(canvas, types, names, colors, xAxis, dataset, labelFormat) {
		this.ctx = canvas.getContext("2d"); //TODO("Clean up here, not all members are actually required to be in this object");
		this.h = canvas.height;
		this.w = canvas.width;
		this.mainC = {"minH": 5, "maxH": this.h * 0.85, "minW": 50, "maxW": this.w - 20};
		this.sliderC = {"minH": this.mainC.maxH + 5, "maxH": this.h - 5, "minW": 50, "maxW": this.w - 20};
		this.labelFormat = labelFormat;
		this.names = names;
		this.types = types;
		this.xAxis = xAxis;
		this.lines = {};
		this.sliderLines = {};
		this.xLimit = 5;
		this.yLimit = 5;
		this.dataset = dataset;

		let keys = Object.keys(types);
		for (let i = 0; i < keys.length; i++) {
			this.lines[keys[i]] = new Line(this.ctx, colors[keys[i]], 2);
			this.sliderLines[keys[i]] = new Line(this.ctx, colors[keys[i]], 1);
		}
	};

	plot() {
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
			labelValue = map(x[i], x[0], x[x.length - 1], this.mainC.minW, this.mainC.maxW);
			point = new Point(this.ctx, labelValue, this.mainC.maxH, label);
			point.draw();
			this.updateLines(this.lines, i, mM_y, this.mainC.minH, this.mainC.maxH - 20, labelValue);
			this.updateLines(this.sliderLines, i, mM_y, this.sliderC.minH, this.sliderC.maxH, labelValue);
		}

		this.drawSlider();
		[].concat(Object.values(this.lines), Object.values(this.sliderLines)).forEach(function (value) {
			value.draw();
		});
	};

	animateDraw() {
		let axis = this.xAxis.double();
		let dataset = this.dataset.map((data) => data.slice(1).double());
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
			point = new Point(this.ctx, 10, val - 2, Math.round(minY + i * dif));
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

	redraw() {
		this.clearCanvas();
		[].concat(Object.values(this.lines), Object.values(this.sliderLines)).forEach(function (value) {
			value.clean();
		});
		this.plot();
	}

	clearCanvas() {
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.w, this.h);
		this.ctx.beginPath();
	}

	drawSlider() {
		this.ctx.beginPath();
		this.ctx.fillStyle = "rgba(0, 255, 255, 0.1)";
		this.ctx.fillRect(this.sliderC.minW, this.sliderC.minH, this.mainC.maxW - 50, this.sliderC.maxH);
		this.ctx.closePath();
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
		this.ctx.lineWidth = this.lineW; // TODO("Make everything here dynamic")
		this.ctx.strokeStyle = this.color;
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
	constructor(ctx, x, y, label = "", w = 0, h = 0, color = "#353535") {
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
		this.ctx.ellipse(this.x, this.y, this.w, this.h, 0, 0, 2 * Math.PI);
		this.ctx.fillStyle = this.color;
		this.ctx.textAlign = "center";
		this.ctx.font = "bold 10pt Arial";
		this.ctx.fill();
		this.ctx.fillText(this.label, this.x, this.y);
		this.ctx.closePath();
	}
}