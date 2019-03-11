class Plot {
	constructor (canvas){
		this.ctx = canvas.getContext("2d");
		this.h = canvas.height;
		this.w = canvas.width;
		this.labelFormat = null;
		this.names = null;
		this.colors = null;
		this.types = null;
		this.xAxis = null;
	};

	plot (dataset){
		if (!this.validate())
			return false;
		let minX = this.xAxis[0];
		let maxX = this.xAxis[this.xAxis.length - 1];
		let labelLatency = 6;

		for (let i = 0; i < this.xAxis.length; ++i){
			let lab = (i % labelLatency === 0) ? this.getLabel(this.xAxis[i]) : ""; // TODO ("@labelLatency must depend on the data points count available width and label format");
			let value = Plot.mapValue(this.xAxis[i], minX, maxX, 50, this.w - 50); // TODO ( " instead of statical padding 50 something else should be done");
			this.drawPoint(value, this.h - 10, lab, "#ffffff");

			for (let j = 0; j < dataset.length; ++j) {
				let name = dataset[j][0];
				let entity = Plot.mapValue(dataset[j][i + 1], 0, 200, this.h - 50, 0); // TODO (" this 50 should not be statically typed"); TODO("min and max values are not dynamic. need to find the biggest and smallest from dataset in a very efficient way");
				this.drawPoint(value, entity, "", this.colors[name]); // TODO("A drawLine function which will draw line continuously from last point to newly added");
			}
		}
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

//		console.error(message);
		return message === "";
	};

	drawPoint (x, y, label = "", color = null){
		if (color === null)
			color = Plot.getRndColor();

		this.ctx.beginPath();
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x,y,2,2);
		this.ctx.fillStyle = "#393939";
		this.ctx.strokeText(label, x - this.ctx.measureText(label).width / 2, y - 10);
		this.ctx.closePath();
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