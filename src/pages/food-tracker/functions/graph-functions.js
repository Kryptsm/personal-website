const graphColors = [
	"#52D726",
	"#FF7300",
	"#007ED6",
	"#7CDDDD",
	"#FFEC00",
	"#963868",
	"#727394",
	"#853277",
	"#A37730",
	"#FF0000",
];

//Gets the pie data format from the "Totals" data format.
//Totals format: [{ name: "Goff's", count: 2 }, { name: "Burger House", count: 6 }]
//Pie format: { labels: ["Goff's", "Burger House"], datasets: [{ backgroundColor: ["#FFF", "#PPP"], data: [2, 6]}] }
export function getPieData(itemCounts) {
	let newData = { labels: [], datasets: [{ backgroundColor: [], data: [] }] };
	itemCounts = itemCounts.sort((a, b) => {
		if (a.count < b.count) return 1;
		if (a.count > b.count) return -1;
		return 0;
	});
	itemCounts = itemCounts.slice(0, 7);
	itemCounts.forEach((item) => {
		newData.labels = [...newData.labels, item.name];
		newData.datasets[0].backgroundColor = [
			...newData.datasets[0].backgroundColor,
			graphColors[newData.datasets[0].backgroundColor.length],
		];
		newData.datasets[0].data = [...newData.datasets[0].data, item.count];
	});

	return newData;
}
