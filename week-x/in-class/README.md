# Line / Area Charts

Line and area charts, as shown below, are a versatile visualization type, extremely useful for showing "serial" data. 

Compared to the scatterplot charts we are familiar with, the line/area charts are different in the following ways:
- **DOM**: the line / area is represented by a single `<path>` element, and the shape of the `<path>` element is represented by its `d` attribute. *Note that this `d` attribute has nothing to do with data--it's simply the shape attribute and is usually a long string.* You can examine the example chart in the inspector to get a sense of this.
- **Data**: the data structure required for a line / area chart is an array, containing a series of x-y coordinates
- **DOM-Data binding**: the single `<path>` element is bound to the entire array, *one to one*. Contrast this with scatterplots, where `x` DOM elements are bound to `x` individual elements of the array, in a *many-to-many* binding.

To ease into this exercise, undertake the following steps:
- Complete the recommended readings
- Look at the example chart in `script.js`, which uses dummy data
- Draw your own chart, based on the permits dataset

## Recommended reading

- [A simple line chart example](https://beta.observablehq.com/@mbostock/d3-line-chart)
- [SVG path element explained](https://css-tricks.com/svg-path-syntax-illustrated-guide/): you can try to generate `<path>` by hand as a bonus, though we will programmatically generate it in class

## Look at the example chart

This example spans 100 lines but is actually quite simple. It follows a simple pipeline: data generation, discovery and mining, and DOM manipulation

### Generating random data
The function `generateDummyData` on line 12 returns a dummy data array. Feel free to log it to console. You can see that it contains elements of the form:
```
{
	index: ...,
	value: ...
}
```
We will plot `index` on the x axis and `value` on the y axis.

### Calling `drawChart1`
All the code for drawing chart 1 is in this function. We call this function on line 25, passing in the dummy data we previously generated.

### Line and area generators (line 42-57)
These generators are *functions*, which takes in a data array, and returns the `d` attribute to describe the shapes of `<path>` elements. They don't work great out of the box, and we need to configure them in the following ways:
- `.x()` and `.y()` allow us to specify how to access and extract x-y coordinates from the input data array. 
- For `area` generators, we have `.y0()` and `.y1()` instead. This makes sense: a self-enclosed `<path>` needs both a top and a bottom border.
- `.curve()` controls how shapes are actually generated from control points. Try these out.

### Binding DOM to data (line 68-71, 81-84)
We use `selection.datum()` instead of `selection.data()` to produce a **ONE-TO-ONE** binding between **ONE** `<path>` element and the **ENTIRE** array (instead of the array's individual elements). This makes conceptual sense: the `<path>` element needs the entire array to fully describe its shape.

Also, what is `selection.insert()` on line 82?

## Drawing your own chart with the permits data set

On chart 2, you are asked to replicate the example, this time with the permits dataset.

### The data
I've already transformed the data into "serial" format. This data, logged on line 121, contains information on the number of permits filed each week. 

**Your job is to produce a line / area chart showing the number of permit applications per week.**