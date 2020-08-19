var default_zoom = window.innerWidth > 800 ? 6.5 : 5.5;


var map = new maptalks.Map('map', {
    center: [31, 49],
    zoom: default_zoom,
    zoomControl: {
        'position': 'top-left',
        'slider': false,
        'zoomLevel': false
    },
    baseLayer: new maptalks.TileLayer('base', {
        urlTemplate: '',
        subdomains: ['a', 'b', 'c', 'd'],
        attribution: ''
    }),
    minZoom: 5,
    maxZoom: 10,
    maxPitch: 0,
    pitch: 0,
    scrollWheelZoom : false
});

map.setZoom(default_zoom);


Promise.all([
    d3.csv("data/busiest_directions.csv"),
    d3.csv("data/busiest_directions_labels.csv"),
    d3.json("data/UKR_adm1.json")
]).then(function(data) {

    new maptalks.VectorLayer('v', data[2]).setStyle({ 'symbol' : getSymbol('#E6EBE6') }).addTo(map);

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

    var layer = new maptalks.VectorLayer('vector').addTo(map);



    data[0].forEach(function (d) {

        console.log(d.sender);
        console.log(d.receiver);
        d.lat_sender = +d.lat_sender;
        d.lon_sender = +d.lon_sender;
        d.lat_receiver = +d.lat_receiver;
        d.lon_receiver = +d.lon_receiver;
        d.no_wagons = +d.no_wagons;


        // blue circle
        var src = new maptalks.Marker(
            [d.lon_sender, d.lat_sender], {
                symbol: {
                    'markerType': 'ellipse',
                    'markerFill': '#FF3800',
                    'markerFillOpacity': 0.7,
                    'markerLineColor': '#fff',
                    'markerLineWidth': 3,
                    'markerWidth': 13,
                    'markerHeight': 13
                }
            }
        );

        // red circle
        var dst = new maptalks.Marker(
            [d.lon_receiver, d.lat_receiver], {
                'symbol': {
                    'markerType': 'ellipse',
                    'markerFill': '#5B5AFF',
                    'markerFillOpacity': 0.8,
                    'markerLineColor': '#fff',
                    'markerLineWidth': 3,
                    'markerWidth': 13,
                    'markerHeight': 13
                }
            }
        );

        var src_tip = new maptalks.ui.ToolTip(d.sender);
        var dst_tip = new maptalks.ui.ToolTip(d.receiver);
        src_tip.addTo(src);
        dst_tip.addTo(dst);


        // Arc Connector Line
        var line = new maptalks.ArcConnectorLine(src, dst, {
            arcDegree: 70,
            showOn: 'always',
            symbol: {
                'lineColor' : {
                    'type' : 'linear',
                    'colorStops' : [
                        [0.00, '#FF3800'],
                        [0.5, '#FF380033'],                        
                        [1.00, '#FF380005']
                    ]
                },
                lineWidth: d.no_wagons/4000
                // lineWidth: 2
            }
        });

        layer.addGeometry(src, dst, line);



    });

    var label_layer = new maptalks.VectorLayer('label').addTo(map);

    data[1].forEach(function(d){
        d.Latitude = +d.Latitude;
        d.Longitude = +d.Longitude;

        var marker = new maptalks.Marker(
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
                    'textHaloFill': '#E6EBE6',
                    'textHaloRadius': 3,
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

});






// // initialize the scrollama
//     var container = d3.select('#scroll');
//     var graphic = container.select('.scroll__graphic');
//     var chart = graphic.select('#map');
//     var text = container.select('.scroll__text');
//     var step = text.selectAll('.step');
//     var scroller = scrollama();
//
//
//
// // generic window resize listener event
// function handleResize() {
//     // 1. update height of step elements
//     var stepHeight = Math.floor(window.innerHeight * 0.5);
//     step.style('height', stepHeight + 'px');
//
//     // 2. update width/height of graphic element
//     var bodyWidth = d3.select('body').node().offsetWidth;
//     var textWidth = text.node().offsetWidth;
//
//     var graphicWidth = bodyWidth - textWidth;
//
//     var chartMargin = 32;
//     var chartWidth = graphic.node().offsetWidth - chartMargin;
//
//     // 3. tell scrollama to update new element dimensions
//     scroller.resize();
// }
//
// // scrollama event handlers
// function handleStepEnter(r) {
//
//     //scroll down
//     if(r.index === 0 && r.direction === "down") { }
//
//     if(r.index === 1) { }
//
//     if(r.index === 2 && r.direction === "down") { }
//
//     if(r.index === 2 && r.direction === "up") {     }
//
//     if(r.index === 7) {}
// }
//
//
// function handleContainerEnter(response) {
//     // response = { direction }
// }
//
// function handleContainerExit(response) {
//     // response = { direction }
// }
//
//
//
// function init() {
//     handleResize();
//     scroller.setup({
//         container: '#scroll',
//         graphic: '.scroll__graphic',
//         text: '.scroll__text',
//         step: '.scroll__text .step',
//         offset: 0.9,
//         debug: false
//     })
//         .onStepEnter(handleStepEnter)
//         .onContainerEnter(handleContainerEnter)
//         .onContainerExit(handleContainerExit);
//
//     window.addEventListener('resize', handleResize);
// }
//
// init();
//
//





