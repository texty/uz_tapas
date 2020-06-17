/**
 * Created by yevheniia on 26.05.20.
 */
var map = new maptalks.Map('map',{
    center :  [31, 49],
    zoom   :  6.5,
    attributionControl : {
        'content' : '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    baseLayer : new maptalks.TileLayer('tile',{
        'urlTemplate' : '',
        'subdomains': ['a','b','c','d']
    }),
    minZoom: 6,
    maxZoom: 9,
    // maxPitch: 0,
    // pitch: 0,
    scrollWheelZoom : false
});


//https://api.mapbox.com/styles/v1/evgeshadrozdova/cjhxm4p2f1ab72spjf7im1b7a/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXZnZXNoYWRyb3pkb3ZhIiwiYSI6ImNqMjZuaGpkYTAwMXAzMm5zdGVvZ2c0OHYifQ.s8MMs2wW15ZyUfDhTS_cdQ //mapbox
//https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png
// https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png
// https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png

Promise.all([
    d3.csv("data/busiest_directions.csv"),
    d3.json("data/UKR_adm1.json"),
    d3.csv("data/map_labels.csv")
]).then(function(data) {


    //add geojson with admin boundaries
    const layer = new maptalks.VectorLayer('v', data[1]).setStyle({ 'symbol' : getSymbol('#FFFFDA') }).addTo(map);

    function getSymbol(color) {
        return [
            {
                'polygonFill': color,
                'polygonOpacity': 1,
                'lineColor': 'silver',
                'lineWidth': 1,
                'lineOpacity': 0.7
            }
        ];
    }




    //add animated points
    var e3Layer = new maptalks.E3Layer('e3', getECOption())
        .addTo(map);

    function getECOption() {

        var geoCoordMap = {};

        data[0].forEach(function (d){
            geoCoordMap[d.sender] = [+d.lon_sender, +d.lat_sender];
            geoCoordMap[d.receiver] = [+d.lon_receiver, +d.lat_receiver];
        });

        var SHData = [];
        var GZData = [];

        const gzk_cluster_yes = data[0].filter(function(d){ return d.gzk_cluster === "yes"});
        const gzk_cluster_no = data[0].filter(function(d){ return d.gzk_cluster === "no"});

        gzk_cluster_yes.forEach(function(d,i){
            if(i < 50) {
                SHData.push([{name: d.sender, value: 80}, {name: d.receiver, value: 10}]);
            }
        });

        gzk_cluster_no.forEach(function(d,i){
            if(i < 80) {
                GZData.push([{name: d.sender}, {name: d.receiver, value: 10}]);
            }
        });


        var planePath ='path://M10 10';

        var convertData = function (data) {
            var res = [];
            for (var i = 0; i < data.length; i++) {
                var dataItem = data[i];
                var fromCoord = geoCoordMap[dataItem[0].name];
                var toCoord = geoCoordMap[dataItem[1].name];
                if (fromCoord && toCoord) {
                    res.push({
                        fromName: dataItem[0].name,
                        toName: dataItem[1].name,
                        coords: [fromCoord, toCoord]
                        // lineStyle: {
                        //     normal: {
                        //         width: dataItem[1].value
                        //     }
                        // }
                    });
                }
            }
            return res;
        };

        // var color = ['#a6c84c', '#E78B8A', '#46bee9'];
        var color = ['rgba(29, 17, 148, 0.8)', 'rgba(29, 17, 148, 0.8)'];

        var series = [];
        [
            // ['станція АВДІЇВКА', BJData], ['станція АРОМАТНА', SHData], ['станція БЕРЕГОВА', GZData]].forEach(
            ['1', SHData], ['1',  GZData]].forEach(
            function (item, i) {

                series.push(
                    {
                        name: item[0],
                        type: 'lines',
                        zlevel: 2,
                        effect: {
                            show: true,
                            period: 5,
                            //constantSpeed: 50,
                            // constantSpeed: +item[0],
                            trailLength: 0.3,
                            // color: {
                            //     type: 'linear',
                            //     x: 0,
                            //     y: 0,
                            //     x2: 0,
                            //     y2: 1,
                            //     colorStops: [{
                            //         offset: 0, color: 'green' // color at 0% position
                            //     }, {
                            //         offset: 1, color: 'red' // color at 100% position
                            //     }],
                            //     global: false
                            // },
                            color: "#4A4453",
                            // opacity: 1,
                            symbolSize: 3
                        },
                        lineStyle: {
                            normal: {
                                color: {
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 0,
                                    y2: 1,
                                    colorStops: [{
                                        offset: 0, color: 'rgba(29, 17, 148, 1)' // color at 0% position
                                    }, {
                                        offset: 1, color: '#E78B8A' // color at 100% position
                                    }],
                                    global: false
                                },
                                // color: "#1D1194",
                                width: 2,
                                curveness: 0.4,
                                opacity: 0.5
                            }
                        },
                        data: convertData(item[1])
                    },
                    // {
                    //     name: item[0],
                    //     type: 'lines',
                    //     zlevel: 1,
                    //     effect: {
                    //         show: true,
                    //         // period: 5,
                    //         constantSpeed: 50,
                    //         // constantSpeed: +item[0],
                    //         trailLength: 0,
                    //         symbol: planePath,
                    //         symbolSize: 5
                    //     },
                    //     lineStyle: {
                    //         normal: {
                    //             color: {
                    //                 type: 'linear',
                    //                 x: 0,
                    //                 y: 0,
                    //                 x2: 0,
                    //                 y2: 1,
                    //                 colorStops: [{
                    //                     offset: 0, color: 'rgba(29, 17, 148, 0.8)' // color at 0% position
                    //                 }, {
                    //                     offset: 1, color: 'rgba(29, 17, 148, 0.2)' // color at 100% position
                    //                 }],
                    //                 global: false
                    //             },
                    //             //color: "#1D1194",
                    //             width: 3,
                    //             opacity: 1,
                    //             curveness: 0.4
                    //         }
                    //     },
                    //     data: convertData(item[1])
                    // },
                    {
                        name: item[0],
                        type: 'effectScatter',
                        coordinateSystem: 'geo',
                        zlevel: 2,
                        // rippleEffect: {
                        //     brushType: 'circle'
                        // },
                        label: {
                            normal: {
                                show: true,
                                position: 'right',
                                formatter: '{b}'
                            }
                        },
                        symbolSize: function (val) {
                            return val[2] / 8;
                        },
                        itemStyle: {
                            normal: {
                                color: color[i]
                            }
                        },
                        data: item[1].map(function (dataItem) {
                            // console.log(dataItem[1].value);
                            return {
                                // name: dataItem[1].name,
                                value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value])
                            };
                        })
                    }
                );

            });


        return {
            series: series
        };
    }

    var label_layer = new maptalks.VectorLayer('vector').addTo(map);

    data[2].forEach(function(d){
        d.Latitude = +d.Latitude;
        d.Longitude = +d.Longitude;

        new maptalks.Marker(
            [d.Longitude, d.Latitude], {
                'properties': {
                    'name': ''
                },
                'symbol': {
                    'textFaceName': 'sans-serif',
                    'textName': d.place, //value from name in geometry's properties
                    'textWeight': 'normal', //'bold', 'bolder'
                    'textStyle': 'normal', //'italic', 'oblique'
                    'textSize': 12,
                    'textFont': null, //same as CanvasRenderingContext2D.font, override textName, textWeight and textStyle
                    'textFill': '#34495e',
                    'textOpacity': 1,
                    'textHaloFill': '#FFFFDA',
                    'textHaloRadius': 5,
                    'textWrapWidth': null,
                    'textWrapCharacter': '\n',
                    'textLineSpacing': 0,

                    'textDx': 0,
                    'textDy': 0,

                    'textHorizontalAlignment': 'middle', //left | middle | right | auto
                    'textVerticalAlignment': 'middle', // top | middle | bottom | auto
                    'textAlign': 'center' //left | right | center | auto
                }
            }
        ).addTo(label_layer);
    });

    // setTimeout(function(){ map.removeLayer(e3Layer);}, 6200);


    d3.select("button").on("click", function(){
        map.removeLayer(e3Layer);
    });

});

