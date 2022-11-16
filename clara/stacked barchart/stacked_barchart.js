function drawChart_a1_v2() {
    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 0, bottom: 20, left: 200},
        width = 1400 - margin.left - margin.right,
        height = 550 - margin.top - margin.bottom;

    var svg = d3.select("#a1_v2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        

    d3.csv("../../data_clean/a1_v2_stacked_chart.csv", function(data) {

        var subgroups = data.columns.slice(1)

        var groups = d3.map(data, function(d){return(d['Circoscrizione Name'])}).keys()

        // Add X axis
        var x = d3.scaleLinear()
            .domain([0, 3050])
            .range([0, width ]); 
        
        // Add Y axis        
        var y = d3.scaleBand()
            .domain(groups)
            .range([0, height])
            .padding([0.2])

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .append("text")
            .attr('text-anchor', 'end')
            .attr("x", width)
            .attr("y", -5)
            .attr('stroke', 'black')
            .text("Count")


        svg.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr('y', '-5')
            .attr('x', '-5')
            .attr('text-anchor', 'end')
            .attr('stroke', 'black')
            .text('Zone');

        // color palette = one color per subgroup

        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(d3["schemeCategory10"]);

        //stack the data? --> stack per subgroup
        var stackedData = d3.stack()
            .keys(subgroups)
            (data)

        var tooltip = d3.select("#a1_v2")
        .append("div")
        .style("position", "absolute")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("width", "auto")
        .style("height", "auto")
        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function(d) {
            let xPos = d3.event.pageX + 10;
            let yPos = d3.event.pageY;    
            var subgroupName = d3.select(this.parentNode).datum().key;
            var subgroupValue = d.data[subgroupName];
            tooltip
                .html(subgroupName + ": " + subgroupValue)
                .style("opacity", 1)
                .style('left', xPos + 'px')
                .style('top', yPos + 'px')
                .style('color', 'black')
        }
        
        
        var mouseleave = function(d) {
            tooltip
              .style("opacity", 0)
        }
                  
        

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
            .attr("y", function(d) { return y(d.data['Circoscrizione Name']); })
            .attr("x", function(d) { return x(d[0]); })
            .attr("height", y.bandwidth())
            .attr("width",function(d) { return x(d[1]) - x(d[0]); })
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)

            
            

            

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
            .attr("y", -20)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", color);
      
        legend.append("text")
            .attr("x", width - 55)
            .attr("y", -7)
            .text(function(d) { return d; });
    		//d3.select(this).attr('class','highlight')

      
})


}

drawChart_a1_v2()