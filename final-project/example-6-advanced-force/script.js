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

//Global variables, including indicators of interest and force layout functions
const INDICATOR_GDP_PER_CAP = 'GDP per capita (constant 2010 US$)';
const INDICATOR_GDP = 'GDP (constant 2010 US$)';

const scaleColor = d3.scaleOrdinal();
const scaleX = d3.scaleOrdinal();

const simulation = d3.forceSimulation();
const forceX = d3.forceX(function(d){return d.x0});
const forceY = d3.forceY(function(d){return d.y0});
const forceCollision = d3.forceCollide(function(d){return d.r});
simulation
	.force('positionX', forceX)
	.force('positionY', forceY)
	.force('r', forceCollision);

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
		const indicatorData = data.filter(function(d){
				return d.year === YEAR;
			}).filter(function(d){
				return d.series === INDICATOR_GDP || d.series === INDICATOR_GDP_PER_CAP;
			});

		//Nest by country, then roll up
		const countryData = d3.nest()
			.key(function(d){ return d.countryCode})
			.entries(indicatorData)
			.map(function(d){
				d.values.forEach(function(s){
					d[s.series] = s.value
				});
				return d;
			});

		//Now we must augment indicatorData by providing each country with its corresponding region of the world
		const metadataMap = d3.map(metadata, function(d){ return d.Code });

		countryData.forEach(function(d){
			const region = metadataMap.get(d.key).Region;
			const incomeGroup = metadataMap.get(d.key)['Income Group'];
			d.region = region;
			d.incomeGroup = incomeGroup;
		});

		//Set up scales
		//scaleX uses the incomeGroups as domain
		//scaleColor uses the regions as domain
		const incomeGroups = d3.nest()
			.key(function(d){return d['Income Group']})
			.entries(metadata)
			.map(function(d){ return d.key });
		const regions = d3.nest()
			.key(function(d){return d.Region})
			.entries(metadata)
			.map(function(d){ return d.key });

		scaleX.domain(incomeGroups)
			.range(d3.range(incomeGroups.length).map(function(d,i){
				return i * w/(incomeGroups.length - 1);
			}));
		scaleColor.domain(regions)
			.range([
				'#333', //undefined
				'rgb(0,0,255)', //South Asia
				'rgb(255,0,128)',
				'rgb(0,255,50)',
				'rgb(255,50,0)',
				'rgb(255,128,0)',
				'rgb(128,0,255)',
				'rgb(0,128,128)'
			]);

		drawChart(countryData, plot);

	});

function drawChart(data, plot){

	const maxGdpPerCap = d3.max(data, function(d){ return d[INDICATOR_GDP_PER_CAP] });
	const scaleY = d3.scaleLog().domain([100, maxGdpPerCap]).range([h, 0]).clamp(true);

	const maxGdp = d3.max(data, function(d){ return d[INDICATOR_GDP] });
	const scaleSize = d3.scaleSqrt().domain([0, maxGdp]).range([2, 30]);

	data.forEach(function(d){
		d.x0 = scaleX(d.incomeGroup);
		d.y0 = scaleY(d[INDICATOR_GDP_PER_CAP]);
		d.x = scaleX(d.incomeGroup);
		d.y = scaleY(d[INDICATOR_GDP_PER_CAP]);
		d.r = scaleSize(d[INDICATOR_GDP]);
	});

	//Enter / exit / update
	const nodes = plot.selectAll('.node')
		.data(data);

	const nodesEnter = nodes.enter()
		.append('g')
		.attr('class', 'node');
	nodesEnter.append('circle');

	nodes.merge(nodesEnter)
		.attr('transform', function(d){ return `translate(${d.x}, ${d.y})`})
		.select('circle')
		.attr('r', function(d){ return scaleSize(d[INDICATOR_GDP]) })
		.attr('fill', function(d){ return scaleColor(d.region) })
		.style('fill-opacity', .4)
		.style('stroke', '#333')
		.style('stroke-width', '1.5px');

	//Start / restart force simulation
	simulation.nodes(data)
		.on('tick', function(){
			nodes.merge(nodesEnter)
				.attr('transform', function(d){ return `translate(${d.x}, ${d.y})`})
		})
		.restart();

	//axis
	const axisY = d3.axisLeft()
		.scale(scaleY)
		.tickSize(-w);

	plot.append('g').attr('class','axis axis-y')
		.call(axisY);

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