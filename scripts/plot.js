function map(num, in_min, in_max, out_min, out_max) {
	return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function midPoint(p1, p2) {
	return {
		x: p1.x + (p2.x - p1.x) / 2,
		y: p1.y + (p2.y - p1.y) / 2
	};
}

class Plot {
	constructor(canvas, types, names, colors, xAxis, labelFormat) {
		this.ctx = canvas.getContext("2d");//TODO("Clean up, not all parameters are required to be in this object");
		this.padding = 50;
		this.h = canvas.height;
		this.w = canvas.width;
		this.labelFormat = labelFormat;
		this.names = names;
		this.types = types;
		this.xAxis = xAxis;
		this.yPoints = [];
		this.lines = {};
		this.xLimit = 10;
		this.yLimit = 10;

		let keys = Object.keys(types);
		for (let i = 0; i < keys.length; i++) {
			this.lines[keys[i]] = new Line(this.ctx, colors[keys[i]]);
		}
	};

	plot(dataset) {
		if (!this.validate())
			return false;

		let yVal = this.drawYAxis(dataset);
		let dif = (this.xAxis.length - 1) / this.xLimit;
		let count = 0;

		for (let i = 0; i < this.xAxis.length; ++i){
			let lab = "";
			if (i === Math.round(count * dif)) {
				lab = this.getLabel(this.xAxis[i]);
				++count;
			}

			let value = map(this.xAxis[i], this.xAxis[0], this.xAxis[this.xAxis.length - 1], this.padding, this.w - this.padding); // TODO ( " instead of statical padding 50 something else should be done");
			let point = new Point(this.ctx, value, this.h - 10, lab);
			point.draw();

			for (let j = 0; j < dataset.length; ++j) {
				let name = dataset[j][0];
				let entity = map(dataset[j][i + 1], yVal.min, yVal.max, this.h - this.padding, this.padding);
				this.lines[name].addPoint(new Point(this.ctx, value, entity)); // TODO(" I am adding each point from one array to another this can be optimised, do it");
			}
		}

		Object.values(this.lines).forEach(function (el) {
			el.draw();
		});
	};

	animateDraw(dataset) {
		let axis = this.xAxis;
		this.xAxis = [];
		let drawing = setInterval(function () { // TODO("Dataset must be dynamically moving, or some argument can be passed to the Line class so it will push outdated points")
			arguments[0].xAxis.push(axis.shift());
			arguments[0].redraw(dataset);
			if (axis.length === 0)
				clearInterval(drawing);
		}, 50, this);
	}

	drawYAxis(dataset) {
		let minY = Infinity,
			maxY = -Infinity;
		dataset.forEach(function (numbers) {
			numbers.slice(1).forEach(function (num) {
				minY = Math.min(minY, num);
				maxY = Math.max(maxY, num);
			});
		});
		let dif = (maxY - minY) / this.yLimit;
		for (let i = 0; i <= this.yLimit; i++) {
			let val = map(minY + dif * i, minY, maxY, this.h - this.padding, this.padding);
			let point = new Point(this.ctx, 10, val + 10, Math.round(minY + i * dif));
			point.draw();
		}
		return {"min": minY, "max": maxY};
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

	getLabel(item) {
		let lab = null;
		if (this.labelFormat === "Date")
			lab = new Date(item).toLocaleDateString("en-US", {
				day: "numeric",
				month: "short"
			});
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
		this.ctx.lineWidth = 2;
		this.ctx.shadowColor = this.color;
		this.ctx.shadowBlur = 3;
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