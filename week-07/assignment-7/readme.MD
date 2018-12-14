# Week 7: DOM-Data binding and the Enter/Exit/Update pattern

We introduced two key ideas in week 7:
- **DOM-Data binding**: d3.js derives its power from DOM-data binding, the idea that data can be "joined to" (and represented) by a corresponding DOM element. 
- **Enter/Exit/Update pattern**: using the enter/exit/update pattern, we can ensure one-to-one correspondence between data and DOM elements, while maintaining object constancy.
With the NYC permits dataset you will put these ideas into practice.

**Look at examples, but focus on understanding**: because these are relatively new concepts, you can (and are encouraged) to look at examples, both from in-class exercises and other examples online. *However, you must try to understand what these examples are doing, rather than blindly copying them*. 

## Basic idea

We will revisit the two scatterplots we've built so far, and build an interactive visualization that can transition between these two views. As a reminder, these two views are:

- Cost vs. sqft: x axis represents the square footage of the project, and the y axis represents its cost estimate.
- Per sqft cost vs. borough: x axis represents an **ordinal** scale of all the boroughs, and the y axis represents the cost per sqft of projects in that borough.

## The groundwork (this part is already completed)

Recall that before we can represent this data, we must import, parse, mine, and if necessary, transform this data. This is already been accomplished. 

## Part 1: completing the individual charts

In part 1, you must complete the `perSqftChart` and `costVsSqftChart` functions, so that calling each function (on line 58 and 61) will produce the correct chart output.

You must join the data to the DOM elements, using `selection.data`.

## Part 2: transitioning between the two charts

How do you modify the work you did in the part 1 so that we can transition between these two charts?

*Hint*: make sure you separate the "enter" selection from the "update" selection and address them differently.

Finally, try out the transition by completing the toggle functionalities (lines 64-74).
