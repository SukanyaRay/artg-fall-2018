//Sukanya Ray
//Comparing Country Populations between 1960 and 2017

/*Unfortunately, I couldn't manage a slider in time, 
but wrote out the logic the best that I could*/


//Data import and parse
const data = d3.csv('World Country Populations.csv', parse);
const m = {t:10, r:50, b:20, l:50};
const w = d3.select('.plot').node().clientWidth - m.l - m.r;
const h = d3.select('.plot').node().clientHeight - m.t - m.b;

//Scales
const scalePop1960 = d3.scaleLog().range([h,0]);
const scalePop2017 = d3.scaleLog().range([h,0]);
//const scaleYear = d3.scaleLinear().domain([0,w]);
const scaleCountry = d3.scaleOrdinal();

//Append <svg>
const plot = d3.select('.plot')
	.append('svg')
	.attr('width', w + m.l + m.r)
	.attr('height', h + m.t + m.b)
	.append('g')
	.attr('transform', `translate(${m.l}, ${m.t})`);
plot.append('g')
	.attr('class', 'axis-y');
plot.append('g')
	.attr('class', 'axis-x')
	.attr('transform', `translate(0, ${h})`);

//

plot.append('g').attr('class','slider-container')
			.attr('transform', `translate(${m.l},30)`)
			.call(slider, w, [1960,2017], function(value){
				console.log(value);
				console.groupEnd();

				const indicatorsByYear = filterByYear(indicators, value);
				drawChart(indicatorsByYear, plot);
			});

////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////

data.then(function(rows){
	console.log(rows);
	//Data discovery
	//Range 1960 Population
	const pop_min_1960 = d3.min(rows, function(d){ return d.yr1960 });
	const pop_max_1960 = d3.max(rows, function(d){ return d.yr1960 });
	console.log(pop_min_1960, pop_max_1960);

	//Range 2017 Population
	const pop_min_2017 = d3.min(rows, function(d){ return d.yr2017 });
	const pop_max_2017 = d3.max(rows, function(d){ return d.yr2017 });
	console.log(pop_min_2017, pop_max_2017);
	
	//Countries
	const countries = d3.nest()
		.key(function(d){ return d.country_name })
		.entries(rows)
		.map(function(d){ return d.key });
	console.log(countries);

	//Use the data gathered during discovery to set the scales appropriately
	scalePop1960.domain([1500, pop_max_1960]);
	scalePop2017.domain([1500, pop_max_2017]);
	//scaleYear.domain([1960, 2017 ]);
	scaleCountry.domain(countries).range(d3.range(countries.length).map(function(d){
		return (w-100)/(countries.length-1)*d + 50;
	
	////////////////////

		
}));





//Plot 1960s population
populationByYear(rows, scalePop1960, 'yr1960');

//Plot 2017 population
//population2017(rows);

//Switch between the two plots
	d3.select('#population-1960')
	.on('click', function(){
		d3.event.preventDefault();
		populationByYear(rows, scalePop1960, 'yr1960');
	});

	d3.select('#population-2017')
	.on('click', function(){
		d3.event.preventDefault();
		populationByYear(rows, scalePop2017, 'yr2017');
	})

});

   

function populationByYear(data, scale, attribute){
	const nodes = plot.selectAll('.node')
		.data(data) //UPDATE set

	const nodesEnter = nodes.enter()
		.append('circle')
		.attr('class', 'node'); //ENTER set

	nodesEnter.merge(nodes) //ENTER + UPDATE set
		.transition()
		.attr('r', 2)
		.style('fill','black')
		.style('fill-opacity', 1)
		.attr('cx', function(d){return scaleCountry(d.country_name)})
		.attr('cy', function(d){return scale(d[attribute])}); ////attribute is a string 

//Draw axes
	const axisY = d3.axisLeft()
		.scale(scalePop2017)
		.tickSize(-w);
	const axisX = d3.axisBottom()
		.scale(scaleCountry); 
		

	plot.select('.axis-y')
		.transition()
		.call(axisY)
		.selectAll('line')
		.style('stroke-opacity', 0.1);
	plot.select('.axis-x')
		.transition()
		.call(axisX);
}

////slider function
function slider(selection, w, values, callback){

	const HEIGHT = 10;
	const scale = d3.scaleLinear().domain([values[0], values[values.length-1]]).range([0, w]);

	//Visual UI for the slider: line, ticks, and a grab handle
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

	//Drag
	////struggled to find a way to constrain the handle within the ends
	////of the slider
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

function parse(d){
	return {
		country_name: d.country_name,

		yr1960: +d.yr1960,
		/*yr1961: d.yr1961,
		yr1962: d.yr1962,
		yr1963: d.yr1963,
		yr1964: d.yr1964,
		yr1965: d.yr1965,
		yr1966: d.yr1966,
		yr1967: d.yr1967,
		yr1968: d.yr1968,
		yr1969: d.yr1969,

		yr1970: d.yr1970,
		yr1971: d.yr1971,
		yr1972: d.yr1972,
		yr1973: d.yr1973,
		yr1974: d.yr1974,
		yr1975: d.yr1975,
		yr1976: d.yr1976,
		yr1977: d.yr1977,
		yr1978: d.yr1978,
		yr1979: d.yr1979,

		yr1980: d.yr1980,
		yr1981: d.yr1981,
		yr1982: d.yr1982,
		yr1983: d.yr1983,
		yr1984: d.yr1984,
		yr1985: d.yr1985,
		yr1986: d.yr1986,
		yr1987: d.yr1987,
		yr1988: d.yr1988,
		yr1989: d.yr1989,

		yr1990: d.yr1990,
		yr1991: d.yr1991,
		yr1992: d.yr1992,
		yr1993: d.yr1993,
		yr1994: d.yr1994,
		yr1995: d.yr1995,
		yr1996: d.yr1996,
		yr1997: d.yr1997,
		yr1998: d.yr1998,
		yr1999: d.yr1999,

		yr2000: d.yr2000,
		yr2001: d.yr2001,
		yr2002: d.yr2002,
		yr2003: d.yr2003,
		yr2004: d.yr2004,
		yr2005: d.yr2005,
		yr2006: d.yr2006,
		yr2007: d.yr2007,
		yr2008: d.yr2008,
		yr2009: d.yr2009,

		yr2010: d.yr2010,
		yr2011: d.yr2011,
		yr2012: d.yr2012,
		yr2013: d.yr2013,
		yr2014: d.yr2014,
		yr2015: d.yr2015,
		yr2016: d.yr2016,*/
		yr2017: +d.yr2017
	}
}