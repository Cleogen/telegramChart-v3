class Plot {
	constructor(canvas) {
		this.ctx = canvas.getContext("2d"); // TODO("Instantiate with all values in constructor");
		this.h = canvas.height;
		this.w = canvas.width;
		this.labelFormat = null;
		this.names = null;
		this.colors = null;
		this.types = null;
		this.xAxis = null;
		this.xPoints = [];
		this.yPoints = [];
		this.lines = {};
	};

	plot (dataset){
		if (!this.validate())
			return false;

		let minX = this.xAxis[0],
			maxX = this.xAxis[this.xAxis.length - 1],
			minY = Infinity,
			maxY = -Infinity,
			labelLatency = 6;

		dataset.forEach(function (numbers) {
			numbers.slice(1).forEach(function (num) {
				minY = Math.min(minY, num);
				maxY = Math.max(maxY, num);
			});
		});

		for (let i = 1; i <= maxY / minY; i++) {
			let val = Math.round(Plot.mapValue(minY * i, minY, maxY, this.h - 50, 20));
			let point = new Point(this.ctx, 10, val + 10, minY * i);
			point.draw();
			this.yPoints.push(point);
		}

		for (let i = 0; i < this.xAxis.length; ++i){
			let lab = (i % labelLatency === 0) ? this.getLabel(this.xAxis[i]) : ""; // TODO ("@labelLatency must depend on the data points count available width and label format");
			let value = Plot.mapValue(this.xAxis[i], minX, maxX, 50, this.w - 50); // TODO ( " instead of statical padding 50 something else should be done");
			let point = new Point(this.ctx, value, this.h - 10, lab);
			point.draw();
			this.xPoints.push(point);

			for (let j = 0; j < dataset.length; ++j) {
				let name = dataset[j][0];
				let entity = Plot.mapValue(dataset[j][i + 1], minY, maxY, this.h - 50, 20); // TODO (" this 50 should not be statically typed");

				if (this.lines[name] === undefined)
					this.lines[name] = new Line(this.ctx, this.colors[name]);
				this.lines[name].addPoint(new Point(this.ctx, value, entity)); // TODO(" I am adding each point from one array to another this can be optimised, do it");
			}
		}
		this.lines["y0"].draw(); // TODO("Make dynamic");
		this.lines["y1"].draw();
	};

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

	static mapValue (num, in_min, in_max, out_min, out_max) {
		return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
	};

	static getRndColor () {
		let r = 255*Math.random() | 0,
			g = 255*Math.random() | 0,
			b = 255*Math.random() | 0;
		return 'rgb(' + r + ',' + g + ',' + b + ')';
	};
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

	draw() {
		let pp = this.points[0],
			np = null;
		this.ctx.beginPath();
		this.ctx.lineWidth = 3;
		this.ctx.strokeStyle = this.color;
		this.ctx.lineCap = this.ctx.lineJoin = "round";
		for (let i = 1; i < this.points.length; i++) {
			np = this.points[i];
			this.ctx.moveTo(pp.x, pp.y); // TODO(" Make use of quadratic curves");
			this.ctx.lineTo(np.x, np.y);
			pp = np;
		}
		this.ctx.stroke();
		this.ctx.closePath();
	};
}

class Point {
	constructor(ctx, x, y, label = "", w = 0, h = 0, color = "#000") {
		this.ctx = ctx;
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