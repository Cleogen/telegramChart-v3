let request = new XMLHttpRequest();
request.open("GET", "scripts/chart_data.json", false);
request.send(null);
let graphs = [];
let json = JSON.parse(request.responseText);
for (let i = 0; i < json.length; i++) {
	let container = document.createElement("div");
	container.className = "plot";
	document.getElementById("main").prepend(container);
	graphs.push(new Plot(
		container,
		json[i].types,
		json[i].names,
		json[i].colors,
		json[i].columns[0].slice(1),
		json[i].columns.slice(1),
		"Date"));
}

function switchMode(el) {
	graphs.forEach((plot) => {
		plot.switchMode(el)
	});
	if (el.innerHTML.includes("Night")) {
		document.documentElement.className = "dark-mode";
		el.innerHTML = "Switch to Day Mode";
	} else {
		document.documentElement.className = "";
		el.innerHTML = "Switch to Night Mode";
	}
}
