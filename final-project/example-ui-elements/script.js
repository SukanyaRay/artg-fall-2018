//How to use the select element
d3.select('#select-menu')
	.on('change', function(){
		console.log(d3.event.target.value);
	})