//This example demonstrates how you might import data from different sources
//Append <svg> and <g> in the right place
//Have a reference to it via the "plot" variable
const W = d3.select('.plot').node().clientWidth;
const H = d3.select('.plot').node().clientHeight;
const margin = {t:100, r:50, b:50, l:50};
const w = W - margin.l - margin.r;
const h = H - margin.t - margin.b;

const svg = d3.select('.plot')
	.append('svg')
	.attr('width',W)
	.attr('height',H)
const plot = svg
	.append('g')
	.attr('transform', `translate(${margin.l}, ${margin.t})`);
plot.append('g').attr('class','axis axis-x').attr('transform',`translate(0, ${h})`);
plot.append('g').attr('class','axis axis-y');


//Global variables
const INDICATOR_X = 'GDP per capita (constant 2010 US$)';
const INDICATOR_Y = 'Mortality rate, infant (per 1,000 live births)';
const INDICATOR_SIZE = 'Population, total';
let YEAR = 2017; //we might change this later

let scaleX = d3.scaleLog().range([0, w]);
let scaleY = d3.scaleLog().range([h, 0]);
let scaleSize = d3.scaleSqrt().range([2, 50]);


//Import data
const dataPromise = d3.csv('../data/data-test.csv', parseData)
.then(function(rows){ 
	return rows.reduce(function(acc,val){return acc.concat(val)}, []); 
});
const metadataPromise = d3.csv('../data/countries-metadata.csv', parseMetadata);
const geojsonPromise = d3.json('../data/countries.geojson');


Promise.all([dataPromise, metadataPromise, geojsonPromise])
	.then(function([data, metadata, geojson]){

		//perform initial data transformation here: pick the right indicators
		const indicators = data.filter(function(d){
			return d.series === INDICATOR_X || d.series === INDICATOR_Y || d.series === INDICATOR_SIZE;
		});

		//further data transformation here: pick the year
		//this step could be repeated, and is thus in a function
		const indicatorsByYear = filterByYear(indicators, YEAR);
		
		//Now we can do some data discovery of max and min
		const xExtent = d3.extent(indicatorsByYear, function(d){ return d[INDICATOR_X]});
		const yExtent = d3.extent(indicatorsByYear, function(d){ return d[INDICATOR_Y]});
		const sizeExtent = d3.extent(indicatorsByYear, function(d){ return d[INDICATOR_SIZE]});

		scaleX.domain(xExtent);
		scaleY.domain(yExtent);
		scaleSize.domain(sizeExtent);

		drawChart(indicatorsByYear, plot);

		//Now let's deal with UI
		//UI elements trigger "state changes" in the visualization

		//Buttons
		d3.select("#show-all").on('click', function(d){
			scaleX = d3.scaleLog().domain(xExtent).range([0,w]);
			drawChart(indicatorsByYear, plot);
		});
		d3.select("#below-5000").on('click', function(d){
			scaleX = d3.scaleLinear().domain([0,5000]).range([0,w]);
			drawChart(indicatorsByYear, plot);
		});

		//Sliders
		svg.append('g').attr('class','slider-container')
			.attr('transform', `translate(${margin.l},30)`)
			.call(slider, w, [2015,2016,2017], function(value){
				console.group('Slider callback');
				console.log(value);
				console.groupEnd();

				const indicatorsByYear = filterByYear(indicators, value);
				drawChart(indicatorsByYear, plot);
			});

	});

function filterByYear(indicators, year){

	//filter indicators data by year...
	let indicatorsByYear = indicators.filter(function(d){
		return d.year === year
	});
	//...and roll them up by country
	indicatorsByYear = d3.nest()
		.key(function(d){return d.countryCode})
		.entries(indicatorsByYear)
		.map(function(d){
			d.values.forEach(function(s){
				d[s.series] = s.value;
			});
			return d;
		}) 

	return indicatorsByYear

}

function slider(selection, w, values, callback){

	const HEIGHT = 10;
	const scale = d3.scaleLinear().domain([values[0], values[values.length-1]]).range([0, w]);

	//First, we build the visual UI for the slider: line, ticks, and a grab handle
	selection.append('line')
		.attr('class','slider-range')
		.attr('x1',0)
		.attr('x2',w)
		.attr('y1',HEIGHT/2)
		.attr('y2',HEIGHT/2)
		.style('stroke', '#ccc')
		.style('stroke-width', '2px');
	selection.selectAll('.tick')
		.data(values)
		.enter()
		.append('circle').attr('class','tick')
		.attr('cx', function(d){return scale(d)})
		.attr('cy', HEIGHT/2)
		.attr('r', HEIGHT/2-1)
		.style('fill','white')
		.style('stroke', '#ccc')
		.style('stroke-width', '2px');
	const handle = selection.append('circle')
		.attr('r', HEIGHT/2 + 3)
		.style('fill','white')
		.style('fill-opacity', 0.01)
		.style('stroke', '#666')
		.style('stroke-width', '2px')
		.attr('cx', 0)
		.attr('cy', HEIGHT/2);

	//drag behavior
	const dragBehavior = d3.drag()
		.on('start', function(){})
		.on('drag', handleDrag)
		.on('end', handleDragEnd);

	handle.call(dragBehavior);

	function handleDrag(){
		console.log(d3.mouse(this));

		const x = d3.mouse(this)[0];
		handle.attr('cx', x);

	}

	function handleDragEnd(){
		const x = d3.mouse(this)[0];
		const year = Math.round(scale.invert(x));
		handle.attr('cx', scale(year));
		callback(year);
	}

}

function drawChart(data, plot){

	//Draw nodes
	const nodes = plot.selectAll('.node')
		.data(data, function(d){return d.key});

	const nodesEnter = nodes.enter()
		.append('g').attr('class','node');
	nodesEnter.append('circle');
	nodesEnter.append('text').attr('text-anchor','middle');

	nodes.merge(nodesEnter)
		.transition()
		.attr('transform', function(d){
			const x = scaleX(d[INDICATOR_X]);
			const y = scaleY(d[INDICATOR_Y]);
			return `translate(${x}, ${y})`
		});

	nodes.merge(nodesEnter)
		.select('circle')
		.style('fill-opacity', .1)
		.style('stroke', '#333')
		.style('stroke-width', '1.5px')
		.transition()
		.attr('r', function(d){return scaleSize(d[INDICATOR_SIZE])});

	nodes.merge(nodesEnter)
		.select('text')
		.style('font-size', '10px')
		.text(function(d){
			if(scaleSize(d[INDICATOR_SIZE]) > 16) return d.key;
			return null;
		});

	//Draw axes
	const axisX = d3.axisBottom()
		.scale(scaleX)
		.tickSize(-h);
	const axisY = d3.axisLeft()
		.scale(scaleY)
		.tickSize(-w);

	plot.select('.axis-x').transition().call(axisX);
	plot.select('.axis-y').transition().call(axisY);

}


function parseData(d){

	const country = d['Country Name'];
	const countryCode = d['Country Code'];
	const series = d['Series Name'];
	const seriesCode = d['Series Code'];

	delete d['Country Name'];
	delete d['Country Code'];
	delete d['Series Name'];
	delete d['Series Code'];

	const records = [];

	for(key in d){
		records.push({
			country:country,
			countryCode:countryCode,
			series:series,
			seriesCode:seriesCode,
			year:+key.split(' ')[0],
			value:d[key]==='..'?null:+d[key]
		})
	}

	return records;

}

function parseMetadata(d){

	//Minimal parsing required; return data as is
	return d;

}