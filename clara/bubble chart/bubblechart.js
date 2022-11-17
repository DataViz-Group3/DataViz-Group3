function drawChart_a2_v5() {
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 20, bottom: 40, left: 50},
        width = 1400 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;


    var svg = d3.select("#a2_v5")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    let normalize_name = function (name) {
        return name.replaceAll(' ','').replaceAll('.', '').replaceAll('\'', '');
    }
			
    d3.csv("../../data_clean/a2_v4_trees_size_carbon_6.csv", function(data) {

        data.forEach(function(d) {
			d['Height (m)'] = +d['Height (m)'];
            d['Carbon Storage (kg)'] = +d['Carbon Storage (kg)'];
            d['Canopy Cover (m2)'] = +d['Canopy Cover (m2)'];
		});

        // Add X axis
        var x = d3.scaleLinear()
            .domain([0, 5+ d3.max(data, function(d) { return d['Height (m)']; })])
            .range([0, width ]); 
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
        
          // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width+ 10)
            .attr("y", height + 30 )
            .text("Tree Height (m)");

        // Add Y axis        
        var y = d3.scaleLinear()
            .domain([0, 300+d3.max(data, function(d) { return d['Carbon Storage (kg)']; })])
            .range([height,0 ]); 

        svg.append("g")
            .call(d3.axisLeft(y));
        
          // Add Y axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", 0)
            .attr("y", 0 )
            .text("Carbon Storage (kg)")
            .attr("text-anchor", "start")

        
        var z = d3.scaleSqrt()
            .domain([d3.min(data, function(d) { return d['Canopy Cover (m2)']; }), d3.max(data, function(d) { return d['Canopy Cover (m2)']; })])
            .range([ 2, 32]);
            
        var unique = d3.nest()
            .key(function(d) { return d.Name; })
            .rollup(function(d) {return d.Name;})
            .entries(data);
        var types = unique.map(function(d){return d.key});
        var color = d3.scaleOrdinal()
            .domain([types])
            .range(d3["schemeCategory10"]);



        var tooltip = d3.select("#a2_v5")
            .append("div")
            .style("position", "absolute")
            .style("opacity", 0)
            .style("background-color", "rgb(211,211,211)")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .attr("class", "tooltip")
            .style("width", "auto")
            .style("height", "auto")
        
          // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
        var showTooltip = function(d) {
            //var xPos = parseFloat(d3.select(this).attr('cx'));
            //var yPos = parseFloat(d3.select(this).attr('cy'));
            tooltip
              .transition()
              .duration(500)
            tooltip
              .style("opacity", 1)
              .html("Canopy Cover (m2): " + d['Canopy Cover (m2)']+ '<br> Carbon Storage (kg): '+ d['Carbon Storage (kg)'] +  '<br> Tree Height (m): '+ d['Height (m)'])
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px")
        }
          

          
        var hideTooltip = function(d) {
            tooltip
              .transition()
              .duration(200)
              .style("opacity", 0)
        }
  
        
          // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", function(d) { return "bubbles "+ normalize_name(d.Name) })
            .attr("cx", function (d) { return x(d['Height (m)']); } )
            .attr("cy", function (d) { return y(d['Carbon Storage (kg)']); } )
            .attr("r", function (d) { return z(d['Canopy Cover (m2)']); } )
            .style("fill", function (d) { return color(d.Name); } )
            // -3- Trigger the functions for hover
            .on("mouseover", showTooltip )
            .on("mouseleave", hideTooltip )
        
        
          // What to do when one group is hovered
          var highlight = function(d){
            // reduce opacity of all groups
            d3.selectAll(".bubbles").style("opacity", 0)
            // expect the one that is hovered
            d3.selectAll("."+ normalize_name(d)).style("opacity", 1)
        }
        
          // And when it is not hovered anymore
        var noHighlight = function(d,i){
            d3.selectAll(".bubbles").style("opacity", 1)
        }
    
        
        
            // Add one dot in the legend for each name.

            svg.selectAll("myrect")
                .data(types)
                .enter()
                .append("circle")
                .attr("cx", width - 200)
                .attr("cy", function(d,i){ return 200 + i*25})
                .attr("r", 7)
                .style("fill", function(d){ return color(d)})
                .on("mouseover", highlight)
                .on("mouseleave", noHighlight)

            // Add labels beside legend dots
            svg.selectAll("mylabels")
                .data(types)
                .enter()
                .append("text")
                .attr("x", width-200 + 16)
                .attr("y", function(d,i){ return i * 25 + 200}) 
                .style("fill", function(d){ return color(d)})
                .text(function(d){ return d})
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
                .on("mouseover", highlight)
                .on("mouseleave", noHighlight)
    });
}

drawChart_a2_v5();
