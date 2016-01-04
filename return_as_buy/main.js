'use strict';
var CartoDB_DarkMatter = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    minZoom: 8,
    maxZoom: 17
});

// Load and initialize leaflet map.
var map = L.map('map').setView([25.046374, 121.517896], 12);
CartoDB_DarkMatter.addTo(map);
map._initPathRoot();

Tabletop.init({
    key: "1NoZDaQLH_1cPO77GRcP4NG5Ll0CzsgMNGzKOBK0h3dk", //google spreadsheet id
    callback: displayMapInfo,
    simpleSheet: true
});

function displayMapInfo(data, tabletop) {
    var summary_data = tabletop.sheets("summary").all();
    for (var i in summary_data) {
        var return_data = summary_data[i]; //getting e row from table
        var coordinate = [return_data.latitude, return_data.longitude];
        var place_name = return_data.shop_name + "_" + return_data.branch_name
        var radius = (return_data.size - 5) * 50
        L.circle(coordinate, radius, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5
        })
            .addTo(map)
            .bindPopup(place_name +
                       "<br/>秒退金額: $" + return_data.refund +
                       "<br/>秒退次數: " + return_data.count);
        L.marker(coordinate, {
            icon: L.divIcon({
                className: 'text-labels',   // Set class for CSS styling
                html: "$" + return_data.refund,
                iconSize: 50
            }),
               zIndexOffset: 1000     // Make appear above other map features
        })
            .addTo(map);
    }
}
