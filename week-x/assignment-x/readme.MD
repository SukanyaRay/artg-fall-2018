# Week 10: Using hierarchical layouts to explore NYC construction permits

In this assignment, we will use hierarchical layouts to explore the NYC construction permits. Specifically, we will ask the following questions:
- How does construction *value* break down among the boroughs, and among different project types (new construction vs. renovation)?
- How does the total number of construction projects break down among boroughs and project types?

## How do we create data hierarchy?

Because the NYC construction permits dataset is not hierarchical out of the box, we need to manually create a `d3-hierarchy` object from it. As a hint, `d3-nest` creates nested hierarchies from a flat data array.

## Project $ value vs project type

We want to visualize two different quantities: the $ value of projects vs project count. How do we accomplish this? As a hint, read this piece of API documentation [here](https://github.com/d3/d3-hierarchy#node_sum).

*Bonus*: can you implement a mechanism to toggle between these two states?

## Reflection: which visualization type is more effective?

Is the partition layout more effective, or the treemap? Can you think of any other effective representation of this data?