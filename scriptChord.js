
/*
* A script to display data from the DH course registry in a chord diagram.
* Based on keywords appearing together in each course the relations are shown.
* A custom selection of keywords is possible and the diagram will be redrawn.
*
* authors: Lukas and Martina
* used sources:
* For xxx
* For updating graph upon button press
* 	Luz K: http://bl.ocks.org/databayou/c7ac49a23c275f0dd7548669595b8017
* 	AmeliaBR: https://stackoverflow.com/questions/21813723/change-and-transition-dataset-in-chord-diagram-with-d3
*
*/

/*
* Step 0 : Via chord.html the source file containing data is loaded:
           * Sources/courseRegistryData/dataMat.js
					   --> var dataMat, var totColors, var totList, var totDict
*/

/*
* Step I : Create checkboxes for keyword selection based on entries in totList.
* 				 The checkboxes are added to a form element.
*/
var form = document.getElementById("keyword-selector");

for (i = 0; i < totList.length; i++){
	var checkbox = document.createElement('input');
	checkbox.setAttribute("type", 'checkbox');
	checkbox.setAttribute("name", 'keyword');
	checkbox.setAttribute("value", totList[i]);
	form.appendChild(checkbox);
	form.appendChild(document.createTextNode(totList[i]));
}

/*
* Step II : Set initial parameters for chord diagram
*/
var screenWidth = $(window).width();

var margin = {left: 50, top: 10, right: 50, bottom: 10},
	width = Math.min(screenWidth, 1400) - margin.left - margin.right,
	height = Math.min(screenWidth, 1400)*5/6 - margin.top - margin.bottom;

var outerRadius = Math.min(width, height) / 2  - 100,
	innerRadius = outerRadius * 0.95,
	opacityDefault = 0.9; //default opacity of chords

// initial list with labels
var Names = totList

// initial number of displayed keywords
var respondents = totList.length,
		emptyPerc = 0.4, //What % of the circle should become empty in comparison to the visible arcs
		emptyStroke = Math.round(respondents*emptyPerc); //How many "units" would define this empty percentage

//Calculate how far the Chord Diagram needs to be rotated clockwise
//to make the dummy invisible chord center vertically
var offset = Math.PI * (emptyStroke/(respondents + emptyStroke)) / 2;

// initial dataset
var matrix = dataMat

//Include the offset in de start and end angle to rotate the Chord diagram clockwise
function startAngle(d) { return d.startAngle + offset; };
function endAngle(d) { return d.endAngle + offset; };

//create the arc path data generator for the groups
var arc = d3.svg.arc()
	.innerRadius(innerRadius)
	.outerRadius(outerRadius)
	.startAngle(startAngle) //startAngle and endAngle now include the offset in degrees
	.endAngle(endAngle);

//create the chord path data generator for the chords
var path = d3.svg.chord()
	.radius(innerRadius)
	.startAngle(startAngle)
	.endAngle(endAngle);

// initial color
var fill = d3.scale.ordinal()
    .domain(d3.range(Names.length))
    .range(totColors);


//define the default chord layout parameters
//within a function that returns a new layout object;
//that way, you can create multiple chord layouts
//that are the same except for the data.
function getDefaultLayout() {
    return d3.layout.chord()
		.padding(.01)
		.sortSubgroups(d3.descending) //sort the chords inside an arc from high to low
		.sortChords(d3.descending); //which chord should be shown on top when chords cross. Now the biggest chord is at the bottom
}
var last_layout; //store layout between updates
var regions; //store neighbourhood data outside data-reading function - TODO: verstehen

/*
* Step III : Initialise the visualisation
*/
var svg = d3.select("#graph").append("svg")
			.attr("width", (width + margin.left + margin.right))
			.attr("height", (height + margin.top + margin.bottom));

var wrapper = svg.append("g").attr("class", "chordWrapper")
			.attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");;


/*
* Step IV: Collect selected keywords and create custom data matrix
*/
// Create data matrix for selected keywords. Also collect keywords for labels
// and colors. Return these three lists in one list.
function getMatrix(keywordlist){
	var returnlist = [];
	var newmatrix = [];
	var newnames = [];
	var newcolors = [];
	var totDictJson = JSON.parse(totDict);
	for(i = 0; i < keywordlist.length; i++){
		var key= keywordlist[i];
		var newmatrixline = [];
		newnames.push(keywordlist[i]);
		newcolors.push(totDictJson[key].color)
		for(j=0; j < keywordlist.length; j++){
			newmatrixline.push(totDictJson[key].coocurrences[keywordlist[j]]);
		};
		newmatrix.push(newmatrixline);
	};
	returnlist.push(newmatrix);
	returnlist.push(newnames);
	returnlist.push(newcolors);
	return returnlist;
};

// Button to accept selection and draw chord diagram with selected keywords
d3.select("#draw-diagram").on("click", function () {
	var checkboxes = document.querySelectorAll('input[name="keyword"]:checked');
	var values = [];
  checkboxes.forEach((checkbox) => {
      values.push(checkbox.value);
  });
  console.log(getMatrix(values));
	var newdata = getMatrix(values); // a list with three lists

  updateChords(newdata[0], newdata[1], newdata[2]);
});



////////////////////////////////////////////////////////////
////////////////////////// Data ////////////////////////////
////////////////////////////////////////////////////////////

function updateChords(datamatrix, labellist, colorlist) {
	// compute layout from defaults and also set individual
	layout = getDefaultLayout(); //create a new layout object
	layout.matrix(datamatrix);

	var fill = d3.scale.ordinal()
			.domain(d3.range(labellist.length))
			.range(colorlist);

	// initial number of displayed keywords
	var respondents = labellist.length,
			emptyPerc = 0.4, //What % of the circle should become empty in comparison to the visible arcs
			emptyStroke = Math.round(respondents*emptyPerc); //How many "units" would define this empty percentage

	//Calculate how far the Chord Diagram needs to be rotated clockwise
	//to make the dummy invisible chord center vertically
	var offset = Math.PI * (emptyStroke/(respondents + emptyStroke)) / 2;

	//create the arc path data generator for the groups
	var arc = d3.svg.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius)
		.startAngle(startAngle) //startAngle and endAngle now include the offset in degrees
		.endAngle(endAngle);

	//create the chord path data generator for the chords
	var path = d3.svg.chord()
		.radius(innerRadius)
		.startAngle(startAngle)
		.endAngle(endAngle);

	//////////////////// Draw outer Arcs ///////////////////////
	var g = wrapper.selectAll("g.group")
		.data(layout.groups())
		.enter().append("g")
		.attr("class", "group")
	  .on("mouseover", fade(.0))
	  .on("mouseout", fade(opacityDefault))
	  .on("click", mouseoverChord)
	  .on("mouseout", mouseoutChord);;;

	g.append("path")
		.style("stroke", function(d) { return fill(d.index); })
		.style("fill", function(d) { return fill(d.index); })
		.attr("d", arc);

		////////////////////// Append Names ////////////////////////
		////////////////////////////////////////////////////////////

		//The text needs to be rotated with the offset in the clockwise direction
		g.append("text")
			.each(function(d) { d.angle = ((d.startAngle + d.endAngle) / 2) + offset;}) //Slightly altered function to define the angle
			.attr("dy", ".35em")
			.attr("class", "titles")
			.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
			.attr("transform", function(d,i) {
				var c = arc.centroid(d);
				return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
				+ "translate(" + (innerRadius + 55) + ")"
				+ (d.angle > Math.PI ? "rotate(180)" : "")
			})
			.text(function(d,i) { return labellist[i]; });

		//////////////////// Draw inner chords /////////////////////
		////////////////////////////////////////////////////////////

		var chords = wrapper.selectAll("path.chord")
			.data(layout.chords)
			.enter().append("path")
			.attr("class", "chord")
			.style("stroke", "none")
			.style("fill", function(d,i) { return fill(d.target.index); })
			.style("opacity", opacityDefault)
			.attr("d", path);

		///////////////////////// Tooltip //////////////////////////
		////////////////////////////////////////////////////////////

		//Arcs
		g.append("title")
			.text(function(d, i) {return Math.round(d.value) + " connections with " + labellist[i];});

		//Chords
		chords.append("title")
			.text(function(d) {
				return [Math.round(d.source.value), " connections from ", labellist[d.target.index], " to ", labellist[d.source.index]].join("");
			});



};


////////////////// Extra Functions /////////////////////////
function fade(opacity) {
   return function(d,i) {
     svg.selectAll("path.chord")
         .filter(function(d) { return d.source.index != i && d.target.index != i; })
     .transition()
         .style("opacity", opacity);
   };
 }//fade


 //Highlight hovered over chord
  function mouseoverChord(d,i) {
    //Decrease opacity to all
    svg.selectAll("path.chord")
      .transition()
      .style("opacity", 0.1);
		// Trying to only make connected group opaque
		// svg.selectAll("g.group")
    //   .transition()
    //   .style("opacity", 0.1);
    //Show hovered over chord with full opacity
    d3.select(this)
      .transition()
          .style("opacity", 1);
  }
  //Bring all chords back to default opacity
  function mouseoutChord(d) {
    //Set opacity back to default for all
    svg.selectAll("path.chord")
      .transition()
      .style("opacity", opacityDefault);
    }      //function mouseoutChord
