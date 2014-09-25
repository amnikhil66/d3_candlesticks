// Figuring out how to include ticks for the xAxis

var width = 900,
height = 500,
aspect = 900 / 500,
data = [];

var min = function(a, b){
    return a < b ? a : b;
};

var max = function(a, b){
    return a > b ? a : b;
};

var buildCandlesticks = function(data){
    var margin = 50;

    var chart = d3.select("#chart")
        .append("svg:svg")
        .attr("class", "chart")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMidYMid");

    var y = d3.scale.linear()
        .domain([d3.min(data.map(function(x){ return x["Low"]; })) - 10, d3.max(data.map(function(x){ return x["High"]; }))])
        .range([height-margin, 0]);
        
    var x = d3.scale.linear()
        .domain([d3.min(data.map(function(d){ return d.timestamp; })),d3.max(data.map(function(d){ return d.timestamp; }))])
        .range([80, width-margin]);

    chart.append("svg:line")
        .attr("class", "x")
        .attr("x1", margin)
        .attr("x2", width - margin)
        .attr("y1", height - margin)
        .attr("y2", height - margin)
        .attr("stroke", "#ccc");

    chart.append("svg:line")
        .attr("class", "y")
        .attr("x1", margin)
        .attr("x2", margin)
        .attr("y1", 0)
        .attr("y2", height - margin)
        .attr("stroke", "#ccc");

    chart.selectAll("text.xrule")
        .data(x.ticks(10))
        .enter().append("svg:text")
        .attr("class", "xrule")
        .attr("x", x)
        .attr("y", height - margin)
        .attr("dy", 20)
        .attr("text-anchor", "middle")
        .text(function(d){ var date = new Date(d * 1000);  return (date.getMonth() + 1)+"/"+date.getDate(); });

    chart.selectAll("text.yrule")
        .data(y.ticks(10))
        .enter().append("svg:text")
        .attr("class", "yrule")
        .attr("x", 0)
        .attr("y", y)
        .attr("dy", 0)
        .attr("dx", 20)         
        .attr("text-anchor", "middle")
        .text(String);

    chart.selectAll("rect")
        .data(data)
        .enter().append("svg:rect")
        .attr("x", function(d) { return x(d.timestamp); })
        .attr("y", function(d) {return y(max(d.Open, d.Close));})     
        .attr("height", function(d) { return y(min(d.Open, d.Close))-y(max(d.Open, d.Close));})
        .attr("width", function(d) { return 0.5 * (width - 2*margin)/data.length; })
        .attr("fill",function(d) { return d.Open > d.Close ? "red" : "green" ;});

    chart.selectAll("line.stem")
        .data(data)
        .enter().append("svg:line")
        .attr("class", "stem")
        .attr("x1", function(d) { return x(d.timestamp) + 0.25 * (width - 2 * margin)/ data.length;})
        .attr("x2", function(d) { return x(d.timestamp) + 0.25 * (width - 2 * margin)/ data.length;})       
        .attr("y1", function(d) { return y(d.High);})
        .attr("y2", function(d) { return y(d.Low); })
        .attr("stroke", function(d){ return d.Open > d.Close ? "red" : "green"; });

    $(window).on("resize", function(){
        var width = $("#chart").parent().width();
        chart.attr("width", width)
            .attr("height", width / aspect);
    });
};

var appendToData = function(data){
    for(var i=0;i<data.length;i++){
        data[i].timestamp = (new Date(data[i].Date).getTime() / 1000);
    }

    data = data.sort(function(x, y){ return x.timestamp - y.timestamp; });

    buildCandlesticks(data);
};

(function(){
    d3.json("js/data/candlesticks.json", function(error, json){
       appendToData(json);
    });
})();