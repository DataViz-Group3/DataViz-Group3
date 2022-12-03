function drawChart_a4_v1() {
    let div_id = "#a4_v1";

    // Definition of the div target dimentions
    let ratio = 2.5; // 3 width = 1 height
    let win_width = d3.select(div_id).node().getBoundingClientRect().width;
    let win_height = win_width / ratio;

    // set the dimensions and margins of the graph
    let margin = {top: 30, right: 30, bottom: 30, left: 50};
    let width = win_width - margin.right - margin.left;
    let height = win_height - margin.top - margin.bottom;


	let svg = d3.select(div_id)
		.append("svg")
		.attr("viewBox", "0 0 " + win_width + " " + win_height)

    let g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");     


    d3.csv("../../data_clean/monthly_data.csv").then( function(data) {

        data.forEach(function(d) {
            d['min'] = +d['min'];
            d['max'] = +d['max'];
            d['mean'] = +d['mean'];
        });

        // Add X axis
        var x = d3.scaleBand().range([0, width]).padding(1).domain(data.map(function(d) { return d.month; }));
            
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            
        g.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height-10)
            .text("Month");

        // Add Y axis        
        var y = d3.scaleLinear().range([height, 0])
            .domain([d3.min(data, function(d){return d.min}), d3.max(data, function(d) { return d.max; })])
            .range([height,0 ]);

        g.append("g")
            .call(d3.axisLeft(y))
        g.append("text")
            .attr("text-anchor", "end")
            .attr("x", 10)
            .attr("y", 10 )
            .text("Temperature")
            .attr("text-anchor", "start")



        var sumstat = d3.group(data, d => d.year)

    
        var color_dark = d3.scaleOrdinal().range(['#0d8b03', '#d6d600', '#006c8e', '#b10060', '#595959', '#f97600', '#8d0101', '#591c96'])
        var color_light = d3.scaleOrdinal().range(['#94fc8c', '#feff89', '#89e2ff', '#fe8ac9', '#c4c4c4', '#ffae66', '#f62927', '#b27ee6'])

        //select path - three types: curveBasis,curveStep, curveCardinal
        g.selectAll(".line")
            .data(sumstat)
            .join("path")
            .attr("fill", "none")
            .attr("stroke", function(d){ return color_light(d[0]) })
            .attr("stroke-width", 1.5)
            .attr("d", function (d) {
                return d3.line()
                    .x(function(d) { return x(d.month); })
                    .y(function(d) { return y(d.min); })
                    (d[1])
            
            })
            
        g.selectAll(".line")
            .data(sumstat)
            .join("path")
            .attr("fill", "none")
            .attr("stroke", function(d){ return color_dark(d[0]) })
            .attr("stroke-width", 1.5)
            .attr("d", function (d) {
                return d3.line()
                    .x(function(d) { return x(d.month); })
                    .y(function(d) { return y(d.max); })
                    (d[1])
            
            })    

    });
}

drawChart_a4_v1();
