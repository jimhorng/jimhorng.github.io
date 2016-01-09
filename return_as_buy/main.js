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
    //google spreadsheet id
    key: "1NoZDaQLH_1cPO77GRcP4NG5Ll0CzsgMNGzKOBK0h3dk",
    callback: parseData,
    simpleSheet: true
});

// draw chart
google.charts.load('current', {packages: ['corechart']});
google.charts.setOnLoadCallback(function () {
    drawBrandRanking();
    drawCountyRanking();
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
                       "<br/>秒退金額: NT$" + return_data.refund +
                       "<br/>秒退次數: " + return_data.count);
        L.marker(coordinate, {
            icon: L.divIcon({
                className: 'text-labels',   // Set class for CSS styling
                html: return_data.refund,
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
        document.getElementById("total_refund").innerHTML = "NT$" + total_refund_norm + "萬/" +
            + total_data.total_count + "次";
    }
}

function parseData(data, tabletop) {
    displayMapInfo(tabletop.sheets("summary").all());
    displayTotal(tabletop.sheets("total").all());
}

function drawBrandRanking() {
      var queryString = encodeURIComponent('SELECT I,C ORDER BY C DESC LIMIT 10');
      var query = new google.visualization.Query(
          'https://docs.google.com/spreadsheets/d/1NoZDaQLH_1cPO77GRcP4NG5Ll0CzsgMNGzKOBK0h3dk/gviz/tq?sheet=summary&headers=1&tq=' + queryString);
      query.send(handleBrandRankingResponse);
    }

function handleBrandRankingResponse(response) {
    if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
    }

    var data = response.getDataTable();
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_brand_div'));
    chart.draw(data,
        { title: "分店排行",
          height: 400,
          legend: { position: "none" },
          colors:['purple'] });
}

function drawCountyRanking() {
      var queryString = encodeURIComponent('SELECT H,SUM(C) GROUP BY H ORDER BY SUM(C) DESC LIMIT 10');
      var query = new google.visualization.Query(
          'https://docs.google.com/spreadsheets/d/1NoZDaQLH_1cPO77GRcP4NG5Ll0CzsgMNGzKOBK0h3dk/gviz/tq?sheet=summary&headers=1&tq=' + queryString);
      query.send(handleCountyRankingResponse);
    }

function handleCountyRankingResponse(response) {
    if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
    }

    var data = response.getDataTable();
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_county_div'));
    chart.draw(data,
        { title: "縣市排行",
          height: 400,
          legend: { position: "none" },
          colors:['green'] });
}
