'use strict';
var CartoDB_DarkMatter = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '<a href="https://goo.gl/f9znBF">資料來源</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    minZoom: 7,
    maxZoom: 17
});

// Load and initialize leaflet map.
var map = L.map('map', { 'messagebox': true }).setView([23.9199416, 120.9895349], 7);
CartoDB_DarkMatter.addTo(map);
map._initPathRoot();
map.messagebox.options.timeout = 9999999999;
map.messagebox.show( "單位:NT$" );

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

getAndDisplayElapsedDays();

function getAndDisplayElapsedDays() {
    var msecPerMinute = 1000 * 60;
    var msecPerHour = msecPerMinute * 60;
    var msecPerDay = msecPerHour * 24;
    var now = new Date();
    var start = new Date("12/9/2015");
    var elapsedDays = Math.floor((now.getTime() - start.getTime()) / msecPerDay );
    document.getElementById("elapsed_days").innerHTML = elapsedDays;
}

function displayMapInfo(summary_data) {
    var markers = new L.MarkerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: false,
        disableClusteringAtZoom: 13,
        iconCreateFunction: function (cluster) {
            var childMarkers = cluster.getAllChildMarkers();
            var refundClustered = 0;
            for (var i = 0; i < childMarkers.length; i++) {
                refundClustered += childMarkers[i].amount;
            }
            return createMarkerIcon("myCircleCluster", refundClustered);
        }
    });
    for (var i in summary_data) {
        var return_data = summary_data[i]; //getting e row from table
        var coordinate = [return_data.latitude, return_data.longitude];
        var place_name = return_data.shop_name + "_" + return_data.branch_name;
        var refund = parseInt(return_data.refund);
        var refundMarker = L.marker(coordinate, {
            icon: createMarkerIcon("myCircleMarker", refund)
        })
            .bindPopup(place_name +
                "<br/>秒退金額: NT$" + return_data.refund +
                "<br/>秒退次數: " + return_data.count);
        refundMarker.amount = refund
        markers.addLayer(refundMarker);
    }
    map.addLayer(markers);
}

function displaySummary(total_datas) {
    for (var i in total_datas) {
        var total_data = total_datas[i]; //getting e row from table
        var total_refund_in_ten_thousands = (total_data.total_refund / 10000)
        var total_refund_norm = total_refund_in_ten_thousands.toFixed(0)
        // total refund
        document.getElementById("total_refund").innerHTML = "NT$ " + total_refund_norm + " 萬 / " +
            total_data.total_count + " 次";
        // 1201 asset
        var assetObj = document.getElementById("asset_1201");
        var percentage = ((total_data.asset_1201_now / total_data.asset_1201_20143Q ) * 100).toFixed(0);
        assetObj.innerHTML = (total_data.asset_1201_now * 10000)+" / "+
            (total_data.asset_1201_20143Q * 10000)+" (萬)";
        assetObj.setAttribute("aria-valuenow", percentage);
        assetObj.setAttribute("style", "width:"+percentage+"%");
        // stock percentage
        var stockPercentObj = document.getElementById("stock_percent");
        percentage = parseInt(total_data.ds_stock_percent)
        stockPercentObj.innerHTML = percentage + " %";
        stockPercentObj.setAttribute("aria-valuenow", percentage);
        stockPercentObj.setAttribute("style", "width:"+percentage+"%");
        // chair percentage
        var stockChairObj = document.getElementById("stock_chair");
        percentage = ((total_data.ds_chair / total_data.total_chair) * 100 ).toFixed(1);
        stockChairObj.innerHTML = total_data.ds_chair + " / " + total_data.total_chair;
        stockChairObj.setAttribute("aria-valuenow", percentage);
        stockChairObj.setAttribute("style", "width:"+percentage+"%");
        // stock price
        var stockPriceObj = document.getElementById("stock_price");
        percentage = ((total_data.stock_price_now / total_data.stock_price_2014_10_3) * 100 ).toFixed(1);
        stockPriceObj.innerHTML = total_data.stock_price_now + " / " + total_data.stock_price_2014_10_3;
        stockPriceObj.setAttribute("aria-valuenow", percentage);
        stockPriceObj.setAttribute("style", "width:"+percentage+"%");
    }
}

function parseData(data, tabletop) {
    displayMapInfo(tabletop.sheets("summary").all());
    displaySummary(tabletop.sheets("total").all());
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

function createMarkerIcon(style, refund) {
    var size = Math.log(refund) * 5
    var refundIn10K = (Math.ceil(refund / 10000 * 10) / 10).toFixed(1)
    return L.divIcon({
        html: "<span class='markerSpan'>" + refundIn10K + "萬</span>",
        className: "myCircleBase " + style,
        iconSize: L.point(size, size) });
}
