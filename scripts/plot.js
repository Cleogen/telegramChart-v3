const animationStep = 4;

class Plot {
	constructor(container, types, names, colors, xAxis, dataset, labelFormat) {
		let canvas = createCanvas(container.clientWidth, container.clientHeight * 0.8);
		container.appendChild(canvas);
		this.ctx = canvas.getContext("2d"); //TODO("Clean up here, not all members are actually required to be in this object");
		this.h = container.clientHeight * 0.8;
		this.w = container.clientWidth;
		this.animating = false;
		this.mainC = {"minY": 15, "maxY": this.h * 0.8, "minX": 0, "maxX": this.w};
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
		this.staticLines = [];
		this.sliderLines = [];
		this.labels = [];
		this.xLimit = 6;
		this.yLimit = 6;
		this.dataset = dataset;

		this.slider = new Slider(this.ctx,
			{"x": this.sliderC.minX, "y": this.sliderC.minY},
			{"x": this.sliderC.maxX, "y": this.sliderC.maxY},
			10, this.update, this);

		let minY = 0;
		let maxY = -Infinity;
		for (let i = 0; i < dataset.length; i++) {
			for (let j = 1; j < dataset[i].length; j++) {
				minY = Math.min(minY, dataset[i][j]);
				maxY = Math.max(maxY, dataset[i][j]);
			}
		}
		let step = (maxY - minY) / (this.yLimit - 1);
		for (let i = 0; i < this.yLimit; i++) {
			let line = new Line(this.ctx, "rgba(150,150,150,0.5)", 1);
			let p = minY + step * i;
			let value = map(p, minY, maxY, this.mainC.maxY - 20, this.mainC.minY);
			line.points = [
				new Point(this.ctx, this.mainC.minX + this.ctx.measureText(p).width / 2,
					value, parseInt(p)),
				new Point(this.ctx, this.mainC.maxX, value)];
			line.end = 2;
			this.staticLines.push(line);
		}

		let minX = xAxis[parseInt(xAxis.length * 0.05)];
		let maxX = xAxis[parseInt(xAxis.length * 0.95)];
		step = (maxX - minX) / (this.xLimit - 1);
		for (let i = 0; i < this.xLimit; i++) {
			let p = minX + step * i;
			let value = map(p, xAxis[0], xAxis[xAxis.length - 1], this.mainC.minX, this.mainC.maxX);
			this.labels.push(new Point(this.ctx, value, this.mainC.maxY, this.formatLabel(p)));
		}

		for (let i = 0; i < dataset.length; i++) {
			let name = dataset[i][0];
			createInput(container, i, names[name], colors[name], this.checker, this);
			let line = new Line(this.ctx, colors[name], 2);
			let lineS = new Line(this.ctx, colors[name], 1);
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
		this.animating = false;
		this.clearCanvas();
		this.slider.draw();
		this.slider.update();
		this.lines.forEach((line) => {
			line.draw();
			this.animating |= line.update();
		}, this);
		this.labels.forEach((label) => {
			label.draw();
			this.animating |= label.update();
		}, this);
		this.staticLines.forEach((line) => {
			line.draw();
			this.animating |= line.update();
		}, this);
		this.sliderLines.forEach((line) => {
			line.draw();
			this.animating |= line.update();
		}, this);
		
		if (this.animating){
			console.log("request");
			requestAnimationFrame(this.draw.bind(this));
		}
	};

	clearCanvas() {
		this.ctx.save();
		this.ctx.clearRect(0, 0, this.w, this.h);
		this.ctx.restore();
		this.ctx.beginPath();
	}

	update() {
		let start = this.slider.getStart();
		let end = this.slider.getEnd();
		let s = Math.floor(map(start, this.sliderC.minX, this.sliderC.maxX, 0, this.xAxis.length));
		let e = Math.ceil(map(end, this.sliderC.minX, this.sliderC.maxX, 0, this.xAxis.length));
		let xAxis = this.xAxis.slice(s, e);
		this.mainC.minX = map(this.sliderC.minX, start, end, this.sliderC.minX, this.sliderC.maxX);
		this.mainC.maxX = map(this.sliderC.maxX, start, end, this.sliderC.minX, this.sliderC.maxX);
		let minY = 0;
		let maxY = -Infinity;
		let sliderMin = 0;
		let sliderMax = -Infinity;
		for (let i = 0; i < this.dataset.length; ++i) {
			if (this.lines[i].state !== Line.ACTIVE)
				continue;
			for (let j = 1; j < this.dataset[i].length - 1; ++j) {
				sliderMin = Math.min(sliderMin, this.dataset[i][j]);
				sliderMax = Math.max(sliderMax, this.dataset[i][j]);
				if (j >= s && j <= e) {
					minY = Math.min(minY, this.dataset[i][j]);
					maxY = Math.max(maxY, this.dataset[i][j]);
				}
			}
		}
		let step = (maxY - minY) / (this.yLimit - 1);
		for (let i = 0; i < this.yLimit; ++i) {
			let line = this.staticLines[i];
			let p = minY + step * i;
			let value = map(p, minY, maxY, this.mainC.maxY - 20, this.mainC.minY);
			line.points[0].setY(value);
			line.points[0].label = parseInt(p);
			line.points[1].setY(value);
		}

		let minX = xAxis[parseInt(xAxis.length * 0.05)];
		let maxX = xAxis[parseInt(xAxis.length * 0.95)];
		step = (maxX - minX) / (this.xLimit - 1);
		for (let i = 0; i < this.xLimit; ++i) {
			let p = minX + step * i;
			let value = map(p, xAxis[0], xAxis[xAxis.length - 1], this.sliderC.minX, this.sliderC.maxX);
			this.labels[i].setX(value);
			this.labels[i].label = this.formatLabel(p);
		}

		for (let i = 0; i < this.dataset.length; ++i) {
			let line = this.lines[i];
			let sliderLine = this.sliderLines[i];
			for (let j = 1; j < this.dataset[i].length; ++j) {
				let x = map(this.xAxis[j - 1], this.xAxis[0], this.xAxis[this.xAxis.length - 1], this.mainC.minX, this.mainC.maxX);
				let y = map(this.dataset[i][j], minY, maxY, this.mainC.maxY - 20, this.mainC.minY);
				let yS = map(this.dataset[i][j], sliderMin, sliderMax, this.sliderC.maxY, this.sliderC.minY + 2);
				line.points[j - 1].set(x, y);
				sliderLine.points[j - 1].setY(yS);
			}
		}
		if (!this.animating)
			this.draw();
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

	checker(el) {
		let id = el.getAttribute("plot-data");
		if (!el.checked) {
			this.lines[id].state = Line.HIDDEN;
			this.sliderLines[id].state = Line.HIDDEN;
		} else {
			this.lines[id].state = Line.ACTIVE;
			this.sliderLines[id].state = Line.ACTIVE;
		}
		this.update();
	}

	switchMode(el) {
		if (el.innerHTML.includes("Night")) {
			document.documentElement.className = "dark-mode";
			el.innerHTML = "Switch to Day Mode";
			this.slider.setColors(
				"#1f2a38",
				"#40566b",
				"#242f3e"
			);
		} else {
			document.documentElement.className = "";
			el.innerHTML = "Switch to Night Mode";
			this.slider.setColors(
				"#f5f9fb",
				"#ddeaf3",
				"#fff"
			);
		}
		this.draw();
	}
}

class Line {
	static ACTIVE = 1;
	static HIDDEN = 0;

	constructor(ctx, color, lineW, state = Line.ACTIVE) {
		this.ctx = ctx;
		this.state = state;
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
		let it = true;
		this.points.forEach((point) => {
			point.draw();
			it &= point.update()
		});
		return it;
	}

	draw() {
		if (this.state !== Line.ACTIVE)
			return;
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
	constructor(ctx, x, y, label = "", w = 0, h = 0, color = "rgb(177,186,193)", type = "circle") {
		this.type = type;
		this.ctx = ctx;
		this.ctx.shadowBlur = 0;
		this.color = color;
		this.label = label;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.stepX = 0;
		this.stepY = 0;
		this.count = 0;
	};

	set(x, y) {
		this.count = animationStep;
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
			return true;
		}
		return false;
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
	constructor(ctx, start, end, pusherWidth, callback, caller, colors = ["#f5f9fb", "#ddeaf3", "#ffffff"]) {
		this.fun = callback.bind(caller);
		let h = end.y - start.y;
		this.minX = start.x;
		this.maxX = end.x;
		this.outer = new Point(ctx, start.x, start.y, "", end.x - start.x, h, colors[0], "rect");
		this.right = new Point(ctx, 0, start.y, "", pusherWidth, h);
		this.decor = new Point(ctx, 0, start.y, "", 0, h, colors[1], "rect");
		this.left = new Point(ctx, 0, start.y, "", pusherWidth, h);
		this.inner = new Point(ctx, 0, start.y + 4, "", 0, h - 8, colors[2], "rect");
		this.recalculate(this.outer);
		this.moving = false;
		onTouchAndMove(this.move, ctx.canvas, [this.left, this.right, this.inner], this);
	};

	move(e, point) {
		if (!this.moving && this.left.x >= this.outer.x && this.right.x + this.right.w <= this.outer.x + this.outer.w) {
			let x = point.x + e.x - e.begin.x;
			this.moving = true;
			this.recalculate(point, x);
			this.fun();
			this.moving = false;
		}
	};

	getStart() {
		return this.left.x;
	}

	getEnd() {
		return this.right.x + this.right.w;
	}

	setColors(one, two, three) {
		this.outer.color = one;
		this.decor.color = two;
		this.inner.color = three;
	}

	draw() {
		this.outer.draw();
		this.decor.draw();
		this.inner.draw();
	};

	update() {
		this.outer.update();
		this.decor.update();
		this.inner.update();
	}

	recalculate(changed, newX) {
		if (changed === this.inner) {
			this.inner.x = constrain(newX, this.minX + this.left.w, this.maxX - this.inner.w - this.right.w);
			this.left.x = this.inner.x - this.left.w;
			this.right.x = this.inner.x + this.inner.w;
		} else if (changed === this.left) {
			this.left.x = constrain(newX, this.minX, this.right.x - 4 * this.right.w);
			this.inner.x = this.left.x + this.left.w;
			this.inner.w = this.right.x - this.inner.x;
		} else if (changed === this.right) {
			this.right.x = constrain(newX, this.left.x + 4 * this.left.w, this.maxX - this.right.w);
			this.inner.w = this.right.x - this.inner.x;
		} else if (changed === this.outer) {
			this.left.x = this.outer.x;
			this.right.x = this.outer.x + this.outer.w - this.right.w;
			this.inner.x = this.left.x + this.left.w;
			this.inner.w = this.right.x - this.inner.x;
		}
		this.decor.x = this.left.x;
		this.decor.w = this.right.x - this.left.x + this.right.w;
	};
}
