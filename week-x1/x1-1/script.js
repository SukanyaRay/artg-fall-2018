console.log("Week 11: geographical representation part I");

//Full list of projections here:
//https://github.com/d3/d3-geo-projection

//Examples of mapping projects here
//http://bl.ocks.org/palewire/d2906de347a160f38bc0b7ca57721328

const lngLatBoston = [-71.0589, 42.3601]; 

d3.json('./countries.geojson')
	.then(function(data){

		console.log(data);
	
		renderCylindricalProjection(data, document.getElementById('chart-1'));
		renderAzimuthalMap(data, document.getElementById('chart-2'));
		renderConicalProjection(data, document.getElementById('chart-3'));
		renderCollection(data, document.getElementById('chart-4'));

	});

function renderCylindricalProjection(geo, dom){
	console.log('Render world map in cylindrical projection');

	//Append DOM
	const w = dom.clientWidth;
	const h = dom.clientHeight;
	const plot = d3.select(dom).append('svg')
		.attr('width', w)
		.attr('height', h);

	//Create a projection function
	const projection = d3.geoMercator() ////going to output x y coordinates 
	////we need to project a globe onto a 2d canvas
		.center(lngLatBoston) ////Boston is the center of this projection
		.translate([w/2, h/2])////applying Boston to the center of the actual canvas
		//.precision(0)
		.scale(200)////just gotta toggle this 
		//.clipAngle(45)


	const xy = projection(lngLatBoston);
	console.log(xy);

	plot.append('circle')
		.datum(projection(lngLatBoston)) ////datum cuz theres only one thing of data
		.attr('cx', function(d){return d[0]})
		.attr('cy', function(d){return d[1]})
		.attr('r', 10)

	//generate geopath elements
	const pathGenerator = d3.geoPath(projection); ////draws the element(country, etc)

	plot.append('path')
		.datum(geo)
		.attr('d', function(d){return pathGenerator(d)} )////d stands for geometry, not data


	const graticules = d3.geoGraticule();////drawing long lat lines 

	plot.append('path')
		.datum(graticules)
		.attr('d', function(d){return pathGenerator(d)})
		.style('stroke','#333')
		.style('stroke-opacity', .2)
		.style('stroke-width','1px')
		.style('fill','none')
}





function renderAzimuthalMap(geo, dom){
	console.log('Render world map in azimuthal projection');

	//Append DOM
	const w = dom.clientWidth;
	const h = dom.clientHeight;
	const plot = d3.select(dom).append('svg')
		.attr('width', w)
		.attr('height', h);

	//Create a projection function
	const projection = d3.geoOrthographic()
		.translate([w/2, h/2])
		.precision(0)
		.rotate([-lngLatBoston[0],-lngLatBoston[1],0])

	console.group('Azimuthal projection properties');
	console.log(`Scale: ${projection.scale()}`)
	console.log(`Center: ${projection.center()}`)
	console.log(`Translate: ${projection.translate()}`);
	console.groupEnd();

	//Create a geoPath generator
	const pathGenerator = d3.geoPath(projection);

	//Render geo path
	plot.append('path')
		.datum(geo)
		.attr('d', pathGenerator);

	//Render a single point
	plot.append('circle')
		.datum(lngLatBoston)
		.attr('cx', function(d){ return projection(lngLatBoston)[0] })
		.attr('cy', function(d){ return projection(lngLatBoston)[1] })
		.attr('r', 6)
		.style('stroke','black')
		.style('stroke-width', '2px')
		.style('fill', 'yellow');

	//Create a graticules generator
	const graticules = d3.geoGraticule()

	//Render graticules
	plot.append('path')
		.attr('class', 'graticules')
		.datum(graticules)
		.attr('d', pathGenerator)
		.style('stroke','#333')
		.style('stroke-opacity', .2)
		.style('stroke-width','1px')
		.style('fill','none')

}

function renderConicalProjection(geo, dom){

}

function renderCollection(geo, dom){
	console.log('Render world map in cylindrical projection with different data binding');

	//Append DOM
	const w = dom.clientWidth;
	const h = dom.clientHeight;
	const plot = d3.select(dom).append('svg')
		.attr('width', w)
		.attr('height', h);

	const projection = d3.geoMercator()
		.translate([w/2,h/2])
		.scale(150)
		//.fitExtent([0,0], [w,h], geo)////fit geojson data into a bounding box

	const pathGenerator = d3.geoPath(projection);

	//plot.append('path')
	//	.datum(geo)
	//	.attr('d', pathGenerator)

		console.log(geo.features);

		plot.selectAll('path')
			.data(geo.features, function(d){return d.properties.ISO_A3})
			.enter()
			.append('path')
			.attr('d', pathGenerator)
			.style('fill', function(d,i){
				return `rgb${i}, ${255-i}, 255)`;
			})
			.on('mouseenter', function(d,i){
				d3.select(this)    //this is the DOM node
					.style('stroke','black')
					.style('stroke', '1px') 
			})
			.on('mouseleave', function(){
				d3.select(this)
					.style('stroke','black')
					.style('stroke', '0px')
			})
		
}

