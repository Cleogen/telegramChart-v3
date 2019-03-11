class Plot {
	constructor (canvas){
		this.ctx = canvas.getContext("2d");
		this.h = canvas.height - 10;
		this.w = canvas.width - 10;
		this.labels = null;
		this.colors = null;
		this.types = null;
		this.xAxis = null;
	};

	plot (dataset){
		if (!this.validate())
			return false;
		let minX = this.xAxis[0];
		let maxX = this.xAxis[this.xAxis.length - 1];
		for (let i = 0; i < this.xAxis.length; ++i){
			let lab = new Date(this.xAxis[i]).getUTCMonth().toString();
			console.log(lab);
			let value = Plot.mapValue(this.xAxis[i], minX, maxX, 0, this.w);
			this.drawPoint(value,this.h - 1,lab, "orange");
		}
	};

	validate () {
		let message = "";
		if (this.labels === null)
			message += "Please specify labels\n";
		if (this.types === null)
			message += "Please specify label types\n";
		if (this.xAxis === null)
			message += "Please specify xAxis\n";
		// TODO (Add checks for the cases when labels and types do not match);

//		console.error(message);
		return message === "";
	};

	drawPoint (x, y, label = "", color = null){
		if (color === null)
			color = Plot.getRndColor();

		this.ctx.beginPath();
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x,y,2,2);
		this.ctx.fillStyle = "#171717";
		this.ctx.strokeText(label, x - label.length*2, y - 10);
		this.ctx.closePath();
	};

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