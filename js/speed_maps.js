/**
 * Created by yevheniia on 15.06.20.
 */
const map_style = {
    center :  [31, 48],
    zoom   :  default_zoom,
    attributionControl : {
        'content' : '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    baseLayer : new maptalks.TileLayer('base',{
        'urlTemplate' : '',
        'subdomains': ['a','b','c','d']
    }),
    layers : [
        new maptalks.VectorLayer('v')
    ],
    minZoom: 5,
    maxZoom: 10,
    maxPitch: 0,
    pitch: 0,
    scrollWheelZoom : false
};



var speed_coal = new maptalks.Map('map2', map_style);
var speed_grain = new maptalks.Map('map3', map_style);
var speed_ore = new maptalks.Map('map4', map_style);
var speed_stone = new maptalks.Map('map5', map_style);



Promise.all([
    d3.json("data/UKR_adm1.json"), //0
    d3.csv("data/map_labels.csv"), //1

    d3.csv("data/speed_maps_csv/train/speed_coal_trains_directions.csv"), //2
    d3.csv("data/speed_maps_csv/wagons/speed_coal_wagons_directions.csv"), //3

    d3.csv("data/speed_maps_csv/train/speed_grain_trains_directions.csv"), //4
    d3.csv("data/speed_maps_csv/wagons/speed_grain_wagons_directions.csv"), //5

    d3.csv("data/speed_maps_csv/train/speed_ore_trains_directions.csv"), //6
    d3.csv("data/speed_maps_csv/wagons/speed_ore_wagons_directions.csv"), //7

    d3.csv("data/speed_maps_csv/train/speed_stone_trains_directions.csv"), //8
    d3.csv("data/speed_maps_csv/wagons/speed_stone_wagons_directions.csv") //9


]).then(function(data) {

    //add geojson with admin boundaries
    new maptalks.VectorLayer('admin', data[0]).setStyle({ 'symbol' : getSymbol('#FFFFDA') }).addTo(speed_coal);
    new maptalks.VectorLayer('admin', data[0]).setStyle({ 'symbol' : getSymbol('#FFFFDA') }).addTo(speed_grain);
    new maptalks.VectorLayer('admin', data[0]).setStyle({ 'symbol' : getSymbol('#FFFFDA') }).addTo(speed_ore);
    new maptalks.VectorLayer('admin', data[0]).setStyle({ 'symbol' : getSymbol('#FFFFDA') }).addTo(speed_stone);




    //coal - map2
    const coal_train_layer = new maptalks.VectorLayer('train', {
        'opacity': 0.5
    }).addTo(speed_coal);
    const coal_wagon_layer = new maptalks.VectorLayer('wagon', {
        'opacity': 0.5
    }).addTo(speed_coal);

    //grain - map3
    const grain_train_layer = new maptalks.VectorLayer('train', {
        'opacity': 0.5
    }).addTo(speed_grain);
    const grain_wagon_layer = new maptalks.VectorLayer('wagon', {
        'opacity': 0.5
    }).addTo(speed_grain);


    //ore - map4
    const ore_train_layer = new maptalks.VectorLayer('train', {
        'opacity': 0.5
    }).addTo(speed_ore);
    const ore_wagon_layer = new maptalks.VectorLayer('wagon', {
        'opacity': 0.5
    }).addTo(speed_ore);

    //ore - map5
    const stone_train_layer = new maptalks.VectorLayer('train', {
        'opacity': 0.5
    }).addTo(speed_stone);
    const stone_wagon_layer = new maptalks.VectorLayer('wagon', {
        'opacity': 0.5
    }).addTo(speed_stone);


    function getSymbol(color) {
        return [
            {
                'polygonFill': color,
                'polygonOpacity': 0,
                'lineColor': 'silver',
                'lineWidth': 1,
                'lineOpacity': 0.7
            }
        ];
    }

    function drawLayer(df, target_layer) {

        //колір швидкості від мін до макс.

        var color = d3.scaleLinear()
            .domain([d3.min(df, function(d){ return +d.mdn_speed }), d3.max(df, function(d){ return +d.mdn_speed })])
            .range(["#1D1194", "#E78B8A"]);


        // максимальна к-ть вагонів для line width domain
        var maxWag = d3.max(df, function(d){ return +d.no_wagons });

        var scale = d3.scaleLinear()
            .domain([0, maxWag])
            .range([1, 8]);


        /* середня к-ть вагонів для фільтру */
        var meanWag = d3.mean(df, function(d){ return +d.no_wagons });
        df = df.filter(function(d){ return d.no_wagons > meanWag });



        df.forEach(function (d) {
            d.lat_sender = +d.lat_sender;
            d.lon_sender = +d.lon_sender;
            d.lat_receiver = +d.lat_receiver;
            d.lon_receiver = +d.lon_receiver;
            d.mdn_speed = +d.mdn_speed;
            d.no_wagons = +d.no_wagons;


            let speedColor = color(d.mdn_speed);
            let lineWidth = scale(d.no_wagons);

            // blue circle
            var src = new maptalks.Marker(
                [d.lon_sender, d.lat_sender], {
                    symbol: {
                        'markerType': 'ellipse',
                        'markerFill': '#1D1194',
                        'markerFillOpacity': 0.8,
                        'markerLineColor': '#fff',
                        'markerLineWidth': 3,
                        'markerWidth': 0,
                        'markerHeight': 0
                    }
                }
            );

            // red circle
            var dst = new maptalks.Marker(
                [d.lon_receiver, d.lat_receiver], {
                    'symbol': {
                        'markerType': 'ellipse',
                        'markerFill': '#E78B8A',
                        'markerFillOpacity': 0.8,
                        'markerLineColor': '#fff',
                        'markerLineWidth': 3,
                        'markerWidth': 0,
                        'markerHeight': 0
                    }
                }
            );


            // Arc Connector Line
            var line = new maptalks.ArcConnectorLine(src, dst, {
                arcDegree: 90,
                showOn: 'always',
                arrowStyle : 'classic', // we only have one arrow style now
                arrowPlacement : 'vertex-last', //vertex-first, vertex-last, vertex-firstlast, point

                symbol: {
                    // 'lineColor' : {
                    //     'type' : 'linear',
                    //     'colorStops' : [
                    //         [0.00, '#1D1194'],
                    //         // [1 / 4, 'orange'],
                    //         // [2 / 4, 'green'],
                    //         // [3 / 4, 'aqua'],
                    //         [1.00, '#E78B8A']
                    //     ]
                    // },
                    'lineColor': speedColor,
                    // lineWidth: d.no_wagons/4000,
                    lineWidth: lineWidth
                }
            });

            target_layer.addGeometry(src, dst, line);


        });
    }


    drawLayer(data[2], coal_train_layer);
    drawLayer(data[3], coal_wagon_layer);
    coal_wagon_layer.hide();


    drawLayer(data[4], grain_train_layer);
    drawLayer(data[5], grain_wagon_layer);
    grain_wagon_layer.hide();


    drawLayer(data[6], ore_train_layer);
    drawLayer(data[7], ore_wagon_layer);
    ore_wagon_layer.hide();


    drawLayer(data[8], stone_train_layer);
    drawLayer(data[9], stone_wagon_layer);
    stone_wagon_layer.hide();

    d3.selectAll(".toggle_layer").on("click", function(){
        let layer_to_hide = d3.select(this).attr("hide");
        let layer_to_show = d3.select(this).attr("show");


        eval(layer_to_show).show();
        eval(layer_to_hide).hide();
    });






    //map labels
    var label_coal = new maptalks.VectorLayer('label').addTo(speed_coal);
    var label_grain = new maptalks.VectorLayer('label').addTo(speed_grain);
    var label_ore = new maptalks.VectorLayer('label').addTo(speed_ore);
    var label_stone = new maptalks.VectorLayer('label').addTo(speed_stone);

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

    drawLabels(label_coal);
    drawLabels(label_grain);
    drawLabels(label_ore);
    drawLabels(label_stone);




});
