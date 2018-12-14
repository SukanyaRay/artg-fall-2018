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
const axisXNode = plot.append('g').attr('class','axis-x axis');
const axisYNode = plot.append('g').attr('class','axis-y axis');

//Global variables
let metadataMap;
let scaleColor = d3.scaleOrdinal();

//Data import
const dataPromise = d3.csv('../data/data.csv', parseData)
.then(function(rows){ 
	return rows.reduce(function(acc,val){return acc.concat(val)}, []); 
});
const metadataPromise = d3.csv('../data/countries-metadata.csv', parseMetadata);
const geojsonPromise = d3.json('../data/countries.geojson');

Promise.all([dataPromise, metadataPromise, /*geojsonPromise*/])
	.then(function([data, metadata, /*geojson*/]){

		//Perform necessary data structuring
		//Pick out relevant indicator data
		const indicators = data.filter(function(d){
			return d.series === 'International migrant stock (% of population)';
		})
			.filter(function(d){
				return d.value !== null; //filter out empty values
			});
		//Nest indicator data by country
		//What is the shape of the data now?
		const migrantStockByCountry = d3.nest()
			.key(function(d){return d.country})
			.entries(indicators);



		//Let's also do a little data manipulation on metadata
		//What are the different regions of the world?
		const regions = d3.nest()
			.key(function(d){ return d.Region })
			.entries(metadata)
			.map(function(d){ return d.key });

		console.log(regions);
		//Using the regions of the world, we can construct a color (ordinal) scale
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
			])
		//Let's also make a "lookup" map, so we can find what region a country belongs to
		metadataMap = d3.map(metadata, function(d){ return d.Code });


		//Now that we have the data we want, pass it into a function to draw the chart
		drawLineChart(migrantStockByCountry, plot);

	});

function drawLineChart(data, selection){

	//Set up scales. Note that we don't really rely on data discovery here
	const scaleX = d3.scaleLinear().domain([1965, 2018]).range([0,w]);
	const scaleY = d3.scaleLinear().domain([0,100]).range([h,0]);

	//Line generator
	const line = d3.line()
		.x(function(d){ return scaleX(d.year) })
		.y(function(d){ return scaleY(d.value) });

	//enter, exit, update
	const paths = plot.selectAll('.country-line')
		.data(data, function(d){ return d.key });

	const pathsEnter = paths.enter()
		.append('path').attr('class', 'country-line')

	paths.merge(pathsEnter)
		.transition()
		.attr('d', function(d){
			return line(d.values);
		})
		.style('fill', 'none')
		.style('stroke-width','2px')
		.style('stroke', function(d){
			const region = metadataMap.get(d.values[0].countryCode).Region;
			return scaleColor(region);
		})
		.style('stroke-opacity', .3);

	//Axes
	const axisX = d3.axisBottom()
		.scale(scaleX)
		.tickSize(-h);
	const axisY = d3.axisLeft()
		.scale(scaleY)
		.tickSize(-w);
	axisXNode.attr('transform',`translate(0, ${h})`)
		.transition()
		.call(axisX);
	axisYNode
		.transition()
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