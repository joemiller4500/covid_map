// import GeoJSON file created in data.py
d3.json("usgeo.geojson", function(data) {
  var geojson;

// function used to output specific object type during
// testing, taken from Angus Croll
var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
  }

// load background layers from mapbox via Leaflet
var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "dark-v10",
  accessToken: API_KEY
});
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
});

var baseMaps = {
  "Dark Map": darkmap,
  "Light Map": lightmap
};

// function to give color to features on map
function getColor(d) {
  return d > 0.09 ? '#67000d' :
         d > 0.08  ? '#a50f15' :
         d > 0.07  ? '#cb181d' :
         d > 0.06  ? '#ef3b2c' :
         d > 0.05   ? '#fb6a4a' :
         d > 0.04   ? '#fc9272' :
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
      fillColor: getColor(feature.properties.perc),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.45
  };
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
        'Total cases over last week <br> (per day, as percentage of total cases reported): ' + '<b>' + props.perc + '</b>' + '<br /> Last confirmed COVID Case Total: ' + '<b>' + props.last + '</b>': 'Hover over a county');
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
for (var i = 0; i < data.features.length; i++) {
    props = data.features[i].properties
    latlng = [data.features[i].properties.Lat,data.features[i].properties.Long_]    
    locations.push(
    L.circle(latlng, {
        stroke: false,
        fillOpacity: 0.55,
        color: getColor(data.features[i].properties.new),
        fillColor: getColor((data.features[i].properties.new)/30000),
        radius: markerSize((data.features[i].properties.new)/30000)
        }).bindTooltip(props ? '<h4>' + props.NAME + '</h4>' + 
        'Increase in total cases (per day, over<br> last week, as percentage of population): ' +
        '<b>' + props.rate + '</b>' + '<br /> New cases last week: ' + '<b>' + 
        props.new + '</b>':
        'Hover over a county').openTooltip().on('click', zoomToFeature)
  );
  if (data.features[i].properties.rate > 0.0003){
    localArray.push(props.rate)
  }
}

// create array from which to create heatLayer
var max = Math.max(...localArray)
var min = Math.min(...localArray)
console.log(localArray)
console.log(max)
for (var i = 0; i < data.features.length; i++) {
  props = data.features[i].properties
  latlng = [props.Lat,props.Long_] 
  if ((((data.features[i].properties.rate)-min)/(max-min)) > 0.1){
    heatLocal.push([latlng[0], latlng[1], (((data.features[i].properties.rate)-min)/(max-min))])
  }
}

console.log(heatLocal.length)
var heat = L.heatLayer(heatLocal, {gradient:{0.2: 'blue', 0.3: 'lime', 0.4: 'red'}, radius:20, maxZoom:13, minOpacity:0.1});
// create map object, appended to div named 'map' 
// in index.html
var map = L.map('map', {
  center: [37.8, -96],
  zoom: 4,
  layers: [darkmap]
})

// add info box to map
info.addTo(map);

// create layerGroups for the two sets of overlays
var georates = L.layerGroup([rates,geojson]).addTo(map);
var dots = L.layerGroup(locations);

var voteHeat = []

d3.csv("voteCount.csv", function(dataA) {
  console.log(dataA[0])
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

// create controls for choosing map type and overlay
// Note: in order to allow for multiple overlays at once, 
// create only one control, place base maps first, and 
// replace 'null' with the overlay maps array
L.control.layers(overlayMaps,voteOverlay,{collapsed:false}).addTo(map);
L.control.layers(baseMaps).addTo(map);

});
