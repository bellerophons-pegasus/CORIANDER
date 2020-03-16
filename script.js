



// Slider functions






var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
var tdPlot = document.getElementById('graph');

var selYear = slider.value;
if ( slider.value > 1999) {
  var selYearp1 = parseInt(slider.value)+1;
} else {
  var selYearp1 = 2100;
}



var selCats = [];


var innerContainer = document.querySelector('[data-num="0"');
// plotEl = innerContainer.querySelector('.plot');
tdSelector = innerContainer.querySelector('.tddata');

var tdOption = document.createElement('option');
tdOption.text = 'Disciplines';
tdSelector.appendChild(tdOption);
var tdOption = document.createElement('option');
tdOption.text = 'Objects';
tdSelector.appendChild(tdOption);
var tdOption = document.createElement('option');
tdOption.text = 'Techniques';
tdSelector.appendChild(tdOption);

var selValue = tdSelector.value;

// layout options for bar chart
var plotlayout = {
  title: ''.concat('Number of courses per ',selValue),
  xaxis: {
    tickangle: 45,
    range: [-1,36]
  },
  yaxis: {
     gridwidth: 1
    // range: [0,30]
  },
  bargap :0.05
};

// layout options for empty bar chart
var plotlayoutempty = {
  title: 'No courses for this year',
  xaxis: {
    range: [-1,36],
    ticks: '',
    showticklabels: false
  },
  yaxis: {
    range: [0,1]
  },
};

if ( slider.value > 1999) {
  output.innerHTML = slider.value; // Display the default slider value
} else {
  output.innerHTML = 'Complete Data';
}
// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  if ( slider.value > 1999) {
    output.innerHTML = this.value; // Display the default slider value
    selYearp1 = parseInt(this.value)+1;
  } else {
    output.innerHTML = 'Complete Data';
    selYearp1 = 2100;

  }
  selYear = this.value;
  generatePlot()
}



function buttonFunc() {
  selCats = [];
  generatePlot();
}





// tdSelector.addEventListener('change', generatePlot, false);
tdSelector.addEventListener('change', function(){selCats = []; generatePlot()}, false);

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}





//usage:

function generatePlot() {

  readTextFile("index.json", function(text){
      var data = JSON.parse(text);


      plotdata=getItems(data);
      plot(plotdata[0], plotdata[2] );



      var but = document.getElementById("buttonSel");
      if (selCats.length > 0) {
        but.style.display = "block";
      } else {
        but.style.display = "none";
      }



      tdPlot.on('plotly_click', function(data){

        if (selCats.includes(Object.keys(plotdata[0])[data.points[0].pointIndex])) {
          selCats = selCats.filter(e => e !== Object.keys(plotdata[0])[data.points[0].pointIndex])
          generatePlot()
        } else {
          selCats.push(Object.keys(plotdata[0])[data.points[0].pointIndex])
          generatePlot()
        }
      });



  });

}


function getItems(input) {

  selValue = tdSelector.value

  var arr = [];
  var fin = {};

  if (selValue == 'Disciplines') {
    var selGr = 'disciplines'
  } else if (selValue == 'Objects') {
    var selGr = 'tadirah_objects'
  } else if (selValue == 'Techniques') {
    var selGr = 'tadirah_techniques'
  }

  for (var i = 0; i < input.length; i++) {
    for (var j = 0; j < input[i][selGr].length; j++) {
        if (!fin[input[i][selGr][j].name]) {
          fin[input[i][selGr][j].name] = 0;
        }
      }
  };
  // sort the dict alphabetically
  function sortOnKeys(dict) {

    var sorted = [];
    for(var key in dict) {
        sorted[sorted.length] = key;
    }
    sorted.sort();

    var tempDict = {};
    for(var i = 0; i < sorted.length; i++) {
        tempDict[sorted[i]] = dict[sorted[i]];
    }

    return tempDict;
  }

  fin = sortOnKeys(fin);


  for (var i = 0; i < input.length; i++) {
    sd = (input[i].start_date).split(";")[0].split("-")

    if ( (new Date(sd[0],sd[1]-1,sd[2]) >= new Date(parseInt(selYear),9-1,1) )  &&  (new Date(sd[0],sd[1]-1,sd[2]) < new Date(parseInt(selYearp1),8-1,31)) ) {


      arr.push(input[i])

    }

  };



  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr[i][selGr].length; j++) {
          fin[arr[i][selGr][j].name] += 1;
      }
  };


  // hier wird jetzt noch das arr angepasst, je nach dem welche werte in selCats sind...

  // select only the entries which are selected in the plot..if nothing is selected then use all data that fits the year.
  var arrSel = [];
  if (selCats.length > 0) {
    for (var i = 0; i< arr.length; i++) {
      for (var j = 0; j < arr[i][selGr].length; j++) {
            if (selCats.includes(arr[i][selGr][j].name) ) {
              arrSel.push(arr[i]);
              break;
            }
        }
    }
  } else {
    arrSel = arr;
  }
  return [fin, arr, arrSel];

}

// info_url
// name
// id
// institution -> name
// course_type -> name

function printcourses(courselist){



  var courselisthtml = document.createElement('ul');



  for (var i = 0; i < courselist.length; i++){
    // Create the list item:
    var item = document.createElement('li');
    // Set its contents:
    item.appendChild(document.createTextNode(courselist[i].name));
    item.appendChild(document.createTextNode(' ('));
    item.appendChild(document.createTextNode(courselist[i].course_type.name));
    item.appendChild(document.createTextNode(') '));
    item.appendChild(document.createTextNode(courselist[i].institution.name));
    item.setAttribute("id", ''.concat('cid-', courselist[i].id));
    // Add it to the list:
    courselisthtml.appendChild(item);
  }
  return courselisthtml;
}






function printcourselisttitle(){

  var courselisttitle = document.createElement('h3');

  if (selCats.length >0 ) {

    courselisttitle.appendChild(document.createTextNode('Courses matching the selection: '));
    for (var i = 0; i<selCats.length; i++) {
      if (i==0) {
        courselisttitle.appendChild(document.createTextNode(selCats[i]));
      } else {
        courselisttitle.appendChild(document.createTextNode(', '));
        courselisttitle.appendChild(document.createTextNode(selCats[i]));

      };
    };
  } else {
    courselisttitle.appendChild(document.createTextNode('Showing all Courses for this year:'));
  }
  return courselisttitle;
}





function plot(dd, courselist){
    let x = [];
    let y = [];

    for (var p in dd) {
          x.push(p);
          y.push(dd[p]);
        };
    var plotcolors = [];

    for (var i = 0; i < x.length; i++) {
      if (selCats.includes(x[i])) {
        plotcolors.push('#C54C82')
      } else {
        plotcolors.push('#000000')

      }
    };

    var plotdata = [{
      x,
      y,
      type:'bar',
      marker: {
        color:plotcolors
        }
    }];

    if (courselist.length > 0) {
      document.getElementById("graph").innerHTML="";
      Plotly.newPlot('graph', plotdata , plotlayout);
      document.getElementById("courselist").innerHTML="";
      document.getElementById("courselist").appendChild(printcourselisttitle());
      document.getElementById("courselist").appendChild(printcourses(courselist));
    } else {
      document.getElementById("graph").innerHTML="";
      Plotly.newPlot('graph', [{data: [],  type:'bar'}] , plotlayoutempty, );
      document.getElementById("courselist").innerHTML="";

  }

}




generatePlot()











// test area
