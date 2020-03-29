

var screenWidth = $(window).width();

var margin = {left: 50, top: 10, right: 50, bottom: 10},
	width = Math.min(screenWidth, 1400) - margin.left - margin.right,
	height = Math.min(screenWidth, 1400)*5/6 - margin.top - margin.bottom;

var svg = d3.select("#graph").append("svg")
			.attr("width", (width + margin.left + margin.right))
			.attr("height", (height + margin.top + margin.bottom));

var wrapper = svg.append("g").attr("class", "chordWrapper")
			.attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");;

var outerRadius = Math.min(width, height) / 2  - 100,
	innerRadius = outerRadius * 0.95,
	opacityDefault = 0.9; //default opacity of chords

////////////////////////////////////////////////////////////
////////////////////////// Data ////////////////////////////
////////////////////////////////////////////////////////////

var Names = totList;

var respondents = 95, //Total number of respondents (i.e. the number that makes up the group)
	emptyPerc = 0.4, //What % of the circle should become empty in comparison to the visible arcs
	emptyStroke = Math.round(respondents*emptyPerc); //How many "units" would define this empty percentage


var matrix = dataMat;

// Calculate the Matrix with 5 most common co-occurences

function matOcu(mat,i) {
				return mat[i].sort(function(a ,b) {
				if (a == b) return 0;
				if (a > b) return -1;
				return 1;
		})[4];
};

var matrix5 = [];
for (var i=0; i<totList.length;i++) {
	matrix5.push([]);
	var refval = matOcu(matrix,i);
	for (var j=0; j < totList.length;j++) {
		if (coocDict[totList[i]][totList[j]] < refval) {
			matrix5[i].push(0);
		} else {
			matrix5[i].push(coocDict[totList[i]][totList[j]]);
		};
	};
};






//Calculate how far the Chord Diagram needs to be rotated clockwise
//to make the dummy invisible chord center vertically
var offset = Math.PI * (emptyStroke/(respondents + emptyStroke)) / 2;

var chord = d3.layout.chord()
	.padding(.01)
	.sortSubgroups(d3.descending) //sort the chords inside an arc from high to low
	.sortChords(d3.descending) //which chord should be shown on top when chords cross. Now the biggest chord is at the bottom
	.matrix(matrix5);

var arc = d3.svg.arc()
	.innerRadius(innerRadius)
	.outerRadius(outerRadius)
	.startAngle(startAngle) //startAngle and endAngle now include the offset in degrees
	.endAngle(endAngle);

var path = d3.svg.chord()
	.radius(innerRadius)
	.startAngle(startAngle)
	.endAngle(endAngle);

var fill = d3.scale.ordinal()
    .domain(d3.range(Names.length))
    .range(totColors);

////////////////////////////////////////////////////////////
//////////////////// Draw outer Arcs ///////////////////////
////////////////////////////////////////////////////////////

var g = wrapper.selectAll("g.group")
	.data(chord.groups)
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

////////////////////////////////////////////////////////////
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
	.text(function(d,i) { return Names[i]; });

////////////////////////////////////////////////////////////
//////////////////// Draw inner chords /////////////////////
////////////////////////////////////////////////////////////

var chords = wrapper.selectAll("path.chord")
	.data(chord.chords)
	.enter().append("path")
	.attr("class", "chord")
	.style("stroke", "none")
	.style("fill", function(d,i) { return fill(d.target.index); })
	.style("opacity", opacityDefault)
	.attr("d", path);

////////////////////////////////////////////////////////////
///////////////////////// Tooltip //////////////////////////
////////////////////////////////////////////////////////////

//Arcs
g.append("title")
	.text(function(d, i) {return Math.round(d.value) + " connections with " + Names[i];});

//Chords
chords.append("title")
	.text(function(d) {
		return [Math.round(d.source.value), " connections from ", Names[d.target.index], " to ", Names[d.source.index]].join("");
	});

////////////////////////////////////////////////////////////
////////////////// Extra Functions /////////////////////////
////////////////////////////////////////////////////////////

//Include the offset in de start and end angle to rotate the Chord diagram clockwise
function startAngle(d) { return d.startAngle + offset; }
function endAngle(d) { return d.endAngle + offset; }

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
		console.log(this.text);
    //Decrease opacity to all
    svg.selectAll("path.chord")
      .transition()
      .style("opacity", 0.1);
    //Show hovered over chord with full opacity
    d3.select(this)
      .transition()
          .style("opacity", 1);

    //Define and show the tooltip over the mouse location
    $(this).popover({
      //placement: 'auto top',
      title: 'test',
      placement: 'right',
      container: 'body',
      animation: false,
      offset: "20px -100px",
      followMouse: true,
      trigger: 'click',
      html : true,
      content: function() {
        return "<p style='font-size: 11px; text-align: center;'><span style='font-weight:900'>"  +
             "</span> text <span style='font-weight:900'>"  +
             "</span> folgt hier <span style='font-weight:900'>" + "</span> movies </p>"; }
    });
    $(this).popover('show');
  }



  //Bring all chords back to default opacity
  function mouseoutChord(d) {
    //Hide the tooltip
    $('.popover').each(function() {
      $(this).remove();
    })
    //Set opacity back to default for all
    svg.selectAll("path.chord")
      .transition()
      .style("opacity", opacityDefault);
    }      //function mouseoutChord
