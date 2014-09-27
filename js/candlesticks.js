"use strict";

var ccCandlesticks = function(id, url){
    var svgContainer = d3.select(id),
        candlestickGraph = null,
        height = 500,//parseInt(svgContainer.style("height")),
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
            
        var x = d3.scale.linear()
            .domain([d3.min(data.map(function(d){ return d.timestamp; })),d3.max(data.map(function(d){ return d.timestamp; }))])
            .range([80, width-margin]);

        candlestickGraph.append("svg:line")
            .attr("class", "x")
            .attr("x1", margin)
            .attr("x2", width - margin)
            .attr("y1", height - margin)
            .attr("y2", height - margin)
            .attr("stroke", "#ccc");

        candlestickGraph.append("svg:line")
            .attr("class", "y")
            .attr("x1", margin)
            .attr("x2", margin)
            .attr("y1", 0)
            .attr("y2", height - margin)
            .attr("stroke", "#ccc");

        candlestickGraph.selectAll("text.xrule")
            .data(x.ticks(10))
            .enter().append("svg:text")
            .attr("class", "xrule")
            .attr("x", x)
            .attr("y", height - margin)
            .attr("dy", 20)
            .attr("text-anchor", "middle")
            .text(function(d){ var date = new Date(d * 1000);  return (date.getMonth() + 1)+"/"+date.getDate(); });

        candlestickGraph.selectAll("text.yrule")
            .data(y.ticks(10))
            .enter().append("svg:text")
            .attr("class", "yrule")
            .attr("x", 0)
            .attr("y", y)
            .attr("dy", 0)
            .attr("dx", 20)         
            .attr("text-anchor", "middle")
            .text(String);

        candlestickGraph.selectAll("rect.real-body")
            .data(data)
            .enter().append("svg:rect")
            .attr("class", "real-body")
            .attr("x", function(d) { return x(d.timestamp); })
            .attr("y", function(d) { return y(max(d.Open, d.Close)); })
            .attr("width", function(d) { return 0.5 * (width - 2 * margin) / data.length; })
            .attr("fill",function(d) { return d.Open > d.Close ? "#ec3232" : "#1bc45b" ;})
            .transition()
            .delay(function(d, i){ console.log(d); console.log(i); return i * 1000; })
            .duration(1000)
            .attr("height", function(d) { return y(min(d.Open, d.Close)) - y(max(d.Open, d.Close));});

        candlestickGraph.selectAll("line.shadow")
            .data(data)
            .enter().append("svg:line")
            .attr("class", "shadow")
            .attr("x1", function(d) { return x(d.timestamp) + 0.25 * (width - 2 * margin)/ data.length;})
            .attr("x2", function(d) { return x(d.timestamp) + 0.25 * (width - 2 * margin)/ data.length;})       
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