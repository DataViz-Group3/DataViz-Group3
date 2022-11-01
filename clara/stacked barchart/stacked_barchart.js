function main() {
    var svg = d3.select("svg"),
    margin = 250,
    width = svg.attr("width") - margin,
    height = svg.attr("height") - margin;

    svg.append("text")
    .attr("transform", "translate(100,0)")
    .attr("x", 0)
    .attr("y", 50)
    .attr("font-size", "24px")
    .text("Stacked Bar")


    var g = svg.append("g")
        .attr("transform", "translate(" + 100 + "," + 100 + ")");

			
    d3.csv("../../data_clean/a1_v2_stacked_chart.csv", function(data) {

        var subgroups = data.columns.slice(1)

        var groups = d3.map(data, function(d){return(d['Circoscrizione Name'])}).keys()

        // Add X axis
        var x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2])
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSizeOuter(0));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 3050])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // color palette = one color per subgroup
        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['red', 'blue', 'purple', 'yellow', 'grey', 'green'])

        //stack the data? --> stack per subgroup
        var stackedData = d3.stack()
            .keys(subgroups)
            (data)

        // Show the bars
        svg.append("g")
            .selectAll("g")
            // Enter in the stack data = loop key per key = group per group
            .data(stackedData)
            .enter().append("g")
            .attr("fill", function(d) { return color(d.key); })
            .selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d) { return x(d.data['Circoscrizione Name']); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width",x.bandwidth())
})
}