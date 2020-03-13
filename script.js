












// Slider functions






var slider = document.getElementById("myRange");
var output = document.getElementById("demo");

var selYear = slider.value;

generatePlot()

output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = this.value;
  selYear = this.value;
  // console.log(selYear);
  generatePlot()

}








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

      plot(getItems(data));
  });

}





function getItems(input) {
  // var arr = input;
  var arr = [];

  // console.log(selYear,'test');
  // console.log( (new Date(parseInt(selYear)+1,8-1,31)));

  for (var i = 0; i < input.length; i++) {
    sd = (input[i].start_date).split(";")[0].split("-")

    // console.log(new Date(sd[0],sd[1]-1,sd[2]), new Date(selYear,9-1,1) );
    //
    // console.log((new Date(sd[0],sd[1]-1,sd[2]) >= new Date(parseInt(selYear),9-1,1) ));
    // console.log((new Date(sd[0],sd[1]-1,sd[2]) < new Date(parseInt(selYear)+1,8-1,31)));
    if ( (new Date(sd[0],sd[1]-1,sd[2]) >= new Date(parseInt(selYear),9-1,1) )  &&  (new Date(sd[0],sd[1]-1,sd[2]) < new Date(parseInt(selYear)+1,8-1,31)) ) {

      arr.push(input[i])
    }

  };



  var fin = [], dis = {}, obj = {}, teq = {} ;
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

// 0:disciplines, 1:objects, 2:techniques

    let x = [];
    let y = [];

    for (var p in dd[i]) {
          x.push(p);
          y.push(dd[i][p]);
        }

    return {x,y, visible: i === 0, type:'bar'};
  }


    Plotly.newPlot('graph', [0,1,2].map(makePlotData), {

       // sliders: [{
       //       pad: {t: 30},
       //       x: 0.05,
       //       y: -1,
       //       len: 0.95,
       //       currentvalue: {
       //         xanchor: 'right',
       //         prefix: 'Academic year starting in September of ',
       //         font: {
       //           color: '#888',
       //           size: 20
       //         }
       //       },
       //
       //       steps: [{
       //         label: '1999',
       //         method: 'restyle',
       //         args: [['red'], {
       //           mode: 'immediate',
       //           frame: {redraw: false}
       //         }]
       //       }, {
       //         label: '2000',
       //         method: 'restyle',
       //         args: [['green'], {
       //           mode: 'immediate',
       //           frame: {redraw: false}
       //         }]
       //       }, {
       //         label: '2001',
       //         method: 'restyle',
       //         args: [['blue'], {
       //           mode: 'immediate',
       //           frame: {redraw: false}
       //         }]
       //       }]
       //     }],

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
