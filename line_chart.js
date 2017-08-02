// Adapted from https://bl.ocks.org/alandunning/cfb7dcd7951826b9eacd54f0647f48d3

var yearly = d3.select("#yearly").append("svg").attr("width", 800).attr("height", 450),
    margin = {top: 20, right: 20, bottom: 60, left: 40},
    width = +yearly.attr("width") - margin.left - margin.right,
    height = +yearly.attr("height") - margin.top - margin.bottom;

var parseTime = d3.timeParse("%Y-%m");
    bisectDate = d3.bisector(function(d) { return d.Month; }).left;

var x = d3.scaleTime().range([0, 650]);
var y = d3.scaleLinear().range([height, 0]);

var line = d3.line()
    .x(function(d) { return x(d.Month); })
    .y(function(d) { return y(d.Median_Price); });

var g = yearly.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("nj_Zhvi_4bedroom0.csv", function(error, data) {
    if (error) throw error;

    data.forEach(function(d) {
      d.Month = parseTime(d.Month);
      d.Median_Price = +d.Median_Price;
    });

    x.domain(d3.extent(data, function(d) { return d.Month; }));
    y.domain([d3.min(data, function(d) { return d.Median_Price; }) / 1.005, d3.max(data, function(d) { return d.Median_Price; }) * 1.005]);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + 375 + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-65)");


    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(6).tickFormat(function(d) { return parseInt(d / 1000) + "k"; }))
      .append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .attr("fill", "#5D6971")
        .text("Median Price");

    g.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    var focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", width)
        .attr("x2", width);

    focus.append("circle")
        .attr("r", 7.5);

    focus.append("text")
        .attr("x", 15)
      	.attr("dy", ".31em");

    yearly.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "overlay")
        .attr("width", 800)
        .attr("height", 450)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.Month > d1.Month - x0 ? d1 : d0;
      focus.attr("transform", "translate(" + x(d.Month) + "," + y(d.Median_Price) + ")");
      focus.select("text").text(function() { return d.Median_Price; }).attr("fill", "#6495ED");
      focus.select(".x-hover-line").attr("y2", height - y(d.Median_Price));
      focus.select(".y-hover-line").attr("x2", width + width);
    }
});
