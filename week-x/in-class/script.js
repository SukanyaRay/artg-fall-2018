//Please read documentation here:
//https://github.com/d3/d3-hierarchy
console.log("Week 10: visualizing hierarchical data");

//Import data using d3.json: note similarity to d3.csv
const margin = {t:50, r:50, b:50, l:50};
const json = d3.json('./flare.json'); ////importing json file
const depthScale = d3.scaleOrdinal() ////domain and range are mapped
	.domain([0,1,2,3,4])
	.range([null, 'red', '#03afeb', 'yellow', 'green']);

//Bonus content: tooltip
//Append DOM for tooltip
const tooltip = d3.select('.container')
	.append('div')
	.attr('class','tooltip')
	.style('position', 'absolute')
	.style('width', '180px')
	.style('min-height', '50px')
	.style('background', '#333')
	.style('color', 'white')
	.style('padding', '15px')
	.style('opacity', 0);
tooltip.append('p').attr('class', 'key');
tooltip.append('p').attr('class', 'value')

function enableTooltip(selection){
	selection
		.on('mouseenter', function(d){
			const xy = d3.mouse(d3.select('.container').node());
			tooltip
				.style('left', xy[0]+'px')
				.style('top', xy[1] + 20 +'px')
				.transition()
				.style('opacity', 1);
			tooltip
				.select('.key')
				.html(d.data.name);
			tooltip
				.select('.value')
				.html(d.value);
		})
		.on('mouseleave', function(d){
			tooltip
				.style('opacity',0);
		});
}

json.then(function(data){

	//Note the repeating structure of this data
	console.log(data);////data is object

	//Data transformation:
	//Need to convert this into a d3-hierarchy object before further transformation
	const rootNode = d3.hierarchy(data)////returns tree structure of your data 
		.sum(function(d){ return d.value });////trying to find total value of children
											////look for d.value in the leaves and add them
		console.log(rootNode);
		console.log(rootNode.descendants); ////see all descendants of this node
											///flattens the tree into an array of objects
		console.log(rootNode.links);		////returns the links between the nodes. 
											////checking console, source is node the link starts at, target is the node where it ends
	
	//After this data transformation, we can produce a few different visualizations based on hierarchical data
	renderCluster(rootNode, document.getElementById('cluster')); ////(tree object made by d3.heirarchy, DOM node)
	renderTree(rootNode, document.getElementById('tree'));
	renderTree(rootNode, document.getElementById('tree-radial'), true);
	renderPartition(rootNode, document.getElementById('partition'));
	renderTreemap(rootNode, document.getElementById('treemap'));

})

function renderCluster(rootNode, rootDOM){ ////make a cluster graph

	console.group('Cluster');

	console.log(rootNode);
	////1: create an SVG canvas
	const W = rootDOM.clientWidth;
	const H = rootDOM.clientHeight;
	const w = W - margin.l - margin.r;
	const h = H - margin.t - margin.b;

	const plot = d3.select(rootDOM)
		.append('svg')
		.attr('width', W)
		.attr('height', H)
		.append('g')
		.attr('transform', `translate(${margin.l}, ${margin.r})`);


	////2: add an x and y so you can draw the thing
	const clusterTransform = d3.cluster().size([w,h])////gives data an x and y value within your w and h so we can draw them 
	console.log(clusterTransform);

	const dataTransformed = clusterTransform(rootNode);////puts the data in the desired space
	console.log(dataTransformed);

	const nodesData = dataTransformed.descendants();
	const linksData = dataTransformed.links();


	////3. draw the thing ENTER/EXIT/UPDATE
	const nodes = plot.selectAll('.node')
		.data(nodesData); ////update data
	const nodesEnter = nodes.enter()//// enter circles 1:1 per data
		.append('g')
		.attr('class','node');

	nodesEnter.append('circle');
	nodesEnter.append('text');

	nodesEnter.merge(nodes)
		.attr('transform', function(d){ ////each data is linked to a circle and x and y property 
			return `translate(${d.x}, ${d.y})`
		})

	nodesEnter.merge(nodes)
		.select('circle')
		.attr('r', 5) ////radius of 5
		.style('fill', function(d){
			return depthScale(d.depth);
		})

	nodesEnter.merge(nodes)
		.filter(function(d){return d.depth < 3})
		.select('text')
		.text(function(d){
			return `${d.data.name}: ${d.value}`;
		})

	////draw the links
	const links = plot.selectAll('.link')
		.data(linksData);
	const linksEnter = links.enter()
		.insert('line','.node')
		.attr('class','link');
	linksEnter.merge(links)
		.attr('x1', function(d){return d.source.x})
		.attr('x2',function(d){return d.target.x})
		.attr('y1', function(d){return d.source.y})
		.attr('y2', function(d){return d.target.y})

	console.groupEnd();

}

function renderTree(rootNode, rootDOM, radial){ ////(data, the drawing elements, radial)

	const W = rootDOM.clientWidth;
	const H = rootDOM.clientHeight;
	const w = W - margin.l - margin.r;
	const h = H - margin.t - margin.b;

	const plot = d3.select(rootDOM)
		.append('svg')
		.attr('width', W)
		.attr('height', H)
		.append('g')
		.attr('class','plot')
		.attr('transform', `translate(${margin.l}, ${margin.t})`);

	console.group('Tree');

	const treeTransform = d3.tree()
		.size([w, h]);

	const treeData = treeTransform(rootNode);
	const nodesData = treeData.descendants();
	const linksData = treeData.links();
	console.log(rootNode);
	console.log(nodesData);
	console.log(linksData);

	if(!radial){

		//Draw nodes
		const nodes = plot.selectAll('.node')
			.data(nodesData);
		const nodesEnter = nodes.enter()
			.append('g')
			.attr('class','node');
		nodesEnter.append('circle');
		nodesEnter.append('text');

		nodesEnter.merge(nodes)
			.attr('transform', function(d){
				return `translate(${d.x}, ${d.y})`
			})
			.select('circle')
			.attr('r', 4)
			.style('fill', function(d){
				return depthScale(d.depth);
			});

		nodesEnter.merge(nodes)
			.filter(function(d){ return d.depth < 2})
			.select('text')
			.text(function(d){ return `${d.data.name}: ${d.value}`})
			.attr('dx', 6);

		//Draw links
		const links = plot.selectAll('.link')
			.data(linksData);
		const linksEnter = links.enter()
			.insert('line', '.node')
			.attr('class', 'link');
		linksEnter.merge(links)
			.attr('x1', function(d){ return d.source.x })
			.attr('x2', function(d){ return d.target.x })
			.attr('y1', function(d){ return d.source.y })
			.attr('y2', function(d){ return d.target.y });

	}else{
		//If "radial" parameter is true, render this as a radial tree

		function polarToCartesian(angle, r){
			return [r * Math.cos(angle), r * Math.sin(angle)]
		}

		//Translate center of coordinate system
		plot
			.attr('transform', `translate(${W/2}, ${H/2})`);

		//Draw nodes
		const nodes = plot.selectAll('.node')
			.data(nodesData);
		const nodesEnter = nodes.enter()
			.append('g')
			.attr('class','node');
		nodesEnter.append('circle');
		nodesEnter.append('text');

		nodesEnter.merge(nodes)
			.attr('transform', function(d){
				const cartesian = polarToCartesian(d.x/w*Math.PI*2, d.y/2);
				return `translate(${cartesian[0]}, ${cartesian[1]})`
			})
			.select('circle')
			.attr('r', 4)
			.style('fill', function(d){
				return depthScale(d.depth);
			});

		nodesEnter.merge(nodes)
			.filter(function(d){ return d.depth < 2})
			.select('text')
			.text(function(d){ return `${d.data.name}: ${d.value}`})
			.attr('dx', 6);

		//Draw links
		const links = plot.selectAll('.link')
			.data(linksData);
		const linksEnter = links.enter()
			.insert('line', '.node')
			.attr('class', 'link');
		linksEnter.merge(links)
			.each(function(d){
				const source = polarToCartesian(d.source.x/w*Math.PI*2, d.source.y/2);
				const target = polarToCartesian(d.target.x/w*Math.PI*2, d.target.y/2);

				d3.select(this)
					.attr('x1', function(d){ return source[0] })
					.attr('x2', function(d){ return target[0] })
					.attr('y1', function(d){ return source[1] })
					.attr('y2', function(d){ return target[1] });
			})
	}


	console.groupEnd();

}

function renderPartition(rootNode, rootDOM){

	const W = rootDOM.clientWidth;
	const H = rootDOM.clientHeight;
	const w = W - margin.l - margin.r;
	const h = H - margin.t - margin.b;

	const plot = d3.select(rootDOM)
		.append('svg')
		.attr('width', W)
		.attr('height', H)
		.append('g')
		.attr('class','plot')
		.attr('transform', `translate(${margin.l}, ${margin.t})`);


		const partitionTransform = d3.partition().size([w, h]); ////gives partition attr x and y values
		const dataTransformed = partitionTransform(rootNode);

		const nodesData = dataTransformed.descendants(); ////turns data into that flat array
		const linksData = dataTransformed.links();

		const nodes = plot.selectAll('.node')
			.data(nodesData);
		const nodesEnter = nodes.enter()
			.append('g')
			.attr('class', 'node')
			.on('mouseenter', function(d){
				console.log(d.data.name, d.value);
				d3.select(this)////refers to the g element, not the rectangle
				.select('rect')
				.transition()
				.style('fill-opacity', 1)
			})

			.on('mouseleave', function(d){
				console.log(d.data.name, d.value);
				d3.select(this)////refers to the g element, not the rectangle
				.select('rect')
				.transition()
				.style('fill-opacity', .5)
			})

		nodesEnter.append('rect');
		nodesEnter.append('text');


		nodesEnter.merge(nodes)
			.attr('transform', function(d){
				return `translate(${d.x0}, ${d.y0})`;
			})
		nodesEnter.merge(nodes)
			.select('rect')
			.attr('width', function(d){ return d.x1 - d.x0})
			.attr('height', function(d){return d.y1 - d.y0})
			.style('fill', function(d){
				return depthScale(d.depth);
			})

		nodesEnter.merge(nodes)
			.filter(function(d){
				return d.depth<2
			})
			.select('text')
			.text(function(d){
				return `${d.data.name}: ${d.value}`
			})
		.attr('text-anchor', 'middle')

		console.log(dataTransformed);




}

function renderTreemap(rootNode, rootDOM){


}

