//This example demonstrates how you might import data from different sources


const W = d3.select('.plot').node().clientWidth;
const H = d3.select('.plot').node().clientHeight;
const margin = {t:50, r:50, b:50, l:50};
const w = W - margin.l - margin.r;
const h = H - margin.t - margin.b;

const plot = d3.select('.plot')
	.append('svg')
	.attr('width',W)
	.attr('height',H)
	.append('g')


const dataPromise = d3.csv('../data/data-test.csv', parseData)
.then(function(rows){ 
	return rows.reduce(function(acc,val){return acc.concat(val)}, []); 
});
const metadataPromise = d3.csv('../data/countries-metadata.csv', parseMetadata);
const geojsonPromise = d3.json('../data/countries.geojson');

Promise.all([dataPromise, metadataPromise, geojsonPromise])
	.then(function([data, metadata, geojson]){


		////the UI
		const selectMenu = d3.select('container').append('select')
			.attr('class','custom-select');
		[2015,2016,2017].forEach(function(d){
			selectMenu
				.append('option')
				.attr('value', d)
				.html(d);
		});

		selectMenu.on('change', function(){
			//re-filter data


			//re-flatten data 
		})


		////Nesting the data
		////create year-country-indicator per country
		const dataByYearByCountry = d3.nest()
			.key(function(d){return d.year})
			.key(function(d){return d.countryCode})
			.entries(data);

		console.log(dataByYearByCountry);

		////to just get 2015 values:
		////const dataBy2015 = dataByYearByCountry[0];
////array of countries 


		/***
        Current:
        [
            {
                key:'AFG',
                values: [
                    {series: 'Population total', value:123, ...},
                    {series: 'GDP per cap', value:123 ...},
                    {series: 'Infant', value: 123}
                ]
            }
        ] x 217

        ***/

        /***
        Goal:
        [
            {
                key:'AFG',
                'Population total': 123,
                'GDP per cap': 123,
                'Population': 123
            }
            ...
            ...
            ...
        ] x 217
        **/

	});

function pickDataByYear(dataByYear,year){

	////or filter:
		///pick one year, have a country-indicator heirarchy 
		const dataBy2016 = dataByYearByCountry
			.filter(function(d){return +d.key == year})[0].values; ////shows us the three indicators of the year 2016
		console.log(dataBy2016); 
	 ////flatten data so all the indicators are parallel to the key
        const nodesData = dataBy2016.map(function(country){

        	const key = country.key; ///"AFG"
        	const indicators = country.values; ////the array of 3

        	const output = {};
        	output.key = key;

        	indicators.forEach(function(indicator){
        		output[indicator.series] = indicator.value;
        	});
        	return output;
        });
}

function drawChart(data, domSelection){
	const POP_INDICATOR_NAME = 'Population, total';
    const GDP_PER_CAP_INDICATOR_NAME = 'GDP per capita (constant 2010 US$)';
    const INFANT_MORT_INDICATOR_NAME = 'Mortality rate, infant (per 1,000 live births)';

    //Draw viz under domSelection, based on dataPromise
    const popExtent = d3.extent(data, function(d){ return d[POP_INDICATOR_NAME]});
    const gdpPerCapExtent = d3.extent(data, function(d){ return d[GDP_PER_CAP_INDICATOR_NAME]});
    const infantMortExtent = d3.extent(data, function(d){ return d[INFANT_MORT_INDICATOR_NAME]});

    
    //Scale
    const scaleX = d3.scaleLog().domain(gdpPerCapExtent).range([0,w]);
    const scaleY = d3.scaleLinear().domain(infantMortExtent).range([h,0]);
    const scaleSize = d3.scaleSqrt().domain(popExtent).range([5,50]);

    //enter exit update
    const nodes = plot.selectAll('.country-node')
        .data(data, function(d){ return d.key });

    const nodesEnter = nodes.enter()
        .append('g').attr('class','country-node');
    nodesEnter.append('circle');
    nodesEnter.append('text');

    //
    nodes.merge(nodesEnter) //UPDATE + ENTER
        .attr('transform', function(d){
            const x = scaleX(d[GDP_PER_CAP_INDICATOR_NAME]);
            const y = scaleY(d[INFANT_MORT_INDICATOR_NAME]);
            return `translate(${x}, ${y})`;
        })
        .select('circle')
        .attr('r', function(d){ return scaleSize(d[POP_INDICATOR_NAME]) })
        .style('fill-opacity', .2)
        .style('stroke', '#333')
        .style('stroke-width', '1.5px');

    nodes.merge(nodesEnter)
        .select('text')
        .text(function(d){ return d.key })
        .attr('text-anchor','middle')
        .style('font-size', '10px');

        //axes
        const axisX = d3.axisBottom()
        	.scale(scaleX)
        	
        const axisY = d3.axisLeft()
        	.scale(scaleY)

        const axisXNode=plot.append('g')
        	.attr('class', 'axis axis-x')
        	.attr('transform', `translate(0, ${h})`)
        	.call(axisX);

        const axisYNode=plot.append('g')
        	.attr('class', 'axis axis-y')
        	call(axisY);




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