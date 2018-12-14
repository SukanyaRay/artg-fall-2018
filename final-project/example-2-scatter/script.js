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
			return d.series === 'Population, total' ||
				d.series === 'GDP per capita (constant 2010 US$)' ||
				d.series === 'Mortality rate, infant (per 1,000 live births)';		
		});
		//Nest indicator data, first by year, then by country
		const indicatorsByYearByCountry = d3.nest()
			.key(function(d){return d.year})
			.key(function(d){return d.country})
			.entries(indicators);
		//After this, we can pick out any year, let's say 2016
		const indicatorsByCountry2016 = indicatorsByYearByCountry
			.filter(function(d){return d.key === "2016"})[0]
			.values;



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
		drawScatter(indicatorsByCountry2016, plot);

	});

function drawScatter(data, selection){

	//When we receive data, we can perform one additional transformation to make life easier for us
	const countries = data.map(function(d){
		const datum = {};
		datum.country = d.key;
		datum.countryCode = d.values[0].countryCode;
		datum.year = d.values[0].year;
		d.values.forEach(function(s){
			datum[s.series] = s.value;
		});
		return datum;
	});

	console.log(countries);

	//The rest is a pretty straightforward scatterplot

	//Data discovery
	const populationExtent = d3.extent(countries, function(d){ return d['Population, total']});
	const gdpPerCapExtent = d3.extent(countries, function(d){ return d['GDP per capita (constant 2010 US$)']});
	const primaryCompletionExtent = d3.extent(countries, function(d){ return d['Mortality rate, infant (per 1,000 live births)']});

	//Use the extent to set scales
	const scaleX = d3.scaleLog().domain(gdpPerCapExtent).range([0,w]);
	const scaleY = d3.scaleLog().domain(primaryCompletionExtent).range([h,0]);
	const scaleSize = d3.scaleSqrt().domain(populationExtent).range([2,50]);

	//enter, exit, update...
	//UPDATE
	const nodes = plot.selectAll('.node')
		.data(countries, function(d){return d.countryCode});

	//ENTER
	const nodesEnter = nodes.enter()
		.append('g')
		.attr('class', 'node');
	nodesEnter.append('circle');
	nodesEnter.append('text');

	//ENTER + UPDATE
	nodes.merge(nodesEnter)
		.transition()
		.attr('transform', function(d){
			const x = scaleX(d['GDP per capita (constant 2010 US$)']);
			const y = scaleY(d['Mortality rate, infant (per 1,000 live births)']);
			return `translate(${x}, ${y})`;
		});
	nodes.merge(nodesEnter)
		.select('circle')
		.transition()
		.attr('r', function(d){
			const r = scaleSize(d['Population, total']);
			return r;
		})
		.style('fill-opacity', 0.3)
		.style('stroke', '#333')
		.style('stroke-width','2px')
		.style('fill', function(d){
			const region = metadataMap.get(d.countryCode).Region;
			return scaleColor(region);
		});
	nodes.merge(nodesEnter)
		.select('text')
		.text(function(d){
			return d.countryCode;
		})
		.attr('text-anchor','middle')
		.style('fill', '#666')
		.style('font-size', '10px');

	//EXIT
	nodes.exit().remove();

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