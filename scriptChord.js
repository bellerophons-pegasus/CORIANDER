
/*
* A script to display data from the DH course registry in a chord diagram.
* Based on keywords appearing together in each course the relations are shown.
* A custom selection of keywords is possible and the diagram will be redrawn.
*
* authors: Lukas and Martina
* used sources:
* For updating graph upon button press
* 	AmeliaBR: https://stackoverflow.com/questions/21813723/change-and-transition-dataset-in-chord-diagram-with-d3
* For color gradients:
* 	Tutorial by Nadieh Bremer: https://www.visualcinnamon.com/2016/06/orientation-gradient-d3-chord-diagram
*   and as a similar usage:
*		Julien Assouline: https://gist.github.com/JulienAssouline/2847e100ac7d4d3981b0f49111e185fe
*
*/

/*
* Step 0 : Via chord.html the source file containing data is loaded:
           * Sources/courseRegistryData/dataMat.js
					   --> var dataMat, var totColors, var totList, var totDict
						 dataMat is the complete co-occurence matrix
						 totColors is a list with a color for each keyword
						 which are stored in totList
						 in totDict the whole data is stored in json format
						 ...for further usage some variables coulb be combined...
*/

/*
* Step I : Create checkboxes for keyword selection based on entries in totList.
* 				 The checkboxes are added to its corresponding div in a form element.
*					 Also the variables for the slider and other buttons are found here.
*/
var catDiscDiv = document.getElementById("disciplines-keys-wrapper");
var catObjDiv = document.getElementById("objects-keys-wrapper");
var catTeqDiv = document.getElementById("techniques-keys-wrapper");

for (i = 0; i < totList.length; i++){
	// create checkboxe for each keyword
	var checkboxcontainer = document.createElement('label');
	checkboxcontainer.setAttribute("class", 'checkcontainer');
	var checkbox = document.createElement('input');
	checkbox.setAttribute("type", 'checkbox');
	checkbox.setAttribute("name", 'keyword');
	checkbox.setAttribute("value", totList[i]);
	var checkboxmark = document.createElement('span');
  checkboxmark.setAttribute("class", 	'checkmark');
	checkboxcontainer.appendChild(document.createTextNode(totList[i]));
	checkboxcontainer.appendChild(checkbox);
	checkboxcontainer.appendChild(checkboxmark);
	// keyword category depends on where in the list we are
	if(i < 19){
		catDiscDiv.appendChild(checkboxcontainer);
	} else if(i < 55){
		catObjDiv.appendChild(checkboxcontainer);
	}	else {
		catTeqDiv.appendChild(checkboxcontainer);
	};
};

// Function to select all keywords from a category
function toggleDisc(source, category){
	var selectArg = ''.concat('#',category,'-keys-wrapper input[type="checkbox"]')
  var checkboxes = document.querySelectorAll(selectArg);
  for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i] != source)
          checkboxes[i].checked = source.checked;
  }
};

// slider variables
var topxslider = document.getElementById("topxRange");
var topxoutput = document.getElementById("slidertopx");
topxoutput.innerHTML = topxslider.value;
var topxval = topxslider.value;

// checkbox for showing all connections
var allConnex = document.getElementById("allConnex");


/*
* Step II : Set initial parameters for chord diagram
*/
var screenWidth = $(window).width();
// variables to aligne the plot in the browser window
var margin = {left: 62, top: 20, right: -100, bottom: 10},
	width = Math.min(screenWidth/3*1.88, 1400) - margin.left - margin.right,
	height = Math.min(screenWidth/3*1.88, 1400)*1.1 - margin.top - margin.bottom;

var outerRadius = Math.min(width, height) / 2 - 170,
	innerRadius = outerRadius * 0.95,
	opacityDefault = 0.9; //default opacity of chords

// initial number of displayed keywords, needed to calculate the gab between each arc in the diagram
var respondents = totList.length,
		emptyPerc = 0.4, //What % of the circle should become empty in comparison to the visible arcs
		emptyStroke = Math.round(respondents*emptyPerc); //How many "units" would define this empty percentage

// Read the variables from the Course Registry Source files
var totDictJson = JSON.parse(totDict);
var dataset = dataMat;


// Topx matrix: These functions calculate the new matrix for the chord diagram
// 							dependent on the maximum number of connections (var topxval).
//							Since there can be connections with the same co-occurrence,
//							it is possible to have more than the giving number of connections

// Sorts a row of the co-occurrence matrix and returning the x most frequent value
function matOcu(mat,i,topval) {
				return mat[i].sort(function(a ,b) {
				if (a == b) return 0;
				if (a > b) return -1;
				return 1;
		}).slice(topval-1)[0];
};
// Sorts a row of a co-occurrence list and returning the x most frequent value
function lineOcu(line,topval) {
				if (topval > line.length) {
					topval = line.length;
				};
				return line.sort(function(a ,b) {
				if (a == b) return 0;
				if (a > b) return -1;
				return 1;
		}).slice(topval-1)[0];
};
// Building the new matrix for a giving max number of connections
function initialMatrix(matdat,topval) {
	var matrixtop = [];
	for (var i=0; i<totList.length;i++) {
		matrixtop.push([]);
		var refval = matOcu(matdat,i,topval);
		for (var j=0; j < totList.length;j++) {

			if (totDictJson[totList[i]].coocurrences[totList[j]] < refval) {
				matrixtop[i].push(0);
			} else {
				matrixtop[i].push(totDictJson[totList[i]].coocurrences[totList[j]]);
			};
		};
	};
	return matrixtop
};

// for the inital display a matrix is generated using the inital value of topxval=5
matrixtopx = initialMatrix(dataMat,topxval)

//create number formatting functions
var formatPercent = d3.format("%");
var numberWithCommas = d3.format("0,f");
function startAngle(d) { return d.startAngle; };
function endAngle(d) { return d.endAngle; };

//create the arc path data generator for the groups
var arc = d3.svg.arc()
	.innerRadius(innerRadius)
	.outerRadius(outerRadius)
	.startAngle(startAngle)
	.endAngle(endAngle);

//create the chord path data generator for the chords
var path = d3.svg.chord()
	.radius(innerRadius)
	.startAngle(startAngle)
	.endAngle(endAngle);

// Create the inital colors for the arcs
var fill = d3.scale.ordinal()
    .domain(d3.range(totList.length))
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
var nameList = totList; //store the total name list data
var colorlist = totColors; // same for the colors

/*
* Step III : Initialise the visualisation
*/
// The entire graphic will be drawn within this <g> element,
// so all coordinates will be relative to the center of the circle
var g = d3.select("#chordgraph").append("svg")
				.attr("width", (width + margin.left + margin.right))
				.attr("height", (height + margin.top + margin.bottom))
			.append("g")
					.attr("id", "circle")
					.attr("transform",
								"translate(" + width / 2 + "," + height / 2 + ")");


// This circle is set in CSS to be transparent but to respond to mouse events
// It will ensure that the <g> responds to all mouse events within
// the area, even after chords are faded out.
g.append("circle")
		.attr("r", outerRadius);


// For the inital diagram call the function that creates/updates the chords
updateChords(matrixtopx, nameList, totColors);



/*
* Step IV: Collect selected keywords and create custom data matrix
*/

// Create an identity matrix which is used in case there are no connections between the data
// In this case all entries in the matrix would be zero
function identityMatrix(n) {
	var a = Array.apply(null, new Array(n));
	return a.map(function(x, i) {
		return a.map(function(y, k) {
			return i === k ? 1 : 0;
		})
	})
};

// Create data matrix for selected keywords. Also collect keywords for labels
// and colors. Return these three lists in one list.
function getMatrix(keywordlist){
	var returnlist = [];
	var newmatrix = [];
	var newnames = [];
	var newcolors = [];
	for(i = 0; i < keywordlist.length; i++){
		var key= keywordlist[i];
		var newmatrixline = [];

		//new variable for topx values:
		var topxline = []
		for(j=0; j < keywordlist.length; j++){
			topxline.push(totDictJson[key].coocurrences[keywordlist[j]]);
		};
		//now sort this line and use the reference value as max number of connections
		var refvalshort = lineOcu(topxline,topxval);
		newnames.push(keywordlist[i]);
		newcolors.push(totDictJson[key].color)
		for(j=0; j < keywordlist.length; j++){

			// check if the value is greater than the refernce
			if (totDictJson[key].coocurrences[keywordlist[j]] >= refvalshort) {
				newmatrixline.push(totDictJson[key].coocurrences[keywordlist[j]]);
			} else {
				newmatrixline.push(0);
			};

		};
		newmatrix.push(newmatrixline);
	};

	// check if there are any coocurrences:
	for(i = 0; i < newmatrix.length; i++){
		var maxcheckval = 0;
		for(j = 0; j < newmatrix[i].length; j++){
			if (newmatrix[i][j] > maxcheckval){
				maxcheckval = newmatrix[i][j]
			};
		};
	};
	// now...if all entries = 0...create an alternate matrix with 1 in die diagonal

	var nomatchoutput = document.getElementById("nomatchoc");
	nomatchoutput.innerHTML = 'No Matches for the current Selection';
	if (maxcheckval == 0) {
			newmatrix = identityMatrix(keywordlist.length);
			nomatchoutput.innerHTML = 'No Matches for the current Selection';
	} else {
		nomatchoutput.innerHTML = '';
	};
	// Build the list which is returned by the function
	returnlist.push(newmatrix);
	returnlist.push(newnames);
	returnlist.push(newcolors);
	if (keywordlist.length <= 1) {
		returnlist = []
		returnlist.push(matrixtopx);
		returnlist.push(nameList);
		returnlist.push(totColors);
	};
	return returnlist;
};

// Button to accept selection and draw chord diagram with selected keywords
d3.select("#draw-diagram").on("click", function () {
	var checkboxes = document.querySelectorAll('input[name="keyword"]:checked');
	var values = [];
  checkboxes.forEach((checkbox) => {
      values.push(checkbox.value);
  });
	var newdata = getMatrix(values); // a list with three lists
	updateChords(newdata[0], newdata[1], newdata[2]);
});

// Slider oninput: also redraws the diagram by calling the function updateChords
topxslider.oninput = function() {
	// Changes the selection for all data to false
	allConnex.checked = false;
	if (allConnex.checked == false){
		// Updates the topxvalue
		topxval = topxslider.value;
		topxoutput.innerHTML = topxslider.value;
		// Generates a new matrix based on the topxvalue
		matrixtopx = initialMatrix(dataMat,topxval);
		// Includes the checkbox selection
		var checkboxes = document.querySelectorAll('input[name="keyword"]:checked');
		var values = [];
		checkboxes.forEach((checkbox) => {
				values.push(checkbox.value);
		});
		// Calculates the new data for the diagram
		var newdata = getMatrix(values);
		// Updates the chords
		updateChords(newdata[0], newdata[1], newdata[2]);
	};
};

// Function for the checkbox event to display all available connections
function allConnexFunc(){
	if (allConnex.checked == true){
		// By setting the topxval=0 the "0-1" object from the list is taken
		// this is the last one so all connections are shown.
		topxval =0;
		// Building the new matrix
		matrixtopx = initialMatrix(dataMat,topxval);
		// Includes the checkbox selection
		var checkboxes = document.querySelectorAll('input[name="keyword"]:checked');
		var values = [];
		checkboxes.forEach((checkbox) => {
				values.push(checkbox.value);
		});
		// Calculates the new data for the diagram
		var newdata = getMatrix(values);
		// Updates the chords
		updateChords(newdata[0], newdata[1], newdata[2]);
		// If not selected do the same as for a change of the slider value above
  } else {
		topxval = topxslider.value;
		topxoutput.innerHTML = topxslider.value;
		matrixtopx = initialMatrix(dataMat,topxval);
		var checkboxes = document.querySelectorAll('input[name="keyword"]:checked');
		var values = [];
		checkboxes.forEach((checkbox) => {
				values.push(checkbox.value);
		});
		var newdata = getMatrix(values);
		updateChords(newdata[0], newdata[1], newdata[2]);
  }
}


// Create OR update a chord layout from a data matrix - main function
function updateChords( matrix, labelsNew, colorlist ) {
    layout = getDefaultLayout(); //create a new layout object
    layout.matrix(matrix); 	// add the data

		// setting the colors
		var colors = d3.scale.ordinal()
	    .domain(d3.range(labelsNew.length))
			.range(colorlist);

		//Function to create the unique id for each chord gradient - used for the color gradient
		function getGradID(d){ return "linkGrad#" + d.source.index + "#" + d.target.index; }

		//Create the gradients definitions for each chord
		var grads = g.html("").append("defs").selectAll("linearGradient")
			.data(layout.chords(), chordKey)
		  .enter().append("linearGradient")
		    //Create the unique ID for this specific source-target pairing
			.attr("id", getGradID)
			.attr("gradientUnits", "userSpaceOnUse")
			//Find the location where the source chord starts
			.attr("x1", function(d,i) { return innerRadius * Math.cos((d.source.endAngle-d.source.startAngle)/2 + d.source.startAngle - Math.PI/2); })
			.attr("y1", function(d,i) { return innerRadius * Math.sin((d.source.endAngle-d.source.startAngle)/2 + d.source.startAngle - Math.PI/2); })
			//Find the location where the target chord starts
			.attr("x2", function(d,i) { return innerRadius * Math.cos((d.target.endAngle-d.target.startAngle)/2 + d.target.startAngle - Math.PI/2); })
			.attr("y2", function(d,i) { return innerRadius * Math.sin((d.target.endAngle-d.target.startAngle)/2 + d.target.startAngle - Math.PI/2); })

		//Set the starting color (at 0%)
		grads.append("stop")
			.attr("offset", "0%")
			.attr("stop-color", function(d){ return colors(d.source.index); });

		//Set the ending color (at 100%)
		grads.append("stop")
			.attr("offset", "100%")
			.attr("stop-color", function(d){ return colors(d.target.index); });




		// Create/update "group" elements
    var groupG = g.selectAll("g.group")
        .data(layout.groups(), function (d) {
            return d.index;
            //use a key function in case the
            //groups are sorted differently between updates
        });

    groupG.exit()
        .transition()
            .duration(1500)
            .attr("opacity", 0)
            .remove(); //remove after transitions are complete

		// The enter selection is stored in a variable so we can
    // enter the <path>, <text>, and <title> elements as well
    var newGroups = groupG.enter().append("g")
        .attr("class", "group");

    //Create the title tooltip for the new groups
    newGroups.append("title");

		    //Update the (tooltip) title text based on the data
		    groupG.select("title")
		        .text(function(d, i) {
		            return numberWithCommas(d.value)
		                + " connections from "
		                + labelsNew[i];
		        });

		    //create the arc paths and set the constant attributes
		    //(those based on the group index, not on the value)
		    newGroups.append("path")
		        .attr("id", function (d) {
		            return "group" + d.index;
		            //using d.index and not i to maintain consistency
		            //even if groups are sorted
		        })
		        .style("fill", function (d) {
		            return colors(d.index);
		        });

		    //update the paths to match the layout
		    groupG.select("path")
		        .transition()
		            .duration(1500)
		            .attr("opacity", 0.5) //optional, just to observe the transition
		        .attrTween("d", arcTween( last_layout ))
		            .transition().duration(100).attr("opacity", 1) //reset opacity
						.attr("id", function (d) {
								return "group" + d.index;
								//using d.index and not i to maintain consistency
								//even if groups are sorted
						})
						.style("fill", function (d) {
								return colors(d.index);
						})
		        ;

		    //create the group labels
		    newGroups.append("svg:text")
		        .attr("xlink:href", function (d) {
		            return "#group" + d.index;
		        })
		        .attr("dy", ".35em")
		        .text(function (d) {
		            return labelsNew[d.index];
		        });

				groupG.select("text")
						.attr("xlink:href", function (d) {
								return "#group" + d.index;
						})
						.attr("dy", ".35em")
						.text(function (d) {
								return labelsNew[d.index];
						});

		    //position group labels to match layout
		    groupG.select("text")
		        .transition()
		            .duration(1500)
		            .attr("transform", function(d) {
		                d.angle = (d.startAngle + d.endAngle) / 2;
		                //store the midpoint angle in the data object
		                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
		                    " translate(" + (innerRadius + 26) + ")" +
		                    (d.angle > Math.PI ? " rotate(180)" : " rotate(0)");
		                //include the rotate zero so that transforms can be interpolated
		            })
		            .attr("text-anchor", function (d) {
		                return d.angle > Math.PI ? "end" : "begin";
		            });

		    // Create/update the chord paths
		    var chordPaths = g.selectAll("path.chord")
		        .data(layout.chords(), chordKey ) //specify a key function to match chords between updates
						.style("fill", function(d){ ;return "url(#" + getGradID(d) + ")"; }) // filling with grad
						;

		    // Create the new chord paths
		    var newChords = chordPaths.enter()
		        .append("path")
		        .attr("class", "chord");

		    // Add title tooltip for each new chord.
		    newChords.append("title");

		    // Update all chord title texts
		    chordPaths.select("title")
		        .text(function(d) {
		                return [numberWithCommas(d.source.value),
		                        " coocurrences of ",
		                        labelsNew[d.source.index],
		                        " with ",
		                        labelsNew[d.target.index]
		                        ].join("");
		        });

		    // Handle exiting paths:
		    chordPaths.exit().transition()
		        .duration(1500)
		        .attr("opacity", 0)
		        .remove();

		    // Update the path shape
		    chordPaths.transition()
		        .duration(1500)
		        .attr("opacity", 0.5) //optional, just to observe the transition
		        // .style("fill", function (d) {
		        //     return colorlist[d.source.index];
		        // })
						// this first style attribute is still kept...
						.style("fill", function(d){ ;return "url(#" + getGradID(d) + ")"; }) // Filling with color gradient
		        .attrTween("d", chordTween(last_layout))
		        .transition().duration(100).attr("opacity", 1) //reset opacity
		    ;

		    // Add the mouseover/fade out behaviour to the groups
		    // this is reset on every update, so it will use the latest
		    // chordPaths selection
		    groupG.on("mouseover", function(d) {
		        chordPaths.classed("fade", function (p) {
		            //returns true if *neither* the source or target of the chord
		            //matches the group that has been moused-over
		            return ((p.source.index != d.index) && (p.target.index != d.index));
		        });
		    });
		    // The "unfade" is handled with CSS :hover class on g#circle
		    // you could also do it using a mouseout event:
		    /*
		    g.on("mouseout", function() {
		        if (this == g.node() )
		            //only respond to mouseout of the entire circle
		            //not mouseout events for sub-components
		            chordPaths.classed("fade", false);
		    });
		    */

		    last_layout = layout; //save for next update


		} // End of main function


		function arcTween(oldLayout) {
		    //this function will be called once per update cycle

		    //Create a key:value version of the old layout's groups array
		    //so we can easily find the matching group
		    //even if the group index values don't match the array index
		    //(because of sorting)
		    var oldGroups = {};
		    if (oldLayout) {
		        oldLayout.groups().forEach( function(groupData) {
		            oldGroups[ groupData.index ] = groupData;
		        });
		    }

		    return function (d, i) {
		        var tween;
		        var old = oldGroups[d.index];
		        if (old) { //there's a matching old group
		            tween = d3.interpolate(old, d);
		        }
		        else {
		            //create a zero-width arc object
		            var emptyArc = {startAngle:d.startAngle,
		                            endAngle:d.startAngle};
		            tween = d3.interpolate(emptyArc, d);
		        }

		        return function (t) {
		            return arc( tween(t) );
		        };
		    };
		}




    // Create a key that will represent the relationship
    // between these two groups regardless
    // of which group is called 'source' and which 'target'
		function chordKey(data) {
		    return (data.source.index < data.target.index) ?
		        data.source.index  + "-" + data.target.index:
		        data.target.index  + "-" + data.source.index;
		}

		function chordTween(oldLayout) {
		    //this function will be called once per update cycle
		    //Create a key:value version of the old layout's chords array
		    //so we can easily find the matching chord
		    //(which may not have a matching index)

		    var oldChords = {};

		    if (oldLayout) {
		        oldLayout.chords().forEach( function(chordData) {
		            oldChords[ chordKey(chordData) ] = chordData;
		        });
		    }

		    return function (d, i) {
		        //this function will be called for each active chord

		        var tween;
		        var old = oldChords[ chordKey(d) ];
		        if (old) {
		            //old is not undefined, i.e.
		            //there is a matching old chord value

		            //check whether source and target have been switched:
		            if (d.source.index != old.source.index ){
		                //swap source and target to match the new data
		                old = {
		                    source: old.target,
		                    target: old.source
		                };
		            }

		            tween = d3.interpolate(old, d);
		        }
		        else {
		            //create a zero-width chord object
		            var emptyChord = {
		                source: { startAngle: d.source.startAngle,
		                         endAngle: d.source.startAngle},
		                target: { startAngle: d.target.startAngle,
		                         endAngle: d.target.startAngle}
		            };
		            tween = d3.interpolate( emptyChord, d );
		        }

		        return function (t) {
		            //this function calculates the intermediary shapes
		            return path(tween(t));
		        };
		    };
		}
