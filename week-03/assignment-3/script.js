console.log('Assignment 3');

/*
 * Question 1: no code necessary, 
 * but feel free to use this space as a Javascript sandbox to check your answers
 */

/*
 * Question 2: control structures 
 */
{
	//2.1 
	/* YOUR CODE HERE*/
	for(i=10; i>=0; i--){
		console.log(i);
	}

	//2.2
	/* YOUR CODE HERE*/
	for(i=0;i<=500;i+=100){
		console.log(i);
	}

	//2.3
	const arr = [89, 23, 88, 54, 90, 0, 10];
	//Log out the content of this array using a for loop
	/* YOUR CODE HERE*/
	for (var i = 0; i < arr.length; i++) {
		console.log(arr[i]);
	}
}

/*
 * Question 3: no code necessary
 */

/*
 * Question 4: objects and arrays
 */

{
	//4.1
	const instructors = [
		{name:'Ashley', tenure:10},
		{name:'Ben', tenure:2},
		{name:'Carol', tenure:3}
	];

	//4.2 
	/* COMPLETE THE FUNCTION */
	function computeAvgTenure(l){
		//l is an array of objects
		let totalTenure = 0;
		for(let i = 0; i < l.length; i++){
			totalTenure += l[i].tenure
		}
		return totalTenure/l.length;
	}

	computeAvgTenure(instructors);

	//4.3
	/* YOUR CODE HERE */

	instructors.push({
		name:'Dan',
		tenure: 5
	});

	computeAvgTenure(instructors)
}

