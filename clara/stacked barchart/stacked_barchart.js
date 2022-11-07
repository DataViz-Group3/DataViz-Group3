function main() {
    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 0, bottom: 20, left: 50},
        width = 1450 - margin.left - margin.right,
        height = 550 - margin.top - margin.bottom;


    var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


			
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
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll("text")  
            .attr("font-size", "9px")
        svg.append("g")
            .append("text")
            .attr("x", 1400)
            .attr("y", 530)
            .attr('text-anchor', 'end')
            .attr('stroke', 'black')
            .text("Zone")

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 3050])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 10)
            .attr('dy', '-5em')
            .attr('text-anchor', 'end')
            .attr('stroke', 'black')
            .text('Count');

        // color palette = one color per subgroup

        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(d3["schemeCategory10"]);

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
            

        var legend = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(subgroups.slice().reverse())
            .enter().append("g")
          //.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
           .attr("transform", function(d, i) { return "translate(-50," + (300 + i * 20) + ")"; });
      
        legend.append("rect")
            .attr("x", width - 50)
            .attr("y", -300)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", color);
      
        legend.append("text")
            .attr("x", width - 55)
            .attr("y", -287)
            .text(function(d) { return d; });
    		d3.select(this).attr('class','highlight')

      
})


}