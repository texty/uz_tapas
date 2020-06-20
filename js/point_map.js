/**
 * Created by yevheniia on 20.06.20.
 */

var bigest_stations = new maptalks.Map('bigestst', {
    center :  [31, 48],
    zoom   :  default_zoom,
    attributionControl : {
        'content' : '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    baseLayer : new maptalks.TileLayer('tile',{
        'urlTemplate' : '',
        'subdomains': ['a','b','c','d']
    }),
    // zoomControl: {
    //     'position': 'top-left',
    //     'slider': false,
    //     'zoomLevel': false
    // },
    layers : [
        new maptalks.VectorLayer('v')
    ],
    minZoom: 5,
    maxZoom: 10,
    maxPitch: 0,
    pitch: 0,
    scrollWheelZoom : false
});


Promise.all([
    d3.json("data/UKR_adm1.json"), //0
    d3.csv("data/map_labels.csv"), //1

    d3.csv("data/top_senders_coal.csv"),
    d3.csv("data/top_senders_grain.csv"),
    d3.csv("data/top_senders_ore.csv"),
    d3.csv("data/top_senders_stone.csv")




]).then(function(data) {

    new maptalks.VectorLayer('admin', data[0]).setStyle({ 'symbol' : getSymbol('#FFFFDA') }).addTo(bigest_stations);

    //coal - map2
    const coal_senders = new maptalks.VectorLayer('coal').addTo(bigest_stations);
    const grain_senders = new maptalks.VectorLayer('grain').addTo(bigest_stations);
    const ore_senders = new maptalks.VectorLayer('ore').addTo(bigest_stations);
    const stone_senders = new maptalks.VectorLayer('stone').addTo(bigest_stations);

    const linesLayer = new maptalks.VectorLayer('lines', {
        'opacity': 0.8
    }).addTo(bigest_stations);



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



    function drawLayer(df, target_layer, type) {

        df.forEach(function (d) {
            d.lat_sender = +d.lat_sender;
            d.lon_sender = +d.lon_sender;
            d.lat_receiver = +d.lat_receiver;
            d.lon_receiver = +d.lon_receiver;
            d.no_wagons = +d.no_wagons;
            d.type = type;
        });


        var nested = d3.nest()
            .key(function(d){ return d.sender})
            .entries(df);

        console.log(nested);

        //колір швидкості від мін до макс.
        var color = d3.scaleOrdinal()
            .domain(["coal", "grain", "ore", "stone"])
            .range(["#000000", "orange", "#FF9B97", "#000069"]);


        // максимальна к-ть вагонів для line width domain
        var maxWag = d3.max(df, function(d){ return +d.no_wagons });

        var scaleRadius = d3.scaleLinear()
            .domain([0, maxWag])
            .range([5, 25]);

        var scaleLineWidth = d3.scaleLinear()
            .domain([0, maxWag])
            .range([1, 4]);



        nested.forEach(function (d) {

            let radius = scaleRadius(d.values[0].no_wagons);
            let lineWidth = scaleLineWidth(d.values[0].no_wagons);
            // blue circle
            var src = new maptalks.Marker(
                [d.values[0].lon_sender, d.values[0].lat_sender], {
                    symbol: {
                        'markerType': 'ellipse',
                        'markerFill': color(type),
                        'markerFillOpacity': 0.8,
                        'markerLineColor': "white",
                        'markerLineWidth': 0.8,
                        'markerWidth': radius,
                        'markerHeight': radius
                    }
                }
            );


            addListen();

            function addListen() {
                //mousemove and touchmove is annoying, so not listening to it.
                src.on('click', function(){
                    linesLayer.forEach(function(l){
                        l.remove();
                    });

                    d.values.forEach(function(t){
                        var dst = new maptalks.Marker(
                            [t.lon_receiver, t.lat_receiver], {
                                'symbol': {
                                    'markerType': 'ellipse',
                                    'markerFill': '#E78B8A',
                                    'markerFillOpacity': 0.9,
                                    'markerLineColor': color(type),
                                    'markerLineWidth': 3,
                                    'markerWidth': 0,
                                    'markerHeight': 0
                                }
                            }
                        );



                        var line = new maptalks.ArcConnectorLine(src, dst, {
                            arcDegree: 90,
                            showOn: 'always',
                            arrowStyle : 'classic',
                            arrowPlacement: 'vertex-last', //vertex-first, vertex-last, vertex-firstlast, point
                            symbol: {
                                'fillColor': color(type),
                                'fillOpacity': 1,
                                'lineColor': color(type),
                                'lineWidth': lineWidth,
                                'lineOpacity': 1
                            }
                        });

                        linesLayer.addGeometry(line);
                    });





                });
            }


            target_layer.addGeometry(src);


        });
    }




    drawLayer(data[2], coal_senders, "coal");
    drawLayer(data[3], grain_senders, "grain");
    drawLayer(data[4], ore_senders, "ore");
    drawLayer(data[5], stone_senders, "stone");


    d3.selectAll(".toggle_senders").on("click", function(){
        linesLayer.forEach(function(l){
            l.remove();
        });
        let layer_to_show = d3.select(this).attr("show");
        coal_senders.hide();
        grain_senders.hide();
        ore_senders.hide();
        stone_senders.hide();
        eval(layer_to_show).show();
    });



    //map labels
    var label_point = new maptalks.VectorLayer('label').addTo(bigest_stations);


    function drawLabels(label_layer) {

        data[1].forEach(function (d) {
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
    }

    drawLabels(label_point);


    window.addEventListener("resize", function() {
        bigest_stations.animateTo({
            center :  [31, 48],
            zoom: 6.5,
            pitch: 0,
            bearing: 0
        }, {
            duration: 1000
        });
    });


});