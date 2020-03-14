



// Slider functions






var slider = document.getElementById("myRange");
var output = document.getElementById("demo");

var selYear = slider.value;


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
    gridwidth: 1,
    range: [0,30]
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
    range: [0,30]
  },
};


output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = this.value;
  selYear = this.value;
  // console.log(selYear);
  generatePlot()

}

tdSelector.addEventListener('change', generatePlot, false);

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
      // console.log(data);

      // console.log(getItems(data));
      //
      // getItems(data);
      plotdata=getItems(data);
      plot(plotdata[0], plotdata[1] );
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
  // sort the dist alphabetically
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

    if ( (new Date(sd[0],sd[1]-1,sd[2]) >= new Date(parseInt(selYear),9-1,1) )  &&  (new Date(sd[0],sd[1]-1,sd[2]) < new Date(parseInt(selYear)+1,8-1,31)) ) {
      arr.push(input[i])
    }

  };


//  var courselist = {};



  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr[i][selGr].length; j++) {
          fin[arr[i][selGr][j].name] += 1;
      }
  };

  return [fin, arr];

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
//  return "<p>Courses available!</p>";
  return courselisthtml;
}


function plot(dd, courselist){
    let x = [];
    let y = [];

    for (var p in dd) {
          x.push(p);
          y.push(dd[p]);
        }
    if (courselist.length > 0) {
      document.getElementById("graph").innerHTML="";
      Plotly.newPlot('graph', [{x,y,  type:'bar'}] , plotlayout);
      document.getElementById("courselist").innerHTML="";
      document.getElementById("courselist").appendChild(printcourses(courselist));
    } else {
      document.getElementById("graph").innerHTML="";
      Plotly.newPlot('graph', [{data: [],  type:'bar'}] , plotlayoutempty, );
      document.getElementById("courselist").innerHTML="";
  }

}

generatePlot()
