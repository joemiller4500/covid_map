require('dotenv').config();
console.log(process.env.API_KEY)
// insert last update into HTML 
function fetchHeader(url, wch) {
  try {
      var req=new XMLHttpRequest();
      req.open("HEAD", url, false);
      req.send(null);
      if(req.status== 200){
          return req.getResponseHeader(wch);
      }
      else return false;
  } catch(er) {
      return er.message;
  }
}
var update = "Last update: " + fetchHeader('static/data/usgeo.geojson','Last-Modified');
var element = document.getElementById("update"); 
          element.innerHTML = update;
// import GeoJSON file created in data.py
d3.json("static/data/usgeo.geojson", function(data) {
  var geojson;
  d3.json("static/data/dates.json", function(dataD) {
    d3.json("static/data/confirmedTS.json", function(dataE){
      d3.json("static/data/deathsTS.json", function(dataF){
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
          return d > 70 ? '#67000d' :
                d > 60  ? '#a50f15' :
                d > 50  ? '#cb181d' :
                d > 40  ? '#ef3b2c' :
                d > 30   ? '#fb6a4a' :
                d > 20   ? '#fc9272' :
                d > 10   ? '#fcbba1' :
                d > 5   ? '#fee0d2' :
                d > 0      ? '#fff5f0':
                d = 'null'   ? '#ccffcc' :
                                '#fff5f0'
        }

        // function for cloropleth style, color based on 'perc' 
        // calculated in data.py
        function style(feature) {
          return {
              fillColor: getColor((feature.properties.perten)),
              weight: 1,
              opacity: 1,
              color: 'white',
              dashArray: '3',
              fillOpacity: 0.45
          };
        }

        // function to load new cases timeseries from FIPS value
        function getTimeseriesC(fips) {
          return dataE.timeseries[fips].map(String)
        }

        // function to load total deaths timeseries from FIPS value
        function getTimeseriesD(fips) {
          return dataF.timeseries[fips].map(String)
        }

        // function to update line graph
        function setLineTraces(feature){
          var fips = feature.target.feature.properties.FIPS
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
  
          var layout = {
            title: title ,
            xaxis: {
              autorange: false,
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
              type: 'date'
            },
            yaxis: {
              autorange: true,
              range: [-50, 30],
              type: 'linear'
            }
          };
          Plotly.react('timeseries', dataT, layout);
        }

        // function to update Radar graph
        function setRadarTraces(feature){
          if (feature.target.feature.properties.clintonVotes > feature.target.feature.properties.trumpVotes){
            var col = {color: '#0000ff'}
          }
          else{
            var col = {color: '#ff0000'}
          }
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

        // function to update bar graph
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
        }

        // function to update lower guage chart
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
          Plotly.react('gauge', dataG, layout);
        }

        // function to update upper guage chart
        function setGaugeCTrace(feature){
          var fips = feature.target.feature.properties.FIPS
          
          var dataGC = [
            {
              domain: { x: [0, 1], y: [0, 1] },
              value: (feature.target.feature.properties.perten),
              title: { text: "New cases over last week <br> per 10,000 popluation" },
              type: "indicator",
              mode: "gauge+number",
              gauge: {
                bar: { color: getColor(feature.target.feature.properties.perten) },
                axis: { range: [null, 100] }
              }
            }
          ];
          Plotly.react('gaugeC', dataGC, layout);
        }

        // function to call all Plotly updates
        function setTraces(feature) {
          setLineTraces(feature)
          setRadarTraces(feature)
          setBarTrace(feature)
          setGaugeTrace(feature)
          setGaugeCTrace(feature)
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
                'New cases reported over last week: ' + '<b>' + props.newC + '</b>' + '<br /> Last confirmed COVID Case Total: ' + '<b>' + props.lastC + '</b>': 'Hover over a county');
        };

        // // function to determine size of dots for dot map
        // function markerSize(num) {
        //   return num * 120000;
        // }

        // create dot map with size and color based on 'rate'
        // calculated in data.py
        locations = []
        heatLocal = []
        localArray = []
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
        for (var i = 0; i < data.features.length; i++) {
          props = data.features[i].properties
          latlng = [props.Lat,props.Long_] 
          if ((((data.features[i].properties.rateC)-min)/(max-min)) > 0.1){
            heatLocal.push([latlng[0], latlng[1], (((data.features[i].properties.rateC)-min)/(max-min))])
          }
        }

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

        L.layerGroup([rates,geojson]).addTo(map);
        // Note: The following commented code comes from an earlier draft
        // of this site and provides functionality for a heatmap of voting
        
        // create layerGroups for the two sets of overlays
        // var dots = L.layerGroup(locations);

        // var voteHeat = []

        // d3.csv("static/data/voteCount.csv", function(dataA) {
        //   for (var i = 0; i < dataA.length; i++) {
        //     var county = dataA[i]
        //     if ((county.candidatevotes/county.totalvotes)>0.5){
        //     voteHeat.push([county.Lat, county.Long_, (county.candidatevotes/county.totalvotes)])
        //   }}
        // });
        // var votes = L.heatLayer(voteHeat, {gradient:{0.2: 'blue', 0.3: 'lime', 0.37: 'red'}, radius:16, maxZoom:13, minOpacity:0.1})

        // var overlayMaps = {
        //   "Rates": georates,
        //   "Dots": dots,
        //   "Heat": heat
        // };

        // var voteOverlay = {
        //   "Votes": votes
        // }

        

        // create Plotly charts to be updated with info upon 
        // county selection
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

        var layout = {
          title: 'Choose county by clicking on map',
          xaxis: {
            autorange: false,
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
            type: 'date'
          },
          yaxis: {
            autorange: true,
            range: [-50, 30],
            type: 'linear'
          }
        };

        Plotly.newPlot('timeseries', dataT, layout);
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
        Plotly.newPlot('gauge', dataG, layout);

        var dataGC = [
          {
            domain: { x: [0, 1], y: [0, 1] },
            value: 0,
            title: { text: "New cases over last week <br> per 10,000 popluation" },
            type: "indicator",
            mode: "gauge+number",
            gauge: {
              bar: { color: "red" },
              axis: { range: [null, 100] }
            }
          }
        ];
        Plotly.newPlot('gaugeC', dataGC, layout);

      L.control.layers(baseMaps).addTo(map);
      })
    })
  })






// Logic for adding multiple overlay maps, if we kept dots or heatmap
// L.control.layers(overlayMaps,voteOverlay,{collapsed:false}).addTo(map);
// L.control.layers(baseMaps).addTo(map);

});
