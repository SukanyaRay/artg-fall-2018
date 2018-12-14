# Week 6: Exploring the scatterplot

This week's assignment builds off of the work we did in class, and asks you to further explore the NYC constructin permit dataset by way of simple 2-D scatterplots.

A large part of the assignment repeats what we did in class. It is important for you to understand the *why* of what did as you refer back to the in-class material.

We will explore a different question in this assignment: how does construction cost per square foot differ across the 5 boroughs?

## Data import / parse

This step has been completed for you. The result of the import process is logged on line 6. 

Note that on line 23, we created a new attribute in the data set (cost_per_sqft). This is simply the estimated cost, normalized by the square footage. 

Our hypothesis is that construction project costs vary across the 5 boroughs of New York. We will be able to see if this is true or not.

## Data Transformation

The plan is that we will map the data as follows:
- On the y-axis: cost_per_sqft
- On the x-axis: the 5 boroughs

Note that the x-axis requires an *ordinal* scale. Give this some careful thought. How do we do this? What is the domain? What is the range?

## Represent

Use <circle> or some other appropriate visual symbol to plot each construction project. Please use the `...data().enter().append()` pattern we discussed in class.

## Reflection

Can you make sense of this result? What does the data suggest?

