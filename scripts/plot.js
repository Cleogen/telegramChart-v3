const animationStep = 1;

class Plot {
	constructor(canvas, types, names, colors, xAxis, dataset, labelFormat) {
		this.ctx = canvas.getContext("2d"); //TODO("Clean up here, not all members are actually required to be in this object");
		this.ctx.imageSmoothingQuality = "high";
		this.h = canvas.height;
		this.w = canvas.width;
		this.mainC = {"minY": 15, "maxY": this.h * 0.8, "minX": 15, "maxX": this.w};
		this.sliderC = {
			"minY": this.mainC.maxY + 5,
			"maxY": this.h - 5,
			"minX": this.mainC.minX,
			"maxX": this.mainC.maxX
		};
		this.labelFormat = labelFormat;
		this.names = names;
		this.types = types;
		this.xAxis = xAxis;
		this.lines = [];
		this.colors = colors;
		this.staticLines = [];
		this.sliderLines = [];
		this.labels = [];
		this.xLimit = 6;
		this.yLimit = 6;
		this.dataset = dataset;

		this.slider = new Slider(this.ctx,
			{"x": this.sliderC.minX, "y": this.sliderC.minY},
			{"x": this.sliderC.maxX, "y": this.sliderC.maxY},
			10, this.updateRange, this);

		let minY = 0;
		let maxY = -Infinity;
		for (let i = 0; i < dataset.length; i++) {
			for (let j = 1; j < dataset[i].length; j++) {
				minY = Math.min(minY, dataset[i][j]);
				maxY = Math.max(maxY, dataset[i][j]);
			}
		}
		let step = (maxY - minY) / (this.yLimit - 1);
		for (let i = 0; i <= this.yLimit; i++) {
			let line = new Line(this.ctx, "#ececec", 1);
			let p = minY + step * i;
			let value = map(p, minY, maxY, this.mainC.maxY - 20, this.mainC.minY);
			line.points = [new Point(this.ctx, this.mainC.minX, value, parseInt(p)),
				new Point(this.ctx, this.mainC.maxX, value)];
			line.end = 2;
			this.staticLines.push(line);
		}

		let minX = xAxis[2];
		let maxX = xAxis[xAxis.length - 2];
		step = (maxX - minX) / (this.xLimit - 1);
		for (let i = 0; i <= this.xLimit; i++) {
			let p = minX + step * i;
			let value = map(p, xAxis[0], xAxis[xAxis.length - 1], this.mainC.minX, this.mainC.maxX);
			this.labels.push(new Point(this.ctx, value, this.mainC.maxY, this.formatLabel(p)));
		}

		for (let i = 0; i < dataset.length; i++) {
			let name = dataset[i][0];
			let line = new Line(this.ctx, colors[name], 3);
			let lineS = new Line(this.ctx, colors[name], 2);
			for (let j = 1; j < dataset[i].length; j++) {
				let x = map(xAxis[j - 1], xAxis[0], xAxis[xAxis.length - 1], this.mainC.minX, this.mainC.maxX);
				let xS = map(xAxis[j - 1], xAxis[0], xAxis[xAxis.length - 1], this.sliderC.minX, this.sliderC.maxX);
				let y = map(dataset[i][j], minY, maxY, this.mainC.maxY - 20, this.mainC.minY);
				let yS = map(dataset[i][j], minY, maxY, this.sliderC.maxY, this.sliderC.minY + 2);
				line.addPoint(new Point(this.ctx, x, y));
				lineS.addPoint(new Point(this.ctx, xS, yS));
			}
			this.sliderLines.push(lineS);
			this.lines.push(line);
		}

		this.draw();
	};

	draw() {
		this.clearCanvas();
		this.slider.draw();
		this.slider.update();
		this.labels.forEach((label) => {
			label.draw();
			label.update();
		});
		this.staticLines.forEach((line) => {
			line.draw();
			line.update();
		});
		this.sliderLines.forEach((line) => {
			line.draw();
			line.update();
		});
		this.lines.forEach((line) => {
			line.draw();
			line.update();
		});
		this.update();
		requestAnimationFrame(this.draw.bind(this));
	};

	update() {

	}

	clearCanvas() {
		this.ctx.save();
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.w, this.h);
		this.ctx.restore();
		this.ctx.beginPath();
	}

	updateRange(start, end) {
		let s = Math.round(map(start.after, this.sliderC.minX, this.sliderC.maxX, 0, this.xAxis.length - 1));
		let e = Math.round(map(end.after, this.sliderC.minX, this.sliderC.maxX, 0, this.xAxis.length - 1));
		this.mainC.minX -= start.after - start.before;
		this.mainC.maxX -= end.after - end.before;
		let xAxis = this.xAxis.slice(s, e);
		let dataset = this.dataset;
		let colors = this.colors;

		let minY = 0;
		let maxY = -Infinity;
		for (let i = 0; i < dataset.length; ++i) {
			for (let j = 1; j < dataset[i].length; ++j) {
				minY = Math.min(minY, dataset[i][j]);
				maxY = Math.max(maxY, dataset[i][j]);
			}
		}
		let step = (maxY - minY) / (this.yLimit - 1);
		for (let i = 0; i <= this.yLimit; ++i) {
			let line = this.staticLines[i];
			let p = minY + step * i;
			let value = map(p, minY, maxY, this.mainC.maxY - 20, this.mainC.minY);
			line.points[0].setY(value);
			line.points[0].label = parseInt(p);
			line.points[1].setY(value);
		}

		let minX = xAxis[2];
		let maxX = xAxis[xAxis.length - 2];
		step = (maxX - minX) / (this.xLimit - 1);
		for (let i = 0; i <= this.xLimit; ++i) {
			let p = minX + step * i;
			let value = map(p, xAxis[0], xAxis[xAxis.length - 1], this.sliderC.minX, this.sliderC.maxX);
			this.labels[i].setX(value);
			this.labels[i].label = this.formatLabel(p);
		}

		for (let i = 0; i < dataset.length; ++i) {
			let line = this.lines[i];
			for (let j = 1; j < dataset[i].length; ++j) {
				let x = map(this.xAxis[j - 1], this.xAxis[0], this.xAxis[this.xAxis.length - 1], this.mainC.minX, this.mainC.maxX);
				let y = map(dataset[i][j], minY, maxY, this.mainC.maxY - 20, this.mainC.minY);
				line.points[j - 1].set(x, y);
			}
		}
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
		this.start = 0;
		this.end = 0;
	}

	addPoint(point) {
		this.points.push(point);
		this.end += 1;
	}

	update() {
		this.points.forEach((point) => {
			point.draw();
			point.update()
		});
	}

	setRange(start, end) {
//		this.start = start;
//		this.end = end;
	}

	draw() {
		let pp = this.points[this.start];
		this.ctx.beginPath();
		this.ctx.lineWidth = this.lineW;
		this.ctx.strokeStyle = this.color;
		this.ctx.lineJoin = this.ctx.lineCap = "round";
		for (let i = this.start + 1; i < this.end; i++) {
			this.ctx.moveTo(pp.x, pp.y);
			pp = this.points[i];
			this.ctx.lineTo(pp.x, pp.y);
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
		this.nx = x;
		this.ny = y;
		this.stepX = 0;
		this.stepY = 0;
		this.count = 0;
	};

	set(x, y) {
		this.count = animationStep;
		this.nx = x;
		this.ny = y;
		this.stepX = (x - this.x) / animationStep;
		this.stepY = (y - this.y) / animationStep;
	}

	setX(x) {
		this.set(x, this.y);
	}

	setY(y) {
		this.set(this.x, y);
	}

	update() {
		if (this.count !== 0) {
			this.x += this.stepX;
			this.y += this.stepY;
			--this.count;
		}
	}

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
		this.ctx.fillText(this.label, this.x, this.y - 3);
		this.ctx.closePath();
	}
}

class Slider {
	constructor(ctx, start, end, pusherWidth, callback, caller, colors = ["#d7e1e8", "#959fa6", "#ffffff"]) {
		this.fun = callback.bind(caller);
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
		let x = point.x + e.x - e.begin.x;
		let start = {"before": this.left.x, "after": 0};
		let end = {"before": this.right.x + this.right.w, "after": 0};
		if (!this.moving && this.left.x >= this.outer.x && this.right.x + this.right.w <= this.outer.x + this.outer.w) {
			this.moving = true;
			this.recalculate(point, x);
			start.after = this.left.x;
			end.after = this.right.x + this.right.w;
			this.fun(start, end);
			this.moving = false;
		}
	};

	draw() {
		this.outer.draw();
		this.inner.draw();
		this.left.draw();
		this.right.draw();
	};

	update() {
		this.outer.update();
		this.inner.update();
		this.left.update();
		this.right.update();
	}

	recalculate(changed, newX) {
		if (changed === this.inner) {
			this.inner.x = newX;
			this.left.x = this.inner.x - this.left.w;
			this.right.x = this.inner.x + this.inner.w;
		} else if (changed === this.left) {
			this.left.x = newX;
			this.inner.x = this.left.x + this.left.w;
			this.inner.w = this.right.x - this.inner.x;
		} else if (changed === this.right) {
			this.right.x = newX;
			this.inner.w = this.right.x - this.inner.x;
		} else if (changed === this.outer) {
			this.left.x = this.outer.x;
			this.right.x = this.outer.x + this.outer.w - this.right.w;
			this.inner.x = this.left.x + this.left.w;
			this.inner.w = this.right.x - this.inner.x;
		}
	};

}