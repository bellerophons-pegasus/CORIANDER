
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
var offset = 0;//Math.PI * (emptyStroke/(respondents + emptyStroke)) / 2;

var totDictJson = JSON.parse(totDict);
// initial dataset
var dataset = dataMat



// slider variables
var topxslider = document.getElementById("topxRange");
// var topx = topxslider.value;
var topxoutput = document.getElementById("slidertopx");
topxoutput.innerHTML = topxslider.value;
var topxval = topxslider.value;


// topx matrix
function matOcu(mat,i,topval) {
				return mat[i].sort(function(a ,b) {
				if (a == b) return 0;
				if (a > b) return -1;
				return 1;
		})[topval-1];
};

function lineOcu(line,topval) {
				return line.sort(function(a ,b) {
				if (a == b) return 0;
				if (a > b) return -1;
				return 1;
		})[topval-1];
};

function initialMatrix(matdat,topval) {
	var matrixtop = [];
	for (var i=0; i<totList.length;i++) {
		console.log(i);
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

matrixtopx = initialMatrix(dataMat,topxval)

//create number formatting functions
var formatPercent = d3.format("%");
var numberWithCommas = d3.format("0,f");

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
var nameList = totList; //store neighbourhood data outside data-reading function = labels
var colorlist = totColors;

/*
* Step III : Initialise the visualisation
*/
var g = d3.select("#graph").append("svg")
				.attr("width", (width + margin.left + margin.right))
				.attr("height", (height + margin.top + margin.bottom))
			.append("g")
					.attr("id", "circle")
					.attr("transform",
								"translate(" + width / 2 + "," + height / 2 + ")");
	//the entire graphic will be drawn within this <g> element,
	//so all coordinates will be relative to the center of the circle

	g.append("circle")
			.attr("r", outerRadius);
	//this circle is set in CSS to be transparent but to respond to mouse events
	//It will ensure that the <g> responds to all mouse events within
	//the area, even after chords are faded out.


updateChords(matrixtopx, nameList, totColors);

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
	for(i = 0; i < keywordlist.length; i++){
		var key= keywordlist[i];
		var newmatrixline = [];

		//new variable for topx values:
		var topxline = []
		for(j=0; j < totList.length; j++){
			topxline.push(totDictJson[key].coocurrences[totList[j]]);
		};
		//now sort this line and use the reference value
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

//slider oninput

topxslider.oninput = function() {
	topxval = topxslider.value;
	topxoutput.innerHTML = topxslider.value;
	matrixtopx = initialMatrix(dataMat,topxval);
	var checkboxes = document.querySelectorAll('input[name="keyword"]:checked');
	var values = [];
	checkboxes.forEach((checkbox) => {
			values.push(checkbox.value);
	});
	var newdata = getMatrix(values); // a list with three lists
	updateChords(newdata[0], newdata[1], newdata[2]);
};




/* Create OR update a chord layout from a data matrix */
function updateChords( matrix, labelsNew, colorlist ) {
		console.log(matrix);
		console.log(labelsNew);
		console.log(colorlist);
    layout = getDefaultLayout(); //create a new layout object
    layout.matrix(matrix);

		/* Create/update "group" elements */
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

    var newGroups = groupG.enter().append("g")
        .attr("class", "group");
    //the enter selection is stored in a variable so we can
    //enter the <path>, <text>, and <title> elements as well


    //Create the title tooltip for the new groups
    newGroups.append("title");


		    //Update the (tooltip) title text based on the data
		    groupG.select("title")
		        .text(function(d, i) {
		            return numberWithCommas(d.value)
		                + " trips started in "
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
		            return colorlist[d.index];
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
								return colorlist[d.index];
						});
		        ;

		    //create the group labels
		    newGroups.append("svg:text")
		        .attr("xlink:href", function (d) {
		            return "#group" + d.index;
		        })
		        .attr("dy", ".35em")
		        // .attr("color", "#000")
		        .text(function (d) {
								console.log(labelsNew[d.index]);
		            return labelsNew[d.index];
		        });

				groupG.select("text")
						.attr("xlink:href", function (d) {
								return "#group" + d.index;
						})
						.attr("dy", ".35em")
						// .attr("color", "#000")
						.text(function (d) {
								console.log(labelsNew[d.index]);
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


		    /* Create/update the chord paths */
		    var chordPaths = g.selectAll("path.chord")
		        .data(layout.chords(), chordKey );
		            //specify a key function to match chords
		            //between updates


		    //create the new chord paths
		    var newChords = chordPaths.enter()
		        .append("path")
		        .attr("class", "chord");

		    // Add title tooltip for each new chord.
		    newChords.append("title");

		    // Update all chord title texts
		    chordPaths.select("title")
		        .text(function(d) {
		            if (labelsNew[d.target.index] !== labelsNew[d.source.index]) {
		                return [numberWithCommas(d.source.value),
		                        " trips from ",
		                        labelsNew[d.source.index],
		                        " to ",
		                        labelsNew[d.target.index],
		                        "\n",
		                        numberWithCommas(d.target.value),
		                        " trips from ",
		                        labelsNew[d.target.index],
		                        " to ",
		                        labelsNew[d.source.index]
		                        ].join("");
		                    //joining an array of many strings is faster than
		                    //repeated calls to the '+' operator,
		                    //and makes for neater code!
		            }
		            else { //source and target are the same
		                return numberWithCommas(d.source.value)
		                    + " trips started and ended in "
		                    + labelsNew[d.source.index];
		            }
		        });

		    //handle exiting paths:
		    chordPaths.exit().transition()
		        .duration(1500)
		        .attr("opacity", 0)
		        .remove();

		    //update the path shape
		    chordPaths.transition()
		        .duration(1500)
		        .attr("opacity", 0.5) //optional, just to observe the transition
		        .style("fill", function (d) {
		            return colorlist[d.source.index];
		        })
		        .attrTween("d", chordTween(last_layout))
		        .transition().duration(100).attr("opacity", 1) //reset opacity
		    ;

		    //add the mouseover/fade out behaviour to the groups
		    //this is reset on every update, so it will use the latest
		    //chordPaths selection
		    groupG.on("mouseover", function(d) {
		        chordPaths.classed("fade", function (p) {
		            //returns true if *neither* the source or target of the chord
		            //matches the group that has been moused-over
		            return ((p.source.index != d.index) && (p.target.index != d.index));
		        });
		    });
		    //the "unfade" is handled with CSS :hover class on g#circle
		    //you could also do it using a mouseout event:
		    /*
		    g.on("mouseout", function() {
		        if (this == g.node() )
		            //only respond to mouseout of the entire circle
		            //not mouseout events for sub-components
		            chordPaths.classed("fade", false);
		    });
		    */

		    last_layout = layout; //save for next update

		//  }); //end of d3.json
		}

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




		function chordKey(data) {
		    return (data.source.index < data.target.index) ?
		        data.source.index  + "-" + data.target.index:
		        data.target.index  + "-" + data.source.index;

		    //create a key that will represent the relationship
		    //between these two groups *regardless*
		    //of which group is called 'source' and which 'target'
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
