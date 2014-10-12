(function(){
    "use strict";

    var ccCandlesticks = function(options){
        var svgContainer = d3.select(options.id),
            height = 500,
            width = parseInt(svgContainer.style("width")),
            aspect = width / height,
            margin = 50,
            data = [],
            flag = "init",
            realBodies = null, shadows = null, candlestickGraph = null,
            y = null, x =null, xAxis = null, yAxis = null, graph_interval = null;

        var min = function(a, b){
            return a < b ? a : b;
        };

        var max = function(a, b){
            return a > b ? a : b;
        };

        var modDate = function(date_string, mod){
            var date = new Date(date_string.replace(/\./g,"/"));

            // mod === "yesterday" ? date.setMinutes(date.getMinutes() - 0) : date.setHours(date.getMinutes() + 0);
            return date;
        };

        var setGraphInterval = function(){
            if(options.hasOwnProperty("refresh_rate")){
                if (!!graph_interval) {
                    clearInterval(graph_interval);
                }
                graph_interval = setInterval(function(){
                    fetchData("update");
                }, options.refresh_rate);
            }
        };


        var darwGraph = function(){
            candlestickGraph = svgContainer.append("svg:svg")
                .attr("class", "candlestick-chart")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", "0 0 " + width + " " + height)
                .attr("preserveAspectRatio", "xMidYMid");

            candlestickGraph.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "end")
                .attr("x", width - margin)
                .attr("y", height - margin)
                .attr("dy", "-0.75em")
                .text("Timeline");

            candlestickGraph.append("text")
                .attr("class", "y label")
                .attr("text-anchor", "end")
                .attr("y", margin)
                .attr("dy", "1.2em")
                .attr("transform", "rotate(-90)")
                .text("PiPs");

            window.addEventListener("resize", function(event){
                var width = parseInt(svgContainer.style("width")),
                    height = width / aspect;

                candlestickGraph.attr("height", height).attr("width", width);
            });

            setGraphInterval();
        };

        var initGraphScale = function(){
            realBodies = candlestickGraph.selectAll("rect.real-body").data(data);
            shadows = candlestickGraph.selectAll("line.shadow").data(data);

            y = d3.scale.linear()
                        .domain([d3.min(data.map(function(x){ return x["Low"]; })) - 10, d3.max(data.map(function(x){ return x["High"]; }))])
                        .range([height-margin, 0]);
            x = d3.time.scale()
                        .domain([modDate(data[0]["Date"], "yesterday"), modDate(data[data.length - 1]["Date"])])
                        .range([50, width-margin]);
            yAxis = d3.svg.axis()
                        .scale(y).orient("left");
            xAxis = d3.svg.axis()
                        .scale(x).orient("bottom").ticks(5);
        };

        var addNewCandlesticks = function(){
            realBodies.enter().append("rect")
                .attr("class", "real-body")
                .attr("x", function(d) { return x(modDate(d.Date)); })
                .attr("y", function(d) { return y(max(d.Open, d.Close)); })
                .attr("width", function(d) { return 0.5 * (width - 2 * margin) / data.length; })
                .attr("fill",function(d) { return d.Open > d.Close ? "#ec3232" : "#1bc45b" ;})
                .attr("height", function(d) { return y(min(d.Open, d.Close)) - y(max(d.Open, d.Close));});


            shadows.enter().append("line")
                .attr("class", "shadow")
                .attr("x1", function(d) { return x(modDate(d.Date)) + 0.25 * (width - 2 * margin)/ data.length;})
                .attr("x2", function(d) { return x(modDate(d.Date)) + 0.25 * (width - 2 * margin)/ data.length;})       
                .attr("y1", function(d) { return y(d.High);})
                .attr("y2", function(d) { return y(d.Low); })
                .attr("stroke", function(d){ return d.Open > d.Close ? "#ec3232" : "#1bc45b"; });
        };

        var drawCandlesticks = function(){
            candlestickGraph.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0, "+ (height - margin) +")")
                .call(xAxis);

            candlestickGraph.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate("+ 50 +", 0)")
                .call(yAxis);
            
            addNewCandlesticks();
        };

        var updateGraphData = function(){
            candlestickGraph.select("g.x").transition().duration(850).call(xAxis);

            candlestickGraph.select("g.y").transition().duration(850).call(yAxis);

            realBodies.transition().duration(850)
                .attr("x", function(d) { return x(modDate(d.Date)); })
                .attr("y", function(d) { return y(max(d.Open, d.Close)); })
                .attr("width", function(d) { return 0.5 * (width - 2 * margin) / data.length; })
                .attr("fill",function(d) { return d.Open > d.Close ? "#ec3232" : "#1bc45b" ;})
                .attr("height", function(d) { return y(min(d.Open, d.Close)) - y(max(d.Open, d.Close));});


            shadows.transition().duration(850)
                .attr("x1", function(d) { return x(modDate(d.Date)) + 0.25 * (width - 2 * margin)/ data.length;})
                .attr("x2", function(d) { return x(modDate(d.Date)) + 0.25 * (width - 2 * margin)/ data.length;})       
                .attr("y1", function(d) { return y(d.High);})
                .attr("y2", function(d) { return y(d.Low); })
                .attr("stroke", function(d){ return d.Open > d.Close ? "#ec3232" : "#1bc45b"; });


            realBodies.exit().remove();
            shadows.exit().remove();
            
            addNewCandlesticks();
        };

        var appendTimestamp = function(json, flag){
            for(var i = 0; i < json.length; i++){
                json[i].timestamp = (new Date(json[i].Date).getTime());
            }

            data = json.sort(function(x, y){ return x.timestamp - y.timestamp; });

            initGraphScale();

            flag === "init" ? drawCandlesticks() : updateGraphData();
        };

        var fetchData = function(flag){
            var url = flag === "init" ? options.url : options.url + "?" + Math.floor(Math.random()*10000);

            d3.json(url, function(error, json){
                appendTimestamp(json, flag);
            });
        };

        var redrawGraph = function(url){
            options.url = url;
            fetchData("update");
        };
        
        darwGraph();
        fetchData("init");

        return {
            redrawGraph: redrawGraph
        };
    };

    window.ccCandlesticks = ccCandlesticks;
})();