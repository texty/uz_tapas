/**
 * Created by yevheniia on 20.06.20.
 */

Promise.all([
    d3.csv("data/money_plot_csv/money_coal.csv"),
    d3.csv("data/money_plot_csv/money_grain.csv"),
    d3.csv("data/money_plot_csv/money_ore.csv")
]).then(function(data) {
    // set the dimensions and margins of the graph


    var margin = {top: 20, right: 20, bottom: 50, left: 60},
        width = (d3.select("#scatter").node().getBoundingClientRect().width - margin.left - margin.right) * 0.6,
        height = width < 600 ? (width - margin.top - margin.bottom) : (500 - margin.top - margin.bottom) ;

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
        .attr("class", "y-axis")
        .attr("transform", "translate(-5," + 0 + ")");

    svg.append("text")
        .attr("class", 'axis-labels')
        .attr("transform",
            "translate(" + (width/2) + " ," +
            (height + margin.bottom - 5) + ")")
        .style("text-anchor", "middle")
        .text("середній вантадообіг на маршруті, тоно-кілометри");


    svg.append("text")
        .attr("class", 'axis-labels')
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 5)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("середня вартість перевезення, тис. грн");


    var points_container = svg.append('g')
        .attr("class", "points-container");

    function drawScatter(df) {

        df.forEach(function(d){
            d.avrg_tkm = +d.avrg_tkm;
            d.avrg_money_UAH = +d.avrg_money_UAH;
            d.median_speed_km_day = +d.median_speed_km_day;
        });

        let maxSpeed = d3.max(df, function(d){ return +d.median_speed_km_day });
        let minSpeed = d3.min(df, function(d){ return +d.median_speed_km_day});
        d3.select('#scatter-max-speed').html(maxSpeed);
        d3.select("#scatter-min-speed").html(minSpeed);


        var color = d3.scaleLinear()
            .domain([minSpeed, maxSpeed])
            .range(["#AA2B8E", "#007EFF"]);


        let xMin = d3.min(df, function(d){ return d.avrg_tkm});
        let xMax = d3.max(df, function(d){ return d.avrg_tkm});
        xScale.domain([xMin, xMax]);
        yScale.domain([0, d3.max(df, function(d){ return d.avrg_money_UAH})]);
        
        svg.select(".x-axis")
            .transition()
            .duration(750)
            .call(d3.axisBottom(xScale)
              .tickFormat(d3.format(".2s"))
              .tickSize(-height)
              .tickValues([0, Math.ceil((xMax/4)/1000) * 1000, Math.ceil((xMax/2)/1000) * 1000, Math.ceil((xMax/4 * 3)/1000) * 1000 , Math.ceil(xMax/1000) * 1000])
            );

        
        svg.select(".y-axis")
            .transition()
            .duration(750)
            .call(d3.axisLeft(yScale)
                .ticks(5)
                .tickSize(-width)
                 .tickFormat(d3.format(".2s"))
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
            .on("click", function(d){ console.log(d.median_speed_km_day)})
            .transition()
            .duration(750)
            .attr("cx", function (d) { return xScale(d.avrg_tkm); } )
            .attr("cy", function (d) { return yScale(d.avrg_money_UAH); } )
            .attr("r", 6)
            .style("fill", function(d){ return color(d.median_speed_km_day)})
            .style("opacity", 0.7);


        points
            .on("click", function(d){ console.log(d.median_speed_km_day)})
            .transition()
            .duration(750)
            .attr("cx", function (d) { return xScale(d.avrg_tkm); } )
            .attr("cy", function (d) { return yScale(d.avrg_money_UAH); } )
            .attr("r", 6)
            .style("fill", function(d){ return color(d.median_speed_km_day)})
            .style("opacity", 0.7)
           ;


        points
            .exit()
            .remove();





    }


    drawScatter(data[2]);

    d3.selectAll(".toggle_scatter").on("click", function(){
        d3.select(this.parentNode).selectAll(".speed-map-button").classed("active", false);
        d3.select(this).classed("active", true);
        let index = d3.select(this).attr("data");
        drawScatter(data[index])
    })


});


