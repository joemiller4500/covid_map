// Perform a GET request to the query URL
d3.json("usgeo.geojson", function(data) {
  var geojson;
  // var mapboxAccessToken = API_KEY;

// var dots
// var topPane

var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
  }

// var map = L.mapbox.map('map');
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

  // .addTo(map);

var baseMaps = {
  "Dark Map": darkmap,
  "Light Map": lightmap
};

// function zOrder(pane, layer){
//     pane.appendChild(layer.getContainer());
//     layer.setZIndex(7);
// }

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
    //   console.log(toType(layer))
    //   e.setZIndex(5);
    //   dots.setZIndex(1000000);
    //   zOrder(topPane, dots)
    //   console.log(typeof(dots));
    //   dots.bringToFront();
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


var rates = L.geoJson(data, {style: style});
// .addTo(map);

geojson = L.geoJson(data, {
  style: style,
  onEachFeature: onEachFeature
});
// .addTo(map);

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = (props ? '<h4>' + props.NAME + '</h4>' + 
        'Rate of growth for last 7 days: ' + props.rate + '<br /> Last confirmed COVID Case Total: ' + props.last + '<br /> Total cases as percentage of population: ' + props.perc
        : 'Hover over a county');
};

locations = []

function markerSize(num) {
  return num * 120000;
}

function markerOnClick(e)
{
  console.log(e)
  alert("hi. you clicked the marker at " + e.latlng);
}

console.log(data.features.length)
for (var i = 0; i < data.features.length; i++) {
    props = data.features[i].properties
  // var point = data;
  // console.log(data.features[i].properties)
  latlng = [data.features[i].properties.Lat,data.features[i].properties.Long_]    
  locations.push(
    L.circle(latlng, {
        stroke: false,
      fillOpacity: 0.55,
      // color: "white",
      // fillColor: "white",
      // radius: 50
    //   color: '#FFFFFF',
      color: getColor(data.features[i].properties.rate),
      fillColor: getColor(7*(data.features[i].properties.rate)),
      radius: markerSize(20*(data.features[i].properties.rate))
    //   style: styleA,
    //   onEachFeature: onEachFeature
    }).bindTooltip(props ? '<h4>' + props.NAME + '</h4>' + 
    'Rate of growth for last 7 days: ' + props.rate + '<br /> Last confirmed COVID Case Total: ' + props.last + '<br /> Total cases as percentage of population: ' + props.perc
    : 'Hover over a county').openTooltip().on('click', zoomToFeature)
  );
}


var map = L.map('map', {
  center: [37.8, -96],
  zoom: 4,
  layers: [darkmap]
})
// console.log(dots)


var georates = L.layerGroup([rates,geojson]).addTo(map);

var dots = L.layerGroup(locations);

var overlayMaps = {
  "Rates": georates,
  "Dots": dots
};
// .setView([37.8, -96], 4);

info.addTo(map);

var legend = L.control({ position: "bottomright" });

L.control.layers(overlayMaps,null,{collapsed:false}).addTo(map);
  
L.control.layers(baseMaps).addTo(map);

// var topPane = map.createPane('leaflet-top-pane', map.getPanes().mapPane);
// console.log(toType(georates))
// topPane.appendChild(dots.getContainer());
// dots.setZIndex(7);


// legend.addTo(map);

});
