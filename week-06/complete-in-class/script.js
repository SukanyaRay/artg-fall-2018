//Data import and parse
const data = d3.csv('../../data/nyc_permits.csv', parse);
const scaleX = d3.scaleLog();
const scaleY = d3.scaleLog();
const scaleColor = d3.scaleOrdinal().range([
		'#f26633', //red
		'blue',
		'white',
		'#00a651', //green
		'yellow'
	]);
const m = {t:50, r:50, b:50, l:50};

data.then(function(rows){
	
	//The plan:
	//Plot d.cost_estimate on the y axis
	//Plot d.square_footage on the x axis
	//Use a categorical attribute to color

	//First mine the data for max and min across the two dimensions
	//As well as the categorical values used to map color
	const costEstimateExtent = d3.extent(rows, function(d){ return d.cost_estimate });
	const squareFootageExtent = d3.extent(rows, function(d){ return d.square_footage });
	let colorBy = 'borough';
	const colorDomain = d3.nest()
		.key(function(d){ return d[colorBy] })
		.entries(rows)
		.map(function(d){ return d.key });

	//Modify scales
	scaleX.domain([1, squareFootageExtent[1]]);
	scaleY.domain([1, costEstimateExtent[1]]);
	scaleColor.domain(colorDomain);
	console.log(colorDomain);

	//Select the two plot areas
	const plot1 = d3.select('#plot-1');
	const plot2 = d3.select('#plot-2');

	//Call functions to draw the chart
	chart1(plot1, rows);
	chart2(plot2, rows);

});

function chart1(selection, data){

	const w = selection.node().clientWidth - m.l - m.r;
	const h = selection.node().clientHeight - m.t - m.b;

	scaleX.range([0,w]);
	scaleY.range([h,0]);

	//Append DOM elements
	const svg = selection.append('svg')
		.attr('width', w + m.l + m.r)
		.attr('height', h + m.t + m.b);
	const chart = svg.append('g')
		.attr('class', 'chart')
		.attr('transform', `translate(${m.l}, ${m.t})`);

	//Here, we draw the same information as in chart 1, using a different patter
	chart.selectAll('circle')
		.data(data)
		.enter()
		.append('circle')
		.attr('cx', function(d){ return scaleX(d.square_footage) })
		.attr('cy', function(d){ return scaleY(d.cost_estimate) })
		.attr('r', 1.5)
		.style('fill-opacity', .4)
		.style('fill', function(d){ return scaleColor(d.borough) });

	//Bonus: draw axis
	const axisX = d3.axisBottom()
		.scale(scaleX)
		.tickSize(-h);
	const axisY = d3.axisLeft()
		.scale(scaleY)
		.tickSize(-w);

	chart.append('g')
		.attr('transform', `translate(0, ${h})`)
		.call(axisX)
		.selectAll('line')
		.style('stroke-opacity', .1);

	chart.append('g')
		.call(axisY)
		.selectAll('line')
		.style('stroke-opacity', .1);

}

function chart2(selection, data){

	const w = selection.node().clientWidth - m.l - m.r;
	const h = selection.node().clientHeight - m.t - m.b;

	scaleX.range([0,w]);
	scaleY.range([h,0]);

	//Append DOM elements
	const svg = selection.append('svg')
		.attr('width', w + m.l + m.r)
		.attr('height', h + m.t + m.b);
	const chart = svg.append('g')
		.attr('class', 'chart')
		.attr('transform', `translate(${m.l}, ${m.t})`);

	//For each "row" in the data, draw a corresponding symbol
	data.forEach(function(d){

		const x = scaleX(d.square_footage);
		const y = scaleY(d.cost_estimate);
		const color = scaleColor(d.borough);

		chart.append('circle')
			.attr('cx', x)
			.attr('cy', y)
			.attr('r', 1.5)
			.style('fill-opacity', .4)
			.style('fill', color);
			//.style('stroke-opacity', .3)
			//.style('stroke', '#000')

	});

	//Bonus: draw axis
	const axisX = d3.axisBottom()
		.scale(scaleX)
		.tickSize(-h);
	const axisY = d3.axisLeft()
		.scale(scaleY)
		.tickSize(-w);

	chart.append('g')
		.attr('transform', `translate(0, ${h})`)
		.call(axisX)
		.selectAll('line')
		.style('stroke-opacity', .1);

	chart.append('g')
		.call(axisY)
		.selectAll('line')
		.style('stroke-opacity', .1);

}

function parse(d){
	return {
		applicant_business_name:d.applicant_business_name,
		borough:d.borough,
		community_board:d.community_board,
		cost_estimate:+d.cost_estimate, //convert string to number
		enlargement:d.enlargement_flag_yes_no === "true"?true:false, //convert string to boolean
		address: `${d.job_location_house_number} ${d.job_location_street_name}`,
		job_number:+d.job_number,
		job_type:d.job_type,
		job_type2:d.job_type2,
		permit_type:d.permit_type,
		permit_issuance_date:new Date(d.permit_issuance_date),
		square_footage:+d.square_footage
	}
}