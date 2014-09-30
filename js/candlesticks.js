"use strict";

var ccCandlesticks = function(id, url){
    var svgContainer = d3.select(id),
        candlestickGraph = null,
        height = 500,
        width = parseInt(svgContainer.style("width")),
        aspect = width / height,
        margin = 50,
        data = [];

    var min = function(a, b){
        return a < b ? a : b;
    };

    var max = function(a, b){
        return a > b ? a : b;
    };

    var darwGraph = function(){
        candlestickGraph = svgContainer.append("svg:svg")
            .attr("class", "candlestick-chart")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", "0 0 " + width + " " + height)
            .attr("preserveAspectRatio", "xMidYMid");

    };

    var drawCandlesticks = function(){
        var y = d3.scale.linear()
                    .domain([d3.min(data.map(function(x){ return x["Low"]; })) - 10, d3.max(data.map(function(x){ return x["High"]; }))])
                    .range([height-margin, 0]);
            
        var x = d3.time.scale()
                    .domain([new Date(data[0]["Date"]), new Date(data[data.length - 1]["Date"])])
                    .range([80, width-margin]);

        var yAxis = d3.svg.axis()
                        .scale(y).orient("left");
        var xAxis = d3.svg.axis()
                        .scale(x).orient("bottom");

        candlestickGraph.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, "+ (height - margin) +")")
            .call(xAxis);

        candlestickGraph.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate("+ 80 +", 0)")
            .call(yAxis);

        candlestickGraph.selectAll("rect.real-body")
            .data(data)
            .enter().append("svg:rect")
            .attr("class", "real-body")
            .attr("x", function(d) { return x(new Date(d.Date)); })
            .attr("y", function(d) { return y(max(d.Open, d.Close)); })
            .attr("width", function(d) { return 0.5 * (width - 2 * margin) / data.length; })
            .attr("fill",function(d) { return d.Open > d.Close ? "#ec3232" : "#1bc45b" ;})
            .attr("height", function(d) { return y(min(d.Open, d.Close)) - y(max(d.Open, d.Close));});

        candlestickGraph.selectAll("line.shadow")
            .data(data)
            .enter().append("svg:line")
            .attr("class", "shadow")
            .attr("x1", function(d) { return x(new Date(d.Date)) + 0.25 * (width - 2 * margin)/ data.length;})
            .attr("x2", function(d) { return x(new Date(d.Date)) + 0.25 * (width - 2 * margin)/ data.length;})       
            .attr("y1", function(d) { return y(d.High);})
            .attr("y2", function(d) { return y(d.Low); })
            .attr("stroke", function(d){ return d.Open > d.Close ? "#ec3232" : "#1bc45b"; });
    };

    var appendTimestamp = function(json){
        for(var i = 0; i < json.length; i++){
            json[i].timestamp = (new Date(json[i].Date).getTime() / 1000);
        }

        data = json.sort(function(x, y){ return x.timestamp - y.timestamp; });

        drawCandlesticks();
    };

    var fetchData = function(){
        d3.json(url, function(error, json){
           appendTimestamp(json);
        });
    };

    window.addEventListener("resize", function(event){
        var width = parseInt(svgContainer.style("width"));

        candlestickGraph.attr("height", width / aspect);
        candlestickGraph.attr("width", width);
    });

    fetchData();
    darwGraph();

    return candlestickGraph;
};