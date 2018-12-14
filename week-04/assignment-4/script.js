console.log('Assignment 4');

//Append a <svg> element to .chart, and set its width and height attribute to be the same as .chart
//Hint: first, you have to find the width and height of .chart. See example for width below
const width = d3.select('.chart').node().clientWidth;
const height = d3.select('.chart').node().clientHeight;

//Then append the following elements under <svg>:

const mychart = d3.select('.chart')
    .append('svg')
    .attr('width',width)
    .attr('height',height);


//Horizontal and vertical grid lines, spaced 50px apart
//Hint: use a loop to do this

let spacing = 50;

for (let i=0; i < (width/spacing); i++) {
    mychart.append('line')
        .attr('x1',i*spacing)
        .attr('y1',0)
        .attr('x2',i*spacing)
        .attr('y2',height)
        .attr('stroke','White');
}

for (let i=0; i < (height/spacing); i++) {
    mychart.append('line')
        .attr('x1',0)
        .attr('y1',i*spacing)
        .attr('x2',width)
        .attr('y2',i*spacing)
        .attr('stroke','White');
}

//Circle, radius 50px, center located at (50,50)

let r1 = 50, cx1 = 50, cy1 = 50;

mychart.append('circle')
        .attr('cx',cx1)
        .attr('cy',cy1)
        .attr('r',r1);

//Another circle, radius 75px, center located at (300,200)
//Do this without setting the "cx" and "cy" attributes

let r2 = 75, cx2 = 300, cy2 = 200;

mychart.append('circle')
        .attr('transform',`translate(${cx2}, ${cy2})`)
        .attr('r',r2);

//A rectangle, offset from the left edge by 400px and anchored to the bottom
//with a width of 50px and a height of 70px

mychart.append('rect')
        .attr('x',400)
        .attr('y',height-70)
        .attr('width',50)
        .attr('height',70);


//Label the centers of the two circles with their respective coordinates

mychart.append('text')
    .text(`(${cx1},${cy1})`)
    .attr('x',cx1)
    .attr('y',cy1)
    .attr('fill','white');

mychart.append('text')
    .text(`(${cx2},${cy2})`)
    .attr('x',cx2)
    .attr('y',cy2)
    .attr('fill','white');


//Give the <rect> element a fill of rgb(50,50,50), and no stroke
//Do this without using CSS

mychart.select('rect').attr('fill','rgb(50,50,50)');


//Give the two <circle> elements no fill, and a 2px blue outline
//Do this by giving them a class name and applying the correct CSS

mychart.selectAll('circle')
    .attr('fill','none')
    .attr('stroke', 'blue')
    .attr('stroke-width',2);


//Uncomment the following block of code, and see what happens. Can you make sense of it?
d3.selectAll('circle')
	.transition() // add a css animation
	.duration(3000) // the animation should be 3 sec long
	.attr('r', 200); // the radius should change to 200