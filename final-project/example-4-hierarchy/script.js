//Prep work 
const W = d3.select('.chart').node().clientWidth;
const H = d3.select('.chart').node().clientHeight;
const margin = {t:32, r:16, b:64, l:64};
const w = W - margin.l - margin.r;
const h = H - margin.t - margin.b;

const plot = d3.select('.chart')
	.append('svg')
		.attr('width', W)
		.attr('height', H)
	.append('g')
		.attr('class','plot')
		.attr('transform', `translate(${margin.l}, ${margin.t})`);

//Load data
const dataPromise = d3.csv('../data/data.csv', parseData)
.then(function(rows){ 
	return rows.reduce(function(acc,val){return acc.concat(val)}, []); 
});
const metadataPromise = d3.csv('../data/countries-metadata.csv', parseMetadata);
const geojsonPromise = d3.json('../data/countries.geojson');

Promise.all([dataPromise, metadataPromise, geojsonPromise])
	.then(function([data, metadata, geojson]){

		//First, filter the data for the indicator and year that we are interested in
		const YEAR = 2017;
		const INDICATOR = 'Children (0-14) living with HIV';
		const indicatorData = data.filter(function(d){
				return d.year === YEAR;
			}).filter(function(d){
				return d.series === INDICATOR;
			});


		//Now we must augment indicatorData by providing each country with its corresponding region of the world
		const metadataMap = d3.map(metadata, function(d){ return d.Code });
		indicatorData.forEach(function(d){
			const region = metadataMap.get(d.countryCode).Region;
			d.region = region;
		});

		drawPack(indicatorData, plot);

	});

function drawPack(data, selection){

	//Further transform the data by nesting it by region
	const dataByRegion = d3.nest()
		.key(function(d){return d.region})
		.entries(data);

	const nestedData = {
		key:'root',
		values: dataByRegion
	};

	//Convert this nested data into a d3 hierarchy object
	//Note we provide the "children" accessor function
	//and specify how we derive the value of each node through the "sum" function
	//See d3.hierarchy API for a refresher
	const rootNode = d3.hierarchy(nestedData, function(d){return d.values})
		.sum(function(d){ return d.value });

	//Use pack layout to further transform the data
	const pack = d3.pack().size([w, h]);
	pack(rootNode);

	//Nodes data: data of nodes that we actually want to draw
	const nodesData = rootNode.descendants().filter(function(d){
		return d.depth > 0 && d.value > 0
	});

	//Use enter/exit/update
	const nodes = plot.selectAll('.node')
		.data(nodesData);

	const nodesEnter = nodes.enter()
		.append('g').attr('class','node');
	nodesEnter.append('text');
	nodesEnter.append('circle');

	nodes.merge(nodesEnter)
		.transition()
		.attr('transform', function(d){
			return `translate(${d.x}, ${d.y})`
		});
	nodes.merge(nodesEnter)
		.select('circle')
		.transition()
		.attr('r', function(d){
			return d.r
		})
		.style('fill-opacity', 0.2)
		.style('stroke', '#333')
		.style('stroke-width', '1.5px');
	nodes.merge(nodesEnter)
		.filter(function(d){ return d.depth > 1 && d.r > 20})
		.select('text')
		.text(function(d){ 
			return `${d.data.country}: ${d.value}`
		})
		.attr('text-anchor','middle')
		.style('font-size', '10px');

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