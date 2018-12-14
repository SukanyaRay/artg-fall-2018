//This example demonstrates how you might import data from different sources

const dataPromise = d3.csv('../data/data.csv', parseData)
.then(function(rows){ 
	return rows.reduce(function(acc,val){return acc.concat(val)}, []); 
});
const metadataPromise = d3.csv('../data/countries-metadata.csv', parseMetadata);
const geojsonPromise = d3.json('../data/countries.geojson');

Promise.all([dataPromise, metadataPromise, geojsonPromise])
	.then(function([data, metadata, geojson]){

		//Here, all the different datasets have been imported via Promise
		//Data -> 263 countries and entities x 21 indicators x 50 years
		console.log(data);

		//Metadata -> 263 countries and entities
		console.log(metadata);

		//Geojson -> collection of 255 geographic features
		console.log(geojson);

		//Below are some examples of data transformation you may apply
		//1.1 Converting metadata into a "map" or dictionary
		const metadataMap = d3.map(metadata, function(d){return d.Code});
		//With this "map", you can easily look up information for any country using the 3-letter code
		console.group('Example 1.1: creating a map for lookup');
		console.log(metadataMap.get('USA'));
		console.groupEnd();

		//1.2 Nesting data: what if I want to see how total population has changed for each country across 50 years?
		console.group('Example 1.2: nesting and filtering data');
		// 263 countries and entities x 1 indicator x 50 years = 13150 records
		const populationIndicator = data.filter(function(d){return d.series === 'Population, total'});
		// Nest 13150 records by countries
		const populationByCountry = d3.nest()
			.key(function(d){ return d.country })
			.entries(populationIndicator);
		console.log(populationByCountry);
		console.groupEnd();

		//1.3 Try this out for your self: what if I need to look up the "GDP per capita (constant 2010 US$)" measure for all countries for the year 2000 only?
		//Hint: use array.filter twice

	});

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