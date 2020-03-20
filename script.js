



var slider = document.getElementById("myRange");
var output = document.getElementById("sliderOutput");
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
  bargap :0.05,
  plot_bgcolor: "rgba(255, 255, 255, 0)",
  paper_bgcolor: "rgba(255, 255, 255, 0)"
};

// function to update layout options for empty bar chart
function emptyLayout(plotlayout){
  var plotlayoutempty = JSON.parse(JSON.stringify(plotlayout));
  plotlayoutempty.title = 'No courses for this year';
  plotlayoutempty.xaxis.ticks = '';
  plotlayoutempty.xaxis.showticklabels = false;
  return plotlayoutempty;
}

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

// get the used label in the course registry for a given term from zotero
// can maybe be reused for wikidata as well?
function getMappedCRterm(term, zotero = false, wiki = false) {
  var mappedTerm = '';
  var keyList = Object.keys(mapping[0])
  for(i = 0; i < keyList.length; i++){
    if (zotero == true){
      if (mapping[0][keyList[i]]['zotero'] == term) {
        mappedTerm = keyList[i]
      };
    };
  };
  return mappedTerm;
}

// create a clean array without duplicates out of a given array
function keyToList(keyArray) {
  var keyList = []
  for (var i = 0; i < keyArray.length; i++){
    if (keyList.includes(keyArray[i].name.trim())){
      // do not add if already there
      continue
    } else {
      // add if not in list
      keyList.push(keyArray[i].name.trim());
    };
  };
  return keyList;
}

// print literature from Zotero
function showLiteratureZotero(dat_zot, cr_disciplines, cr_tadirah_objects, cr_tadirah_techniques) {
  // collect all keywords used in the current course
  var discKeyList = keyToList(cr_disciplines);
  var objKeyList = keyToList(cr_tadirah_objects);
  var techKeyList = keyToList(cr_tadirah_techniques);
  // combine theses lists into one
  var allKeyList = []
  for (var i = 0; i < discKeyList.length; i++){
    allKeyList.push(discKeyList[i])
  };
  for (var i = 0; i < objKeyList.length; i++){
    allKeyList.push(objKeyList[i])
  };
  for (var i = 0; i < techKeyList.length; i++){
    allKeyList.push(techKeyList[i])
  };

  // go through list of literature and see how many topics match with selected course
  // only literature that matches keywords will be listed
  var relevantLit = [];
  for (var i = 0; i < dat_zot.length; i++) {
    var keyMatches = 0;
    var keyMatchesTags = '';
    for (var j = 0; j < dat_zot[i].data.tags.length; j++){
      var mappedTerm = getMappedCRterm(dat_zot[i].data.tags[j].tag, true, false);
      if (allKeyList.includes(mappedTerm)){
        keyMatches++;
        keyMatchesTags = keyMatchesTags.concat(mappedTerm);
      };
    };
    if(keyMatches>0){
      rellitentry = dat_zot[i];
      rellitentry['relevance'] = keyMatches;
      rellitentry['printableTags'] = keyMatchesTags;
      relevantLit.push(rellitentry);
    }
  };

  // now the relevant literature from zotero can be displayed
  var litlisthtml = document.createElement('div');
  litlisthtml.className = "referenceEntry";
  var myList = document.createElement('ul');
  litlisthtml.appendChild(myList);

  for (var i = 0; i < relevantLit.length; i++) {
    var litEntry = document.createElement('li')
    var litTitle = document.createElement('h4');
    var myPara1 = document.createElement('p');
    var keyList = document.createElement('div');
    keyList.className = 'keywords';


    litTitle.textContent = relevantLit[i].data.title;
    myPara1.textContent = relevantLit[i].meta.creatorSummary;
    keyList.textContent = relevantLit[i].printableTags;

    litEntry.appendChild(litTitle);
    litEntry.appendChild(myPara1);
    litEntry.appendChild(keyList);
    myList.appendChild(litEntry);


/*
Further possible fields
"data": {"key": "N9RGN6H4", "version": 2719, "itemType": "journalArticle", "title": "Interpreting Burrows's Delta: Geometric and Probabilistic Foundations", "creators": [{"creatorType": "author", "firstName": "Shlomo", "lastName": "Argamon"}], "publicationTitle": "Literary and Linguistic Computing", "volume": "23", "issue": "2", "pages": "131 -147", "date": "2008", "series": "", "seriesTitle": "", "seriesText": "", "journalAbbreviation": "", "language": "en", "DOI": "10.1093/llc/fqn003", "ISSN": "", "shortTitle": "Interpreting Burrows's Delta", "url": "http://llc.oxfordjournals.org/content/23/2/131.abstract", "accessDate": "2011-07-26T08:25:16Z", "archive": "", "archiveLocation": "", "libraryCatalog": "", "callNumber": "", "rights": "", "extra": ""]*/
};
return litlisthtml;
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
    // sorting regardless of upper- or lowercase characters
    sorted.sort(function(a,b) {
        a = a.toLowerCase();
        b = b.toLowerCase();
        if (a == b) return 0;
        if (a > b) return 1;
        return -1;
    });

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

// concatenate list of zotero tags
function createZoteroArgument(keyList) {
  var linkargument = '';
  for (var i = 0; i<keyList.length;i++){
    if (linkargument == '') {
      linkargument = keyList[i].trim();
    } else {
      linkargument = ''.concat(linkargument,' || ',keyList[i].trim(),);
    };
  };
  return linkargument;
}

function openCourseModul(courseID) {
  console.log(courseID);
  var modal = document.getElementById("myModal");
  var modalInfo = document.getElementById("modal_info");
  var modalTD_dis = document.getElementById("modal_td_dis");
  var modalTD_obj = document.getElementById("modal_td_obj");
  var modalTD_teq = document.getElementById("modal_td_teq");
  var modalLit = document.getElementById("modal_add_lit");
  var zoteroSection = document.getElementById("modal-section-zotero");

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

      // DISCIPLINES
      item_td_dis.appendChild(document.createTextNode('Disciplines: '));
      for (var j = 0; j<data[i].disciplines.length;j++) {
        item_td_dis.appendChild(document.createElement("br"));
        item_td_dis.appendChild(document.createTextNode(data[i].disciplines[j].name));
        item_td_dis.appendChild(document.createTextNode('   '));

        // check if there is a Zotero mapping for the current disicpline
        if (mapping[0][data[i].disciplines[j].name.trim()]['zotero'] != '') {
            var zot_link = document.createElement('a');
            zot_link.setAttribute("class", 'zot_link');
            zot_link.setAttribute("href", ''.concat('https://www.zotero.org/groups/113737/doing_digital_humanities_-_a_dariah_bibliography/tags/', createZoteroArgument(mapping[0][data[i].disciplines[j].name.trim()]['zotero']) ,'/'));
            zot_link.appendChild(document.createTextNode('Z'));
            item_td_dis.appendChild(zot_link);
          };
        item_td_dis.appendChild(document.createTextNode('   '));
        // check if there is a Wikidata/Scholia mapping for the current disicpline
        if (mapping[0][data[i].disciplines[j].name.trim()]['wikidata'] != '') {
            var sco_link = document.createElement('a');
            sco_link.setAttribute("class", 'sco_link');
            sco_link.setAttribute("href", ''.concat('https://tools.wmflabs.org/scholia/topic/', mapping[0][data[i].disciplines[j].name.trim()]['wikidata'] ));
            sco_link.appendChild(document.createTextNode('S'));
            item_td_dis.appendChild(sco_link);
          };
      }

      // OBJECTS
      item_td_obj.appendChild(document.createTextNode('TADIRAH Objects: '));
      for (var j = 0; j<data[i].tadirah_objects.length;j++) {
        item_td_obj.appendChild(document.createElement("br"));
        item_td_obj.appendChild(document.createTextNode(data[i].tadirah_objects[j].name));
        item_td_obj.appendChild(document.createTextNode('   '));

        // check if there is a Zotero mapping for the current object
        //console.log(data[i].tadirah_objects[j].name.trim());
        if (mapping[0][data[i].tadirah_objects[j].name.trim()]['zotero'] != '') {
            var zot_link = document.createElement('a');
            zot_link.setAttribute("class", 'zot_link');
            zot_link.setAttribute("href", ''.concat('https://www.zotero.org/groups/113737/doing_digital_humanities_-_a_dariah_bibliography/tags/', createZoteroArgument(mapping[0][data[i].tadirah_objects[j].name.trim()]['zotero']) ,'/'));
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
            zot_link.setAttribute("href", ''.concat('https://www.zotero.org/groups/113737/doing_digital_humanities_-_a_dariah_bibliography/tags/', createZoteroArgument(mapping[0][data[i].tadirah_techniques[j].name.trim()]['zotero']) ,'/'));

//            zot_link.setAttribute("href", ''.concat('https://www.zotero.org/groups/113737/doing_digital_humanities_-_a_dariah_bibliography/tags/', mapping[0][data[i].tadirah_techniques[j].name.trim()]['zotero'] ,'/'));
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

      var zotLit = showLiteratureZotero(dat_zot, data[i].disciplines, data[i].tadirah_objects, data[i].tadirah_techniques);

    };

  }

  modalInfo.appendChild(item_info);
  modalTD_dis.appendChild(item_td_dis);
  modalTD_obj.appendChild(item_td_obj);
  modalTD_teq.appendChild(item_td_teq);
  modalLit.appendChild(item_add_lit);
  // print literature from zotero
  zoteroSection.appendChild(zotLit);

  span.onclick = function() {
    modalInfo.removeChild(item_info);
    modalTD_dis.removeChild(item_td_dis);
    modalTD_obj.removeChild(item_td_obj);
    modalTD_teq.removeChild(item_td_teq);
    modalLit.removeChild(item_add_lit);
    zoteroSection.removeChild(zotLit);
    modal.style.display = "none";
  }
}




function printcourselisttitle(){

  var courselisttitle = document.createElement('h3');

  if (selCats.length >0 ) {

    courselisttitle.appendChild(document.createTextNode('Courses matching the selection "'));
    for (var i = 0; i<selCats.length; i++) {
      if (i==0) {
        courselisttitle.appendChild(document.createTextNode(selCats[i]));
      } else {
        courselisttitle.appendChild(document.createTextNode(', '));
        courselisttitle.appendChild(document.createTextNode(selCats[i]));

      };
    };
    courselisttitle.appendChild(document.createTextNode('"'));
  } else {
    courselisttitle.appendChild(document.createTextNode('Complete course list for this year:'));
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
        plotcolors.push('#c54c82')
      } else {
        plotcolors.push('#609f60')

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
      Plotly.newPlot('graph', [{data: [],  type:'bar'}] , emptyLayout(plotlayout));
      document.getElementById("courselist").innerHTML="";
    }

}




generatePlot()




//console.log(dat_zot[0]);

// Further functionality; e.g. for layout
// When the user scrolls down 90px from the top of the document, resize the logo
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 65 || document.documentElement.scrollTop > 65) {
    document.getElementById("logowrapper").style.width = "50px";
    document.getElementById("coriander-logo").style.width = "50px";
  } else {
    document.getElementById("logowrapper").style.width = "100px";
    document.getElementById("coriander-logo").style.width = "100px";
  }
}
