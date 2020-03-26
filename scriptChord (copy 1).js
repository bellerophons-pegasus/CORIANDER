// create the svg area
var svg = d3.select("#graph")
  .append("svg")
    .attr("width", 2000)
    .attr("height", 2000)
  .append("g")
    .attr("transform", "translate(800,600)")

// create a matrix
// var matrix = [
//   [0,  5871, 8916, 2868],
//   [ 1951, 0, 2060, 6171],
//   [ 8010, 16145, 0, 8045],
//   [ 1013,   990,  940, 0]
// ];


var textLabel = d3.scaleOrdinal().range(totList);

// give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
var res = d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending)
    (dataMat)

// add the groups on the outer part of the circle
svg
  .datum(res)
  .append("g")
  .selectAll("g")
  .data(function(d) { return d.groups; })
  .enter()
  .append("g")
  .append("path")
    .style("fill", function(d,i){ return colors[i] })
    .style("stroke", "black")
    .attr("d", d3.arc()
      .innerRadius(400)
      .outerRadius(410)
    )

// Add the links between groups
svg
  .datum(res)
  .append("g")
  .selectAll("path")
  .data(function(d) { return d; })
  .enter()
  .append("path")
    .attr("d", d3.ribbon()
      .radius(400)
    )
    .style("fill", function(d){ return(colors[d.source.index]) }); // colors depend on the source group. Change to target otherwise.
    //.style("stroke", "black");



svg
  .datum(res)
  .append("g")
  .selectAll("text")
  .data(function(d) { return d.groups; })
  .enter()
  .append("sgv:text")
      .attr("x", 6)
      .attr("dy", 15)
      .append("svg:textPath")
          .attr("xlink:href", function(d, i){return "#group-" + i;})
          .text(function(d,i) {return textLabel(i+1);});
