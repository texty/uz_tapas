/**
 * Created by yevheniia on 20.06.20.
 */

Promise.all([
    d3.csv("data/money_plot_csv/money_coal.csv"),
    d3.csv("data/money_plot_csv/money_grain.csv"),
    d3.csv("data/money_plot_csv/money_ore.csv")
]).then(function(data) {
    // set the dimensions and margins of the graph


    var margin = {top: 50, right: 30, bottom: 30, left: 60},
        width = 1000 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    var xScale = d3.scaleLinear()       
        .range([ 0, width ]);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")");


    var yScale = d3.scaleLinear()        
        .range([ height, 0]);

    svg.append("g")
        .attr("class", "y-axis");


    var points_container = svg.append('g')
        .attr("class", "points-container");

    function drawScatter(df) {

        df.forEach(function(d){
            d.avrg_tkm = +d.avrg_tkm;
            d.avrg_money_UAH = +d.avrg_money_UAH;
            d.median_speed_km_day = +d.median_speed_km_day;
        });


        var color = d3.scaleQuantile()
            .domain([d3.min(df, function(d){ return +d.median_speed_km_day }), d3.max(df, function(d){ return +d.median_speed_km_day })])
            .range(["#1D1194", "#C5778C",  "#A4628D",  "#824E8F",   "#603A91",  "#3F2592", "#E78B8A"]);

        let xMin = d3.min(df, function(d){ return d.avrg_tkm});
        let xMax = d3.max(df, function(d){ return d.avrg_tkm});


        xScale.domain([xMin, xMax]);
        yScale.domain([d3.min(df, function(d){ return d.avrg_money_UAH}), d3.max(df, function(d){ return d.avrg_money_UAH})]);
        
        svg.select(".x-axis")
            .transition()
            .duration(750)
            .call(d3.axisBottom(xScale)
              // .ticks(5)
              .tickSize(-height)
              // .tickValues([0, Math.ceil((xMax/4)/1000) * 1000, Math.ceil((xMax/2)/1000) * 1000, Math.ceil((xMax/4 * 3)/1000) * 1000 , Math.ceil(xMax/1000) * 1000])
            );

        
        svg.select(".y-axis")
            .call(d3.axisLeft(yScale)
                .ticks(4)
                .tickSize(-width)
                // .tickFormat(function(d){ return d3.format("s")(d) })
            );

        // Add dots
        var points = points_container
            .selectAll(".dot")
            .data(df);
        
        points
            .enter()
            .append("circle")
            .attr("class", "dot")
            .transition()
            .duration(750)
            .attr("cx", function (d) { return xScale(d.avrg_tkm); } )
            .attr("cy", function (d) { return yScale(d.avrg_money_UAH); } )
            .attr("r", 6)
            .style("fill", function(d){ return color(d.median_speed_km_day)});

        points
            .transition()
            .duration(750)
            .attr("cx", function (d) { return xScale(d.avrg_tkm); } )
            .attr("cy", function (d) { return yScale(d.avrg_money_UAH); } )
            .attr("r", 6)
            .style("fill", function(d){ return color(d.median_speed_km_day)});


        points
            .exit()
            .remove();


    }


    drawScatter(data[0]);

    d3.selectAll(".toggle_scatter").on("click", function(d){
        let index = d3.select(this).attr("data");
        drawScatter(data[index])
    })


});


