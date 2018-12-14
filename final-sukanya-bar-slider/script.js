//specifying width/height/margins
var data = {};
const m = {t:10, r:50, b:20, l:50};
const w = d3.select('.plot').node().clientWidth - m.l - m.r;
const h = d3.select('.plot').node().clientHeight - m.t - m.b;

//append svg
const plot = d3.select('.plot')
	.append('svg')
	.attr('width', w + m.l + m.r)
	.attr('height', h + m.t + m.b)
	.append('g')
	.attr('transform', `translate(${m.l}, ${m.t})`);

//x and y scales
var x_scale = d3.scaleBand()
    .rangeRound([0, w])
    .padding(0.1);

var y_scale = d3.scaleLinear()
    .range([h, 0]);

var y_axis = d3.axisLeft(y_scale);
var x_axis = d3.axisBottom(x_scale);

plot.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + h + ')');

plot.append('g')
    .attr('class', 'y axis');


function draw(year) {
    var csv_data = data[year];

    var t = d3.transition()
        .duration(2000);

    var country_name = csv_data.map(function(d) {
        return d.country_name;
    });
    x_scale.domain(country_name);

    var max_value = d3.max(csv_data, function(d) {
        return +d.value;
    });

    y_scale.domain([0, max_value]);

    var bars = plot.selectAll('.bar')
        .data(csv_data)

    //exit
    bars
        .exit()
        .remove();

    //enter
    var new_bars = bars
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) {
            return x_scale(d.country_name);
        })
        .attr('width', x_scale.bandwidth())
        .attr('y', h)
        .attr('height', 0)

    
    new_bars.merge(bars)
        .transition(t)
        .attr('y', function(d) {
            return y_scale(+d.value);
        })
        .attr('height', function(d) {
            return h - y_scale(+d.value)
        })

    plot.select('.x.axis')
        .call(x_axis);

    plot.select('.y.axis')
        .transition(t)
        .call(y_axis);

}


////// tried out a way to queue individual csv's directly, hoping it 
////// would be a better solution rather than parsing from one file. 
d3.queue()
    .defer(d3.csv, 'Populations 1960.csv')
    .await(function(error,d1960) {
        data['1960'] = d1960;
        draw('1960');
    });

var slider = d3.select('#year');
slider.on('change', function() {
    draw(this.value);
});