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
    callback: parseData,
    simpleSheet: true
});

function displayMapInfo(summary_data) {
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

function displayTotal(total_datas) {
    for (var i in total_datas) {
        var total_data = total_datas[i]; //getting e row from table
        var total_refund_in_ten_thousands = (total_data.total_refund / 10000)
        var total_refund_norm = total_refund_in_ten_thousands.toFixed(0)
        document.getElementById("total_refund").innerHTML = "總秒退: $" + total_refund_norm + "萬";
        document.getElementById("total_count").innerHTML = "總次數: " + total_data.total_count;
    }
}

function parseData(data, tabletop) {
    displayMapInfo(tabletop.sheets("summary").all());
    displayTotal(tabletop.sheets("total").all());
}
