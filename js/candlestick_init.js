var candleStickGraph = ccCandlesticks({
    id: "#chart",
    url: "js/data/candlesticks.json",
    refresh_rate: 2000
});

// Events Sections
d3.select("#candle_currency_selector_1")
    .on("change", function(event){
        var otherSelector = document.getElementById("candle_currency_selector_2"),
            otherOption = otherSelector.querySelector("option[selected]"),
            url = null;

        otherSelector.querySelector("option[disabled]").removeAttribute("disabled");

        if (otherOption.value === d3.event.target.value){
            var sibling = otherOption.nextElementSibling;

            otherOption.setAttribute("disabled", "true");
            otherOption.removeAttribute("selected", "true");

            if(!!sibling){
                sibling.setAttribute("selected", "true");
            }else{
                otherSelector.querySelector("option:first-child").setAttribute("selected");
            }
        }else{
            otherSelector.querySelector("option[value = '" + d3.event.target.value + "']").setAttribute("disabled", "true");
        }

        url = "js/data/cc_3_" + d3.event.target.value + otherSelector.value +
        "_" + document.getElementById("candle_time_period_selector").value + ".json";

        candleStickGraph.redrawGraph(url);
    });

d3.select("#candle_currency_selector_2")
    .on("change", function(event){
        debugger;
        var url = "js/data/cc_3_" + document.getElementById("candle_currency_selector_1").value + d3.event.target.value +
        "_" + document.getElementById("candle_time_period_selector").value + ".json";

        candleStickGraph.redrawGraph(url);
    });


d3.select("#candle_time_period_selector")
    .on("change", function(event){
        var url = "js/data/cc_3_" + document.getElementById("candle_currency_selector_1").value +
        document.getElementById("candle_currency_selector_2").value +
        "_" + d3.event.target.value + ".json";

        candleStickGraph.redrawGraph(url);
    });