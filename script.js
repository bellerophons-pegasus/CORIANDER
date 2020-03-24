
/*
* A script to display data from the DH course registry in plots and lists.
* Based on the used keywords, each course is enriched with matching publications
* from Wikidata and from the 'Doing Digital Humanities' Bibliography by DARIAH.
*
*
* authors: Lukas and Martina
*/


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

// layout options for basic bar chart
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

// function to update layout options for an empty bar chart
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


// // print literature from Wikidata TODO
function showLiteratureWikidata(dat_wiki, cr_disciplines, cr_tadirah_objects, cr_tadirah_techniques) {
  // TODO (a bit like zotero; for now only basic)

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

  // the list with the resulting literature
  var relevantLit = [];

  for (var i = 0; i < dat_wiki.results.bindings.length; i++) {

    // first get all the Qids from the json file
    var itemKeyList = [];

    itemKeyList.push(dat_wiki.results.bindings[i]["maintopic-qid"])
    for (var j = 0; j < dat_wiki.results.bindings[i].topicids.value.split('; ').length; j++){
      if (!itemKeyList.includes(dat_wiki.results.bindings[i].topicids.value.split('; ')[j].slice(31)) ) {
        itemKeyList.push(dat_wiki.results.bindings[i].topicids.value.split('; ')[j].slice(31))
      };
    };


    // now try to math the relevant items
    var keyMatches = 0;
    var keyMatchesTags = '';


    for (var j = 0; j < itemKeyList.length; j++) {
      var mappedTerm = getMappedCRterm(itemKeyList[j], false, true);
      if (allKeyList.includes(mappedTerm)){

        keyMatches++;
        keyMatchesTags = keyMatchesTags.concat(mappedTerm,', ');
      };
    };


    if(keyMatches>0){
      rellitentry = dat_wiki.results.bindings[i];
      rellitentry['relevance'] = keyMatches;
      // remove last comma
      keyMatchesTags = keyMatchesTags.slice(0, -2);
      rellitentry['printableTags'] = keyMatchesTags;
      relevantLit.push(rellitentry);
    }


  };


  // now the relevant literature entries are sorted
  relevantLit = sortOnKeys(relevantLit,'num')







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

    litTitle.textContent = relevantLit[i].workLabel.value;
    myPara1.textContent = relevantLit[i].authors.value;
    keyList.textContent = relevantLit[i].topics.value;

    litEntry.appendChild(litTitle);
    litEntry.appendChild(myPara1);
    litEntry.appendChild(keyList);
    myList.appendChild(litEntry);
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

// sort a dict alphabetically or numerically
function sortOnKeys(dict, sortCrit='alpha') {
  var sorted = [];
  // sort alphabetically, ascending, regardless of case
  if (sortCrit=='alpha') {
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
// sort numerically in descending order
  } else if (sortCrit =='num') {
    for (var i=0; i<dict.length; i++) {
        sorted.push(dict[i]);
    };
    // sorting by number descending
    sorted.sort(function(a ,b) {
        if (a.relevance == b.relevance) return 0;
        if (a.relevance > b.relevance) return -1;
        return 1;
    });
    return sorted;
  };
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


  fin = sortOnKeys(fin,'alpha');


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

// print basic information of courses into list with clickable items
// only list the courses that match the selection in the current bar chart
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
    // add a more... text in span and set class for styling
    var itemSpan = document.createElement('span');
    itemSpan.appendChild(document.createTextNode(' more...'));
    itemSpan.setAttribute("class", 'moreText');
    item.appendChild(itemSpan);
    // add a tooltip to the list item
    var itemTip = document.createElement('span');
    itemTip.appendChild(document.createTextNode('Click for more information on course and matching literature from external sources.'))
    itemTip.setAttribute("class", 'courseTipText')
    itemSpan.appendChild(itemTip)
    // set html attributes for list item
    item.setAttribute("id", ''.concat('cid-', courselist[i].id));
    item.setAttribute("class", 'courseEntry');
    item.setAttribute("onclick", ''.concat('openCourseModul(',courselist[i].id,')'));
    // Add it to the list:
    courselisthtml.appendChild(item);
  }
  return courselisthtml;
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

// get the used label in the course registry for a given term from zotero or wikidata
function getMappedCRterm(term, zotero = false, wiki = false) {
  var mappedTerm = '';
  var keyList = Object.keys(mapping[0])
  for(i = 0; i < keyList.length; i++){
    if (zotero == true){
      // there might be more than one tag to compare
      for(j = 0; j < mapping[0][keyList[i]]['zotero'].length; j++){
        if (mapping[0][keyList[i]]['zotero'][j] == term) {
          mappedTerm = keyList[i]
        };
      };
    } else if (wiki == true) {
      // there might be more than one tag to compare
      for(j = 0; j < mapping[0][keyList[i]]['wikidata'].length; j++){
        if (mapping[0][keyList[i]]['wikidata'] == term) {
          mappedTerm = keyList[i]
        };
      };
    };
  };
  return mappedTerm;
}

// print literature from Zotero
function showLiteratureZotero(dat_zot, cr_disciplines, cr_tadirah_objects, cr_tadirah_techniques) {
  // first collect all keywords used in the current course
  var discKeyList = keyToList(cr_disciplines);
  var objKeyList = keyToList(cr_tadirah_objects);
  var techKeyList = keyToList(cr_tadirah_techniques);
  // then combine theses lists into one
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

  // go through list of literature and see how many tags match with selected course
  // only literature that has matches will be included and displayed
  var relevantLit = [];
  for (var i = 0; i < dat_zot.length; i++) {
    var keyMatches = 0;
    var keyMatchesTags = '';
    for (var j = 0; j < dat_zot[i].data.tags.length; j++){
      var mappedTerm = getMappedCRterm(dat_zot[i].data.tags[j].tag, true, false);
      if (allKeyList.includes(mappedTerm)){
        keyMatches++;
        keyMatchesTags = keyMatchesTags.concat(mappedTerm,', ');
      };
    };
    // if there is more than 0 matches, add an attribute 'relevance' with the value
    if(keyMatches>0){
      rellitentry = dat_zot[i];
      rellitentry['relevance'] = keyMatches;
      // remove last comma of list with matches and write pretty list into attribute 'printableTags'
      keyMatchesTags = keyMatchesTags.slice(0, -2);
      rellitentry['printableTags'] = keyMatchesTags;
      // add this literature entry into the list with relevant literature
      relevantLit.push(rellitentry);
    }
  };
  // now the relevant literature entries are sorted by relevance
  relevantLit = sortOnKeys(relevantLit,'num')
  // now the relevant literature from zotero can be displayed in a dedicated html div element
  var litlisthtml = document.createElement('ul');
  litlisthtml.setAttribute("class", 'zotero-lit-list');
  // for each reference add title, authors, year and keywords
  for (var i = 0; i < relevantLit.length; i++) {
    var litEntry = document.createElement('li')
    // Authors
    var litAuthor = document.createElement('span');
    litAuthor.setAttribute("class", 'zot-authors');
    litAuthor.textContent = relevantLit[i].meta.creatorSummary;
    litEntry.appendChild(litAuthor);
    litEntry.appendChild(document.createTextNode(' - '));
    // Title
    var litTitle = document.createElement('span');
    litTitle.setAttribute("class", 'zot-title');
    litTitle.textContent = relevantLit[i].data.title;
    litEntry.appendChild(litTitle);
    // date
    var litDate = document.createElement('span');
    litDate.setAttribute("class", 'zot-date');
    litEntry.appendChild(document.createTextNode(' ('));
    litDate.textContent = relevantLit[i].data.date;
    litEntry.appendChild(litDate);
    litEntry.appendChild(document.createTextNode(')'));
    // DOI or URL
    if (relevantLit[i].data.DOI){
      var litLink = document.createElement('a');
      litLink.setAttribute("href", ''.concat('https://doi.org/', relevantLit[i].data.DOI));
      litLink.setAttribute("target", '_blank');
      litLink.textContent = relevantLit[i].data.DOI;
      litEntry.appendChild(document.createElement('br'));
      litEntry.appendChild(litLink);
    } else if (relevantLit[i].data.url) {
      var litLink = document.createElement('a');
      litLink.setAttribute("href", relevantLit[i].data.url);
      litLink.setAttribute("target", '_blank');
      litLink.textContent = relevantLit[i].data.url;
      litEntry.appendChild(document.createElement('br'));
      litEntry.appendChild(litLink);
    };
    // keywords
    var keyList = document.createElement('p');
    keyList.setAttribute("class", 'zot-keywords');
    keyList.textContent = relevantLit[i].printableTags;
    litEntry.appendChild(keyList);
    litlisthtml.appendChild(litEntry);
};
return litlisthtml;
}

// concatenate list of zotero tags for url
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

// open modal window and display content for selected course
function openCourseModul(courseID) {
  // get html elements to fill
  var modal = document.getElementById("myModal");
  var modalInfo = document.getElementById("modal_info");
  var modalTD_dis = document.getElementById("modal_td_dis");
  var modalTD_obj = document.getElementById("modal_td_obj");
  var modalTD_teq = document.getElementById("modal_td_teq");
  var zoteroSection = document.getElementById("modal-section-zotero");
  var wikidataSection = document.getElementById("modal-section-wikidata");

  // create close button, further styling done with css
  var span = document.getElementsByClassName("close")[0];
  modal.style.display = "block";

  // create html div elements for display of different information sections
  var item_info = document.createElement('div');
  var item_td_dis = document.createElement('div');
  var item_td_obj = document.createElement('div');
  var item_td_teq = document.createElement('div');

  // find corresponding course in data;
  for (var i=0; i<data.length;i++) {
    //if id matches the id we are looking for, output information
    if ( data[i].id ==courseID) {
      // create html elements for general course information
      // title with course name
      var item_info_title = document.createElement('h2');
      item_info_title.appendChild(document.createTextNode(data[i].name));
      item_info.appendChild(item_info_title);
      // Institution and Start date
      var item_info_inst = document.createElement('p');
      item_info_inst.appendChild(document.createTextNode('Institution: '));
      item_info_inst.appendChild(document.createTextNode(data[i].institution.name));
      // only add comma if date is present
      if (data[i].start_date){
        item_info_inst.appendChild(document.createTextNode(', started in: '));
        item_info_inst.appendChild(document.createTextNode(data[i].start_date));
      };
      item_info_inst.appendChild(document.createTextNode('  '));
      item_info.appendChild(item_info_inst);
      // course link
      var item_info_link = document.createElement('a');
      item_info_link.setAttribute("href", data[i].info_url);
      item_info_link.setAttribute("class", 'courseLink');
      item_info_link.setAttribute("target", '_blank');
      item_info_link.appendChild(document.createTextNode('Link to course '));
      // with a nice icon
      var item_info_link_icon = document.createElement('i');
      item_info_link_icon.setAttribute("class", 'fa fa-external-link');
      item_info_link.appendChild(item_info_link_icon);
      item_info_inst.appendChild(item_info_link);
      // contact and contact mail
      var item_info_cont = document.createElement('p');
      item_info_cont.appendChild(document.createTextNode('Contact: '));
      item_info_cont.appendChild(document.createTextNode(data[i].contact_name));
      // only add comma if e-mail is present
      if (data[i].contact_mail){
        item_info_cont.appendChild(document.createTextNode(',  '));
        item_info_cont.appendChild(document.createTextNode(data[i].contact_mail));
      };
      item_info.appendChild(item_info_cont);
      // course description
      var item_info_desc = document.createElement('p');
      item_info_desc.appendChild(document.createTextNode(data[i].description));
      item_info.appendChild(item_info_desc);

      // List of respective keywords, by TaDiRAH class (disciplines, objects, techniques)
      // DISCIPLINES
      var item_td_dis_title = document.createElement('h4');
      item_td_dis_title.appendChild(document.createTextNode('Disciplines'));
      item_td_dis.appendChild(item_td_dis_title);
      // format as unordered list
      var item_td_dis_list = document.createElement('ul');
      item_td_dis.appendChild(item_td_dis_list);
      for (var j = 0; j<data[i].disciplines.length;j++) {
        var item_td_dis_list_item = document.createElement('li');
        item_td_dis_list.appendChild(item_td_dis_list_item);
        item_td_dis_list_item.appendChild(document.createTextNode(data[i].disciplines[j].name));
        // if there is a Zotero mapping for the current disicpline then add link
        if (mapping[0][data[i].disciplines[j].name.trim()]['zotero'] != '') {
            var zot_link = document.createElement('a');
            zot_link.setAttribute("class", 'zot_link');
            zot_link.setAttribute("target", '_blank');
            zot_link.setAttribute("href", ''.concat('https://www.zotero.org/groups/113737/doing_digital_humanities_-_a_dariah_bibliography/tags/', createZoteroArgument(mapping[0][data[i].disciplines[j].name.trim()]['zotero']) ,'/'));
            // link with icon
            var zot_link_icon = document.createElement('img');
            zot_link_icon.setAttribute("src", 'Styling/zotero.ico');
            zot_link_icon.setAttribute("alt", 'Link to Zotero bibliography');
            zot_link.appendChild(zot_link_icon);
            item_td_dis_list_item.appendChild(zot_link);
          };
        // if there is a Wikidata/Scholia mapping for the current disicpline add link
        if (mapping[0][data[i].disciplines[j].name.trim()]['wikidata'] != '') {
            var sco_link = document.createElement('a');
            sco_link.setAttribute("class", 'sco_link');
            sco_link.setAttribute("target", '_blank');
            sco_link.setAttribute("href", ''.concat('https://tools.wmflabs.org/scholia/topic/', mapping[0][data[i].disciplines[j].name.trim()]['wikidata'] ));
            // link with icon
            var sco_link_icon = document.createElement('img');
            sco_link_icon.setAttribute("src", 'Styling/scholia.ico');
            sco_link_icon.setAttribute("alt", 'Link to Scholia bibliography');
            sco_link.appendChild(sco_link_icon);
            item_td_dis_list_item.appendChild(sco_link);
          };
      }

      // OBJECTS
      var item_td_obj_title = document.createElement('h4');
      item_td_obj_title.appendChild(document.createTextNode('TaDiRAH Objects'));
      item_td_obj.appendChild(item_td_obj_title);
      // format as unordered list
      var item_td_obj_list = document.createElement('ul');
      item_td_obj.appendChild(item_td_obj_list);
      for (var j = 0; j<data[i].tadirah_objects.length;j++) {
        var item_td_obj_list_item = document.createElement('li');
        item_td_obj_list.appendChild(item_td_obj_list_item);
        item_td_obj_list_item.appendChild(document.createTextNode(data[i].tadirah_objects[j].name));
        // if there is a Zotero mapping for the current object then add link
        if (mapping[0][data[i].tadirah_objects[j].name.trim()]['zotero'] != '') {
            var zot_link = document.createElement('a');
            zot_link.setAttribute("class", 'zot_link');
            zot_link.setAttribute("target", '_blank');
            zot_link.setAttribute("href", ''.concat('https://www.zotero.org/groups/113737/doing_digital_humanities_-_a_dariah_bibliography/tags/', createZoteroArgument(mapping[0][data[i].tadirah_objects[j].name.trim()]['zotero']) ,'/'));
            // link with icon
            var zot_link_icon = document.createElement('img');
            zot_link_icon.setAttribute("src", 'Styling/zotero.ico');
            zot_link_icon.setAttribute("alt", 'Link to Zotero bibliography');
            zot_link.appendChild(zot_link_icon);
            item_td_obj_list_item.appendChild(zot_link);
          };
        // if there is a Wikidata/Scholia mapping for the current object add link
        if (mapping[0][data[i].tadirah_objects[j].name.trim()]['wikidata'] != '') {
            var sco_link = document.createElement('a');
            sco_link.setAttribute("class", 'sco_link');
            sco_link.setAttribute("target", '_blank');
            sco_link.setAttribute("href", ''.concat('https://tools.wmflabs.org/scholia/topic/', mapping[0][data[i].tadirah_objects[j].name.trim()]['wikidata'] ));
            // link with icon
            var sco_link_icon = document.createElement('img');
            sco_link_icon.setAttribute("src", 'Styling/scholia.ico');
            sco_link_icon.setAttribute("alt", 'Link to Scholia bibliography');
            sco_link.appendChild(sco_link_icon);
            item_td_obj_list_item.appendChild(sco_link);
          };
      }

      // TECHNIQUES
      var item_td_teq_title = document.createElement('h4');
      item_td_teq_title.appendChild(document.createTextNode('TaDiRAH Techniques'));
      item_td_teq.appendChild(item_td_teq_title);
      // format as unordered list
      var item_td_teq_list = document.createElement('ul');
      item_td_teq.appendChild(item_td_teq_list);
      for (var j = 0; j<data[i].tadirah_techniques.length;j++) {
        var item_td_teq_list_item = document.createElement('li');
        item_td_teq_list.appendChild(item_td_teq_list_item);
        item_td_teq_list_item.appendChild(document.createTextNode(data[i].tadirah_techniques[j].name));
        // if there is a Zotero mapping for the current technique then add link
        if (mapping[0][data[i].tadirah_techniques[j].name.trim()]['zotero'] != '') {
            var zot_link = document.createElement('a');
            zot_link.setAttribute("class", 'zot_link');
            zot_link.setAttribute("target", '_blank');
            zot_link.setAttribute("href", ''.concat('https://www.zotero.org/groups/113737/doing_digital_humanities_-_a_dariah_bibliography/tags/', createZoteroArgument(mapping[0][data[i].tadirah_techniques[j].name.trim()]['zotero']) ,'/'));
            // link with icon
            var zot_link_icon = document.createElement('img');
            zot_link_icon.setAttribute("src", 'Styling/zotero.ico');
            zot_link_icon.setAttribute("alt", 'Link to Zotero bibliography');
            zot_link.appendChild(zot_link_icon);
            item_td_teq_list_item.appendChild(zot_link);
          };
        item_td_teq.appendChild(document.createTextNode('   '));
        // if there is a Wikidata/Scholia mapping for the current technique add link
        if (mapping[0][data[i].tadirah_techniques[j].name.trim()]['wikidata'] != '') {
            var sco_link = document.createElement('a');
            sco_link.setAttribute("class", 'sco_link');
            sco_link.setAttribute("target", '_blank');
            sco_link.setAttribute("href", ''.concat('https://tools.wmflabs.org/scholia/topic/', mapping[0][data[i].tadirah_techniques[j].name.trim()]['wikidata'] ));
            // link with icon
            var sco_link_icon = document.createElement('img');
            sco_link_icon.setAttribute("src", 'Styling/scholia.ico');
            sco_link_icon.setAttribute("alt", 'Link to Scholia bibliography');
            sco_link.appendChild(sco_link_icon);
            item_td_teq_list_item.appendChild(sco_link);
          };
      }

      // Display additional literature from other APIs, such as Zotero and Wikidata
      // add literature from Zotero based on keywords of course
      var zotLit = showLiteratureZotero(dat_zot, data[i].disciplines, data[i].tadirah_objects, data[i].tadirah_techniques);

      // add literature from Wikidata based on keywords of course
      var wikiLit = showLiteratureWikidata(dat_wiki, data[i].disciplines, data[i].tadirah_objects, data[i].tadirah_techniques);

      // stop for loop, since we have found the course and are displaying information
      break;
    };
  }

  // now add all elements we created in for look for display in modal window
  modalInfo.appendChild(item_info);
  modalTD_dis.appendChild(item_td_dis);
  modalTD_obj.appendChild(item_td_obj);
  modalTD_teq.appendChild(item_td_teq);
  // print literature from zotero
  var zoteroSectionTitle = document.createElement('h4');
  zoteroSectionTitle.appendChild(document.createTextNode('From Zotero'))
  zoteroSection.appendChild(zoteroSectionTitle);
  zoteroSection.appendChild(zotLit);
  // print literature from Wikidata
  var wikidataSectionTitle = document.createElement('h4');
  wikidataSectionTitle.appendChild(document.createTextNode('From Wikidata'))
  wikidataSection.appendChild(wikidataSectionTitle);
  wikidataSection.appendChild(wikiLit);

  // clear content of modal when it is closed
  span.onclick = function() {
    modalInfo.removeChild(item_info);
    modalTD_dis.removeChild(item_td_dis);
    modalTD_obj.removeChild(item_td_obj);
    modalTD_teq.removeChild(item_td_teq);
    zoteroSection.removeChild(zotLit);
    wikidataSection.removeChild(wikiLit);
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal window, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      // and remove content in it
      modalInfo.removeChild(item_info);
      modalTD_dis.removeChild(item_td_dis);
      modalTD_obj.removeChild(item_td_obj);
      modalTD_teq.removeChild(item_td_teq);
      zoteroSection.removeChild(zotLit);
      wikidataSection.removeChild(wikiLit);
      modal.style.display = "none";
    };
  };
}




function printcourselisttitle(courseListLength){

  var courselisttitle = document.createElement('h3');

  if (selCats.length >0 ) {

    courselisttitle.appendChild(document.createTextNode(courseListLength));
    courselisttitle.appendChild(document.createTextNode(' Courses matching the selection: "'));
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
    courselisttitle.appendChild(document.createTextNode('Complete course list for this year ('));
    courselisttitle.appendChild(document.createTextNode(courseListLength));
    courselisttitle.appendChild(document.createTextNode('):'));
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
      document.getElementById("courselist").appendChild(printcourselisttitle(courselist.length));
      document.getElementById("courselist").appendChild(printcourses(courselist));
    } else {
      document.getElementById("graph").innerHTML="";
      Plotly.newPlot('graph', [{data: [],  type:'bar'}] , emptyLayout(plotlayout));
      document.getElementById("courselist").innerHTML="";
    }

}




generatePlot()


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
