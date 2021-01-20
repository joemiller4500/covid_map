
// import GeoJSON file created in data.py
d3.json("static/data/usgeo.geojson", function(data) {

  Plotly.d3.csv("https://raw.githubusercontent.com/plotly/datasets/master/finance-charts-apple.csv", function(err, rows){

//   function unpack(rows, key) {
//   return rows.map(function(row) { return row[key]; });

// }
// console.log(unpack(rows, 'Date'))
// console.log(unpack(rows, 'AAPL.High'))
})

  var geojson;

  var toType = function(obj) {
          return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
        }

  var dates = []
  d3.json("static/data/dates.json", function(dataD) {
    // console.log(data)
    dates = dataD;
    // console.log(dates)
    d3.json("static/data/confirmedTS.json", function(dataE){
      d3.json("static/data/deathsTS.json", function(dataF){
        // console.log(dataF)
        console.log(dataE.timeseries['01003'].map(String))
        // var dataF = JSON.parse(dataE)
        // console.log(dataF)
        // console.log(dataD)
        // console.log(dataD[0])
        // console.log(dataD[dataD.length - 1])


      // function used to output specific object type during
      // testing, taken from Angus Croll
        

        // d3.json("static/data/confirmedTS.json", function(dataB){
        //   d3.json("static/data/dates.json", function(dataC){
        //     console.log(dataC)
        //     for(var i=0;i<data.features.length;i++){
        //       console.log(dataB)
        //       data.features[i].properties.timeseries = dataB.timeseries[i];
        //       data.features[i].properties.dateseries = dataC;
        //     }
        //   })
        // });
        // var datapoint = []
        // datapoint = data.features[0].properties.timeseries;
      // console.log(data.features.length);
        // var datapoint = data.features[0].properties
        // console.log(datapoint);
        // for (var item in datapoint){
        //   console.log(item);
        // }
        // data.features[0].properties.conf = [[0,1,2]];
        // console.log(data.features[0].properties);
        // featureById = {}
        // data.features.forEach(f => featureById[f.id] = f) 
        // featureById[0].properties.value = 1
        // featureById[1].properties.value = 1
      // load background layers from mapbox via Leaflet


        var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "light-v10",
            accessToken: API_KEY
        });
        var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
          attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
          maxZoom: 18,
          id: "dark-v10",
          accessToken: API_KEY
        });
       

        var baseMaps = {
          "Light Map": lightmap,
          "Dark Map": darkmap
        };

        // function to give color to features on map
        function getColor(d) {
          return d > 0.14 ? '#67000d' :
                d > 0.12  ? '#a50f15' :
                d > 0.10  ? '#cb181d' :
                d > 0.08  ? '#ef3b2c' :
                d > 0.06   ? '#fb6a4a' :
                d > 0.045   ? '#fc9272' :
                d > 0.03   ? '#fcbba1' :
                d > 0.02   ? '#fee0d2' :
                d > 0      ? '#fff5f0':
                d = 'null'   ? '#ccffcc' :
                                '#fff5f0'
        }

        // function for cloropleth style, color based on 'perc' 
        // calculated in data.py
        function style(feature) {
          return {
              fillColor: getColor((feature.properties.perten)/10000),
              weight: 1,
              opacity: 1,
              color: 'white',
              dashArray: '3',
              fillOpacity: 0.45
          };
        }

        function getTimeseriesC(fips) {
          console.log(dataE.timeseries[fips])
          return dataE.timeseries[fips].map(String)
          // console.log(dataE.timeseries[fips])
          // let ret = Object.values(dataE.timeseries).filter(function(d) {
          //   return d == fips
          // })
          // console.log(ret)
          // return ret
          // return dataE.timeseries.filter(
          //     function(data){ return data.FIPS == fips }
          // );
        }

        function getTimeseriesD(fips) {

          // console.log(dataF.timeseries[fips])
          return dataF.timeseries[fips].map(String)
          // console.log(Object.values(dataF))
          let ret = Object.values(dataF).filter(function(d) {
            return d == fips
          })
          // console.log(ret)
          return ret
          // return dataF.timeseries.filter(
          //     function(data){ return data.FIPS == fips }
          // );
        }

        function setLineTraces(feature){

          var fips = feature.target.feature.properties.FIPS
          // var title = feature.sourceTarget.feature.properties.NAME + " County, " + feature.sourceTarget.feature.properties.Province_State
          var title = " "
          var trace1 = {
            type: "scatter",
            mode: "lines",
            name: 'New Cases',
            x: dataD,
            y: getTimeseriesC(fips),
            line: {color: '#ff0000'}
          }
  
          var trace2 = {
            type: "scatter",
            mode: "lines",
            name: 'Total Deaths',
            x: dataD,
            y: getTimeseriesD(fips),
            line: {color: '#000000'}
          }
  
          var dataT = [trace1,trace2];
          console.log([dataD[dataD.length - 1], dataD[0]])
  
          var layout = {
            title: title ,
            xaxis: {
              autorange: false,
              // range: [dataD[dataD.length - 1], dataD[0]],
              range: [dataD[0], dataD[dataD.length - 1]],
              rangeselector: {buttons: [
                  {
                    count: 1,
                    label: '1m',
                    step: 'month',
                    stepmode: 'backward'
                  },
                  {
                    count: 3,
                    label: '3m',
                    step: 'month',
                    stepmode: 'backward'
                  },
                  {step: 'all'}
                ]},
              rangeslider: {range: [dataD[0], dataD[dataD.length - 1]]},
                // range: [dataD[dataD.length - 1], dataD[0]]},
              type: 'date'
            },
            yaxis: {
              autorange: true,
              range: [-50, 30],
              type: 'linear'
            }
          };
  
          Plotly.react('timeseries', dataT, layout);


          // var fips = feature.target.feature.properties.FIPS
          // var title = feature.sourceTarget.feature.properties.NAME + " County"
          // var layout_update = {
          //   title: "title", // updates the title
          // };
        // var data_update = {
        //     // 'marker.color': 'red'
        // };
          // Plotly.react("timeseries", layout_update)
        
          // console.log(title)
          // var string =
          // Plotly.restyle("timeseries", "y", [getTimeseriesC(fips),getTimeseriesD(fips)]);
          // Plotly.restlye("timeseries", "title", [''])
          // Plotly.restyle("timeseries", "y", [getTimeseriesD(fips),1]);
          
        }

        function setRadarTraces(feature){
          if (feature.target.feature.properties.clintonVotes > feature.target.feature.properties.trumpVotes){
            var col = {color: '#0000ff'}
          }
          else{
            var col = {color: '#ff0000'}
          }
          console.log(feature.target.feature.properties.otherVotes)
          dataR = [{
            type: 'scatterpolar',
            r: [feature.target.feature.properties.clintonVotes,feature.target.feature.properties.trumpVotes,feature.target.feature.properties.otherVotes],
            theta: ['Clinton','Trump','Other', 'Clinton'],
            fill: 'toself',
            line: col
          }]
          layout = {
            polar: {
              radialaxis: {
                visible: true,
                range: [0, 50000],
                autorange: true
              }
            },
            showlegend: false
          }
          Plotly.react("radar",dataR,layout)
        }

        function setBarTrace(feature){
          var dataB = [
            {
              x: ['White', 'African American', 'American Indian/Alaska Native', 'Asian', 'Native Hawaiian/Pacific Islander','2 or more races'],
              y: [feature.target.feature.properties.WHT, feature.target.feature.properties.AA, feature.target.feature.properties.AI, feature.target.feature.properties.AS, feature.target.feature.properties.PI, feature.target.feature.properties.MX],
              type: 'bar'
            }
          ];
          var layoutUpdate = {
            "margin.b": 150
          };
          
          
          Plotly.react('bar', dataB);
          Plotly.relayout(bar, layoutUpdate);
          // Plotly.restyle("bar","y",[feature.target.feature.properties.WHT, feature.target.feature.properties.AA, feature.target.feature.properties.AI, feature.target.feature.properties.AS, feature.target.feature.properties.PI, feature.target.feature.properties.MX])
        }

        function setGaugeTrace(feature){
          var dataG = [
            {
              domain: { x: [0, 1], y: [0, 1] },
              value: (100*feature.target.feature.properties.HISP),
              title: { text: "Percent Hispanic" },
              type: "indicator",
              mode: "gauge+number",
              gauge: {
                axis: { range: [null, 100] }
              }
            }
          ];
          
          // var layout = { width: 100, height: 100, margin: { t: 0, b: 0 } };
          Plotly.react('gauge', dataG, layout);
        }

        function setGaugeCTrace(feature){
          var fips = feature.target.feature.properties.FIPS
          
          var dataGC = [
            {
              domain: { x: [0, 1], y: [0, 1] },
              value: (feature.target.feature.properties.perten),
              title: { text: "New cases over last week <br> per 10,000 popluation" },
              type: "indicator",
              mode: "gauge+number",
              // line:{color: "#ff0000"}
              gauge: {
                bar: { color: "red" },
                axis: { range: [null, 2000] }
              }
            }
          ];
          
          // var layout = { width: 100, height: 100, margin: { t: 0, b: 0 } };
          Plotly.react('gaugeC', dataGC, layout);
        }

        function setTraces(feature) {
          setLineTraces(feature)
          setRadarTraces(feature)
          setBarTrace(feature)
          setGaugeTrace(feature)
          setGaugeCTrace(feature)
          // var fips = feature.target.feature.properties.FIPS
          var title = feature.sourceTarget.feature.properties.NAME + " County, " + feature.sourceTarget.feature.properties.Province_State
          var element = document.getElementById("title"); 
          element.innerHTML = title;
        }



        // functions to provide functionality for info on cloropleth,
        // zoom also used for dot map
        function highlightFeature(e) {
          var layer = e.target;

          layer.setStyle({
              weight: 5,
              color: '#666',
              dashArray: '',
              fillOpacity: 0.7
          });

          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
              layer.bringToFront();
          }
          info.update(layer.feature.properties);
        }

        function resetHighlight(e) {
          geojson.resetStyle(e.target);
          info.update();
        }

        function zoomToFeature(e) {
          map.fitBounds(e.target.getBounds());
          setTraces(e);
        }

        function onEachFeature(feature, layer) {
          layer.on({
              mouseover: highlightFeature,
              mouseout: resetHighlight,
              click: zoomToFeature
          });
          
        }

        // create cloropleth overlay with county line GeoJSON data
        var rates = L.geoJson(data, {style: style});

        geojson = L.geoJson(data, {
          style: style,
          onEachFeature: onEachFeature
        });

        // create info box for cloropleth map
        var info = L.control();

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update();
            return this._div;
        };

        info.update = function (props) {
            this._div.innerHTML = (props ? '<h4>' + props.NAME + '</h4>' + 
                'New cases over last week per 10,000 population: ' + '<b>' + props.perten + '</b>' + '<br /> Last confirmed COVID Case Total: ' + '<b>' + props.lastC + '</b>': 'Hover over a county');
        };

        // function to determine size of dots for dot map
        function markerSize(num) {
          return num * 120000;
        }

        // create dot map with size and color based on 'rate'
        // calculated in data.py
        locations = []
        heatLocal = []
        localArray = []
        console.log(data.features.length)
        // for (var i = 0; i < data.features.length; i++) {
        //     props = data.features[i].properties
        //     latlng = [data.features[i].properties.Lat,data.features[i].properties.Long_]    
        //     locations.push(
        //     L.circle(latlng, {
        //         stroke: false,
        //         fillOpacity: 0.55,
        //         color: getColor(data.features[i].properties.newC),
        //         fillColor: getColor((data.features[i].properties.newC)/30000),
        //         radius: markerSize((data.features[i].properties.newC)/30000)
        //         }).bindTooltip(props ? '<h4>' + props.NAME + '</h4>' + 
        //         'Increase in total cases (per day, over<br> last week, as percentage of population): ' +
        //         '<b>' + props.rateC + '</b>' + '<br /> New cases last week: ' + '<b>' + 
        //         props.newC + '</b>':
        //         'Hover over a county').openTooltip().on('click', zoomToFeature)
        //   );
        //   if (data.features[i].properties.rateC > 0.0003){
        //     localArray.push(props.rateC)
        //   }
        // }

        // create array from which to create heatLayer
        var max = Math.max(...localArray)
        var min = Math.min(...localArray)
        // console.log(localArray)
        // console.log(max)
        for (var i = 0; i < data.features.length; i++) {
          props = data.features[i].properties
          latlng = [props.Lat,props.Long_] 
          if ((((data.features[i].properties.rateC)-min)/(max-min)) > 0.1){
            heatLocal.push([latlng[0], latlng[1], (((data.features[i].properties.rateC)-min)/(max-min))])
          }
        }

        // console.log(heatLocal.length)
        var heat = L.heatLayer(heatLocal, {gradient:{0.2: 'blue', 0.3: 'lime', 0.4: 'red'}, radius:20, maxZoom:13, minOpacity:0.1});
        // create map object, appended to div named 'map' 
        // in index.html
        var map = L.map('map', {
          center: [37.8, -96],
          zoom: 4,
          layers: [lightmap]
        })

        // add info box to map
        info.addTo(map);

        // create layerGroups for the two sets of overlays
        var georates = L.layerGroup([rates,geojson]).addTo(map);
        var dots = L.layerGroup(locations);

        var voteHeat = []

        d3.csv("static/data/voteCount.csv", function(dataA) {
          // console.log(dataA[0])
          for (var i = 0; i < dataA.length; i++) {
            var county = dataA[i]
            if ((county.candidatevotes/county.totalvotes)>0.5){
            voteHeat.push([county.Lat, county.Long_, (county.candidatevotes/county.totalvotes)])
          }}
        });
        var votes = L.heatLayer(voteHeat, {gradient:{0.2: 'blue', 0.3: 'lime', 0.37: 'red'}, radius:16, maxZoom:13, minOpacity:0.1})

        var overlayMaps = {
          "Rates": georates,
          "Dots": dots,
          "Heat": heat
        };

        var voteOverlay = {
          "Votes": votes
        }

        


        var trace1 = {
          type: "scatter",
          mode: "lines",
          name: 'New Cases',
          x: [0],
          y: [0],
          line: {color: '#ff0000'}
        }

        var trace2 = {
          type: "scatter",
          mode: "lines",
          name: 'Total Deaths',
          x: [0],
          y: [0],
          line: {color: '#000000'}
        }

        var dataT = [trace1,trace2];
        console.log([dataD[dataD.length - 1], dataD[0]])

        var layout = {
          title: 'Choose county by clicking on map',
          xaxis: {
            autorange: false,
            // range: [dataD[dataD.length - 1], dataD[0]],
            range: [dataD[0], dataD[dataD.length - 1]],
            rangeselector: {buttons: [
                {
                  count: 1,
                  label: '1m',
                  step: 'month',
                  stepmode: 'backward'
                },
                {
                  count: 3,
                  label: '3m',
                  step: 'month',
                  stepmode: 'backward'
                },
                {step: 'all'}
              ]},
            rangeslider: {range: [dataD[0], dataD[dataD.length - 1]]},
              // range: [dataD[dataD.length - 1], dataD[0]]},
            type: 'date'
          },
          yaxis: {
            autorange: true,
            range: [-50, 30],
            type: 'linear'
          }
        };

        Plotly.newPlot('timeseries', dataT, layout);
        console.log(data.features[0].properties.clintonVotes)
        dataR = [{
          type: 'scatterpolar',
          r: [0,0,0],
          theta: ['Clinton','Trump','Other', 'Clinton'],
          fill: 'toself',
          line: {color:'#ff0000'}
        }]
        
        layout = {
          polar: {
            radialaxis: {
              visible: true,
              range: [0, 50000],
              autorange: true
            }
          },
          showlegend: false
        }
        
        Plotly.newPlot("radar", dataR, layout)
        
        var dataB = [
          {
            x: ['White', 'African American', 'American Indian/Alaska Native', 'Asian', 'Native Hawaiian/Pacific Islander','2 or more races'],
            y: [0,0,0,0,0,0],
            type: 'bar'
          }
        ];
        
        Plotly.newPlot('bar', dataB);
        var layoutUpdate = {
          "margin.b": 150
        };
        Plotly.relayout(bar, layoutUpdate);
        
        var dataG = [
          {
            domain: { x: [0, 1], y: [0, 1] },
            value: (0),
            title: { text: "Percent Hispanic" },
            type: "indicator",
            mode: "gauge+number",
            gauge: {
              axis: { range: [null, 100] }
            }
          }
        ];
        
        // var layout = { width: 100, height: 100, margin: { t: 0, b: 0 } };
        Plotly.newPlot('gauge', dataG, layout);

        var dataGC = [
          {
            domain: { x: [0, 1], y: [0, 1] },
            value: 0,
            title: { text: "New cases over last week <br> per 10,000 popluation" },
            type: "indicator",
            mode: "gauge+number",
            gauge: {
              bar: { color: "red" }
            // gauge: {
            //   axis: { range: [null, 100] }
            }
          }
        ];
        
        // var layout = { width: 100, height: 100, margin: { t: 0, b: 0 } };
        Plotly.newPlot('gaugeC', dataGC, layout);

      (function() {
          var control = new L.Control({position:'bottomleft'});
          control.onAdd = function(map) {
              var azoom = L.DomUtil.create('a','resetzoom');
              azoom.innerHTML = "Reset Zoom";
              L.DomEvent
                .disableClickPropagation(azoom)
                .addListener(azoom, 'click', function() {
                  map.setView(map.options.center, map.options.zoom);
                },azoom);
              return azoom;
            };
          return control;
        })
        .addTo(map);
        
      L.control.layers(baseMaps).addTo(map);
      })
    })
  })






// create controls for choosing map type and overlay
// Note: in order to allow for multiple overlays at once, 
// create only one control, place base maps first, and 
// replace 'null' with the overlay maps array
// // L.control.layers(overlayMaps,voteOverlay,{collapsed:false}).addTo(map);
// L.control.layers(baseMaps).addTo(map);

});
