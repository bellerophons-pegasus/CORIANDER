//let jsondata;

// var url = 'https://dhcr.clarin-dariah.eu/api/v1/courses/index?recent';


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

readTextFile("index.json", function(text){
    var data = JSON.parse(text);
    console.log(data);

    usedata(data);


    console.log(getItems(data));
    plot(getItems(data));
});




function usedata(data) {


  // document.write(data[0].start_date);


}



function getItems(input) {
  var arr = input, fin = [], dis = {}, obj = {}, teq = {} ;
  for (var i = 0; i < arr.length; i++) {

    for (var j = 0; j < arr[i].disciplines.length; j++) {
        if (!dis[arr[i].disciplines[j].name]) {
          dis[arr[i].disciplines[j].name] = 1;
        } else if (dis[arr[i].disciplines[j].name]) {
          dis[arr[i].disciplines[j].name] += 1;
        }
      };
    for (var j = 0; j < arr[i].tadirah_objects.length; j++) {
        if (!obj[arr[i].tadirah_objects[j].name]) {
          obj[arr[i].tadirah_objects[j].name] = 1;
        } else if (obj[arr[i].tadirah_objects[j].name]) {
          obj[arr[i].tadirah_objects[j].name] += 1;
        }
      };
    for (var j = 0; j < arr[i].tadirah_techniques.length; j++) {
        if (!teq[arr[i].tadirah_techniques[j].name]) {
          teq[arr[i].tadirah_techniques[j].name] = 1;
        } else if (teq[arr[i].tadirah_techniques[j].name]) {
          teq[arr[i].tadirah_techniques[j].name] += 1;
        }
      }
  };
  fin.push(dis);
  fin.push(obj);
  fin.push(teq);
  return fin;

}



function plot(dd){


  function makePlotData(i) {

    let x = [];
    let y = [];

    for (var p in dd[i]) {
          x.push(p);
          y.push(dd[i][p]);
        }

    return {x,y, visible: i ===0};
  }
  // let trace1 = {
  //   x: [],
  //   y: [],
  //   name: 'Disciplines'
  // };
  // let trace2 = {
  //   x: [],
  //   y: [],
  //   name: 'Objects'
  // };
  // let trace3 = {
  //   x: [],
  //   y: [],
  //   name: 'Techniques'
  // };
  //
  // for (var p in dd[0]) {
  //       trace1.x.push(p);
  //       trace1.y.push(dd[p]);
  //   }
  // for (var p in dd[1]) {
  //       trace2.x.push(p);
  //       trace2.y.push(dd[p]);
  //   }
  // for (var p in dd[2]) {
  //       trace3.x.push(p);
  //       trace3.y.push(dd[p]);
  //   }

// [trace1,trace2,trace3]


    Plotly.newPlot('graph', [0,1,2].map(makePlotData), {
      updatemenus: [ {
          y: 1,
          yanchor: 'top',
          buttons: [{
              method: 'restyle',
              args: ['visible', [true, false, false]],
              label: 'Disciplines'
          }, {
              method: 'restyle',
              args: ['visible', [false, true, false]],
              label: 'Objects'
          }, {
              method: 'restyle',
              args: ['visible', [false, false, true]],
              label: 'Techniques'
          }]
      }],
  });




}







//
// var rawDataURL = 'https://raw.githubusercontent.com/plotly/datasets/master/2016-weather-data-seattle.csv';
// var xField = 'Date';
// var yField = 'Mean_TemperatureC';
//
//
//
// Plotly.d3.csv(rawDataURL, function(err, rawData) {
//     if(err) throw err;
//
//     var data = prepData(rawData);
//     var layout = {
//         title: 'Time series with range slider and selectors',
//         xaxis: {
//             rangeslider: {}
//         },
//         yaxis: {
//             fixedrange: true
//         }
//     };
//
//     Plotly.plot('graph', data, layout, {showSendToCloud: true});
// });
//
// function prepData(rawData) {
//     var x = [];
//     var y = [];
//
//     console.log(rawData.length)
//
//     rawData.forEach(function(datum, i) {
//         if(i % 100) return;
//
//         x.push(new Date(datum[xField]));
//         y.push(datum[yField]);
//     });
//
//     return [{
//         mode: 'lines',
//         x: x,
//         y: y
//     }];
// }
