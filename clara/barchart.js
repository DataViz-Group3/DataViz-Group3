function main() {
	var svg = d3.select("svg"),
        margin = 150,
        width = svg.attr("width") - margin,
        height = svg.attr("height") - margin;

    svg.append("text")
       .attr("transform", "translate(100,0)")
       .attr("x", 50)
       .attr("y", 50)
       .attr("font-size", "24px")

    var xScale = d3.scaleBand().range([0, width]).padding(0.4),
        yScale = d3.scaleLinear().range([height, 0]);

    var g = svg.append("g")
            .attr("transform", "translate(" + 100 + "," + 100 + ")");

			
    d3.csv("../data_clean/a1_v1_tree_abundance.csv", function(data) {
        xScale.domain(data.map(function(d) { return d.Name; }));
        yScale.domain([0, d3.max(data, function(d) { return d.Count; })]);
		//yScale.domain([0, 1030]);

        g.append("g")
         .attr("transform", "translate(0," + height + ")")
         .call(d3.axisBottom(xScale))
         .append("text")
         .attr("y", height - 250)
         .attr("x", width - 100)
         .attr("text-anchor", "end")
         .attr("stroke", "black")
         .text("Name");

        g.append("g")
         .call(d3.axisLeft(yScale).tickFormat(function(d){return d;}))
	 .append("text")
	 .attr("transform", "rotate(-90)")
	 .attr("y", 10)
	 .attr('dy', '-5em')
	 .attr('text-anchor', 'end')
	 .attr('stroke', 'black')
	 .text('Name')

        g.selectAll(".bar")
         .data(data)
         .enter().append("rect")
         .attr("class", "bar")
	 .on("mouseover", onMouseOver) // Add listener for event
	 .on("mouseout", onMouseOut)
         .attr("x", function(d) { return xScale(d.Name); })
         .attr("y", function(d) { return yScale(d.Count); })
         .attr("width", xScale.bandwidth())
	 .transition()
	 .ease(d3.easeLinear)
	 .duration(500)
	 .delay(function(d,i){ return i * 50})
         .attr("height", function(d) { return height - yScale(d.Count); });
	})
       
	// Mouseover event handler

	function onMouseOver(d, i) {
		// Get bar's xy values, ,then augment for the tooltip
		var xPos = parseFloat(d3.select(this).attr('x')) + xScale.bandwidth() / 2;
		var yPos = parseFloat(d3.select(this).attr('y')) / 2 + height / 2

		// Update Tooltip's position and value
		d3.select('#tooltip')
			.style('left', xPos + 'px')
			.style('top', yPos + 'px')
			.select('#value').text(i.value)
		
		d3.select('#tooltip').classed('hidden', false);


		d3.select(this).attr('class','highlight')
		d3.select(this)
			.transition() // I want to add animnation here
			.duration(500)
			.attr('width', xScale.bandwidth() + 5)
			.attr('y', function(d){return yScale(d.Count) - 10;})
			.attr('height', function(d){return height - yScale(d.Count) + 10;})

	}

	// Mouseout event handler
	function onMouseOut(d, i){
		d3.select(this).attr('class','bar')
		d3.select(this)
			.transition()
			.duration(500)
			.attr('width', xScale.bandwidth())
			.attr('y', function(d){return yScale(d.Count);})
			.attr('height', function(d) {return height - yScale(d.Count)})
		
		d3.select('#tooltip').classed('hidden', true);
	}
}