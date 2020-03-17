



var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
var tdPlot = document.getElementById("graph");

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





function generatePlot() {





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
    item.appendChild(document.createTextNode(' more...'));
    item.setAttribute("id", ''.concat('cid-', courselist[i].id));
    item.setAttribute("class", 'courseEntry');
    item.setAttribute("onclick", ''.concat( 'openCourseModul(',courselist[i].id,')' )  );
    // Add it to the list:
    courselisthtml.appendChild(item);
  }
  return courselisthtml;
}

function openCourseModul(courseID) {


  console.log(courseID);
  var modal = document.getElementById("myModal");
  var modalInfo = document.getElementById("modal_info");
  var modalTD_dis = document.getElementById("modal_td_dis");
  var modalTD_obj = document.getElementById("modal_td_obj");
  var modalTD_teq = document.getElementById("modal_td_teq");
  var modalLit = document.getElementById("modal_add_lit");

  var span = document.getElementsByClassName("close")[0];
  modal.style.display = "block";

  var item_info = document.createElement('p');
  var item_td_dis = document.createElement('p');
  var item_td_obj = document.createElement('p');
  var item_td_teq = document.createElement('p');
  var item_add_lit = document.createElement('p');

  // for loop to find entry in data
  for (var i=0; i<data.length;i++) {

    if ( data[i].id ==courseID) {
      item_info.appendChild(document.createTextNode(data[i].name));
      item_info.appendChild(document.createElement("br"));
      item_info.appendChild(document.createTextNode(data[i].description));
      item_info.appendChild(document.createElement("br"));
      item_info.appendChild(document.createElement("br"));
      item_info.appendChild(document.createTextNode('Institution: '));
      item_info.appendChild(document.createTextNode(data[i].institution.name));
      item_info.appendChild(document.createTextNode('  ,    started in:  '));
      item_info.appendChild(document.createTextNode(data[i].start_date));
      item_info.appendChild(document.createElement("br"));
      item_info.appendChild(document.createElement("br"));
      item_info.appendChild(document.createTextNode('Link: '));
      item_info.appendChild(document.createTextNode(data[i].info_url));
      item_info.appendChild(document.createElement("br"));
      item_info.appendChild(document.createElement("br"));
      item_info.appendChild(document.createTextNode('Contact: '));
      item_info.appendChild(document.createTextNode(data[i].contact_name));
      item_info.appendChild(document.createTextNode('  ,  '));
      item_info.appendChild(document.createTextNode(data[i].contact_mail));
      item_info.appendChild(document.createElement("br"));
      item_info.appendChild(document.createElement("br"));

      // here are the respective tadirah entries: disciplines, objects, techniques

      item_td_dis.appendChild(document.createTextNode('Disciplines: '));
      for (var j = 0; j<data[i].disciplines.length;j++) {
        item_td_dis.appendChild(document.createElement("br"));
        item_td_dis.appendChild(document.createTextNode(data[i].disciplines[j].name));
        item_td_dis.appendChild(document.createTextNode('   '));

        // check if there is a Zotero mapping for the current disicpline
        if (mapping[0][data[i].disciplines[j].name.trim()]['zotero'] != '') {
            var zot_link = document.createElement('a');
            zot_link.setAttribute("class", 'zot_link');
            zot_link.setAttribute("href", ''.concat('https://www.zotero.org/groups/113737/doing_digital_humanities_-_a_dariah_bibliography/tags/', mapping[0][data[i].disciplines[j].name.trim()]['zotero'] ,'/'));
            zot_link.appendChild(document.createTextNode('Z'));
            item_td_dis.appendChild(zot_link);
          };
          item_td_dis.appendChild(document.createTextNode('   '));
          // check if there is a Scholia mapping for the current disicpline
          if (mapping[0][data[i].disciplines[j].name.trim()]['wikidata'] != '') {
              var sco_link = document.createElement('a');
              sco_link.setAttribute("class", 'sco_link');
              sco_link.setAttribute("href", ''.concat('https://tools.wmflabs.org/scholia/topic/', mapping[0][data[i].disciplines[j].name.trim()]['wikidata'] ));
              sco_link.appendChild(document.createTextNode('S'));
              item_td_dis.appendChild(sco_link);
            };
      }

      item_td_obj.appendChild(document.createTextNode('TADIRAH Objects: '));
      for (var j = 0; j<data[i].tadirah_objects.length;j++) {
        item_td_obj.appendChild(document.createElement("br"));
        item_td_obj.appendChild(document.createTextNode(data[i].tadirah_objects[j].name));
        item_td_obj.appendChild(document.createTextNode('   '));

        // check if there is a Zotero mapping for the current object
        console.log(data[i].tadirah_objects[j].name.trim());
        if (mapping[0][data[i].tadirah_objects[j].name.trim()]['zotero'] != '') {
            var zot_link = document.createElement('a');
            zot_link.setAttribute("class", 'zot_link');
            zot_link.setAttribute("href", ''.concat('https://www.zotero.org/groups/113737/doing_digital_humanities_-_a_dariah_bibliography/tags/', mapping[0][data[i].tadirah_objects[j].name.trim()]['zotero'] ,'/'));
            zot_link.appendChild(document.createTextNode('Z'));
            item_td_obj.appendChild(zot_link);
          };
        item_td_obj.appendChild(document.createTextNode('   '));
        // check if there is a Scholia mapping for the current object
        if (mapping[0][data[i].tadirah_objects[j].name.trim()]['wikidata'] != '') {
            var sco_link = document.createElement('a');
            sco_link.setAttribute("class", 'sco_link');
            sco_link.setAttribute("href", ''.concat('https://tools.wmflabs.org/scholia/topic/', mapping[0][data[i].tadirah_objects[j].name.trim()]['wikidata'] ));
            sco_link.appendChild(document.createTextNode('S'));
            item_td_obj.appendChild(sco_link);
          };

      }

      item_td_teq.appendChild(document.createTextNode('TADIRAH Techniques: '));
      for (var j = 0; j<data[i].tadirah_techniques.length;j++) {
        item_td_teq.appendChild(document.createElement("br"));
        item_td_teq.appendChild(document.createTextNode(data[i].tadirah_techniques[j].name));
        item_td_teq.appendChild(document.createTextNode('   '));

        // check if there is a Zotero mapping for the current technique
        if (mapping[0][data[i].tadirah_techniques[j].name.trim()]['zotero'] != '') {
            var zot_link = document.createElement('a');
            zot_link.setAttribute("class", 'zot_link');
            zot_link.setAttribute("href", ''.concat('https://www.zotero.org/groups/113737/doing_digital_humanities_-_a_dariah_bibliography/tags/', mapping[0][data[i].tadirah_techniques[j].name.trim()]['zotero'] ,'/'));
            zot_link.appendChild(document.createTextNode('Z'));
            item_td_teq.appendChild(zot_link);
          };
        item_td_teq.appendChild(document.createTextNode('   '));
        // check if there is a Scholia mapping for the current technique
        if (mapping[0][data[i].tadirah_techniques[j].name.trim()]['wikidata'] != '') {
            var sco_link = document.createElement('a');
            sco_link.setAttribute("class", 'sco_link');
            sco_link.setAttribute("href", ''.concat('https://tools.wmflabs.org/scholia/topic/', mapping[0][data[i].tadirah_techniques[j].name.trim()]['wikidata'] ));
            sco_link.appendChild(document.createTextNode('S'));
            item_td_teq.appendChild(sco_link);
          };
      }


      // here are the additional literatures and infos from the other APIs


      item_add_lit.appendChild(document.createTextNode('Additional Literature:'));
      item_add_lit.appendChild(document.createElement("br"));
      item_add_lit.appendChild(document.createElement("br"));

    };

  }

  modalInfo.appendChild(item_info);
  modalTD_dis.appendChild(item_td_dis);
  modalTD_obj.appendChild(item_td_obj);
  modalTD_teq.appendChild(item_td_teq);
  modalLit.appendChild(item_add_lit);

  span.onclick = function() {
    modalInfo.removeChild(item_info);
    modalTD_dis.removeChild(item_td_dis);
    modalTD_obj.removeChild(item_td_obj);
    modalTD_teq.removeChild(item_td_teq);
    modalLit.removeChild(item_add_lit);
    modal.style.display = "none";
  }
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




console.log(dat_zot[0]);




// test area
