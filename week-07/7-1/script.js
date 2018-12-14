console.log('7-1');

/*Pay attention to the following:
1. scaleRadius is a "square root" scale (line 26)
2. how we set up margins (lines 28-40)
3. how are we organizing the DOM structure?
*/

//Let's visualize the ranking of US cities by population in 1900 and 2012
//Two data arrays
const popRanking1 = [
	{name: 'New York', population: 3437202},
	{name: 'Chicago', population: 1698575},
	{name: 'Philadelphia', population: 1293697},
	{name: 'St Louis', population: 575238}
];

const popRanking2 = [
	{name: 'New York', population: 8336697},
	{name: 'LA', population: 3857799},
	{name: 'Chicago', population: 2714856},
	{name: 'Houston', population: 2160821}
];

//scale for circle radius
const scaleRadius = d3.scaleSqrt().domain([0, 1000000]).range([0,50]);

const margin = {t:50, r:200, b:50, l:200};
const W = d3.select('.chart').node().clientWidth;
const H = d3.select('.chart').node().clientHeight;
const w = W - margin.l - margin.r;
const h = H - margin.t - margin.b;

//chart-1: using for... loop
const plot1 = d3.select("#chart-1")
	.append('svg')
	.attr('width', W)
	.attr('height', H)
	.append('g')
	.attr('transform', `translate(${margin.l}, ${margin.t})`);

popRanking1.forEach(function(d, i){

	//pay close attention to the visual attributes of the symbols (x, y, size etc.)
	//which of these attributes are data-driven?

	const x = w/3 * i;
	const y = h/2;
	const r = scaleRadius(d.population);

	const node = plot1.append('g')
		.attr('transform', `translate(${x}, ${y})`)
		.attr('class','node');

	node.append('circle')
		.attr('r', r);

	node.append('text')
		.text(d.name)
		.attr('text-anchor','middle');

	node.append('text')
		.text(d.population)
		.attr('text-anchor', 'middle')
		.attr('dy', 20);
});

//chart-2: using selection.data


