// https://d3-graph-gallery.com/graph/barplot_stacked_basicWide.html

function drawChart_a2_v4() {
    const div_id = "#a2_v4"

    // Definition of the div target dimentions
    const ratio = 3 / 1.5; // 3 width = 2 height
    const win_width = d3.select(div_id).node().getBoundingClientRect().width; //1920;//
    const win_height = win_width / ratio; //1200;//

    // set the dimensions and margins of the graph
    const margin = {top: 40, right: 10, bottom: 10, left: 40};
    const graph_width = win_width - margin.right - margin.left;
    const graph_height = win_height - margin.top - margin.bottom;

    // Function to get the max value of a column
    function get_col_max(data, col) {
        return d3.max(data, function(d) { return Number(d[col]); });
    }

    // List of groups (here I have one group per column)
    const x_axis_measures = [
        "Height (m)",
        "Crown Height (m)",
        "Crown Width (m)",
        "Canopy Cover (m2)",
        "Leaf Area (m2)"
    ]

    // add the options to the button
    d3.select(div_id)
        .append("div")
        .append("select")
        .attr("id", "x_axis_options")
        .selectAll("x_axis_options")
        .data(x_axis_measures)
        .enter()
        .append("option")
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button

    // Parse the Data
    d3.csv("../data_clean/a2_v4_trees_size_carbon_6.csv", function(data) {

        const default_x_axis_name = 'Height (m)';
        const default_y_axis_name = 'Carbon Storage (kg)';

        // group the data: I want to draw one line per group
        const subgroup_data = d3.nest() // nest function allows to group the calculation per level of a factor
            .key(function(d) { return d.Name;})
            .entries(data);

        // All the unique keys (trees)
        const allKeys = subgroup_data.map(function(d){ return d.key; })

        // Define subgraph width and height
        const sub_win_width = graph_width / 3;
        const sub_win_height = graph_height / 2;
        const sub_width = sub_win_width - margin.left - margin.right;
        const sub_height = sub_win_height - margin.top - margin.bottom;

        // Add an svg element for each group. The will be one beside each other and will go on the next row when no more room available
        let svg = d3.select(div_id)
                .append("svg")
                .attr("viewBox", "0 0 " + win_width + " " + win_height)
                .selectAll("sub_charts")
                .data(subgroup_data)
                .enter()
                .append("g")
                .attr("transform", function(d,i) {
                    const col = i%3;
                    const row = parseInt((i/3).toString());
                    return "translate(" + (margin.left + (col * (sub_win_width + margin.right))) + ","
                        + (margin.top + (row * (sub_win_height + margin.bottom))) + ")";
                });

        // Add X axis
        let x = d3.scaleLinear()
            .domain([ 0, get_col_max(data, default_x_axis_name) ])
            .range([ 0, sub_width ]);
        let x_axis = d3.axisBottom(x);
        svg.append("g")
            .attr("class", "x_axis")
            .attr("transform", "translate(0," + sub_height + ")")
            .call(x_axis);

        //Add Y axis
        let y = d3.scaleLinear()
            .domain([ 0, get_col_max(data, default_y_axis_name) ])
            .range([ sub_height, 0 ]);
        let y_axis = d3.axisLeft(y);
        svg.append("g")
            .attr("class", "y_axis")
            .call(y_axis);

        // color palette
        const color = d3.scaleOrdinal()
            .domain(allKeys)
            .range(d3["schemeCategory10"]);

        // Draw scatter data
        let circles = svg.selectAll("circles")
            .data(function(d){ return d.values; })
            .enter()
            .append("circle")
            .attr("r", 1.5)
            .attr("fill", function(d) { return color(d.Name); })
            .attr("cx", function(d) { return x(d[default_x_axis_name]); })
            .attr("cy", function(d) { return y(d[default_y_axis_name]); });

        // Add titles
        svg.append("text")
            .attr("text-anchor", "start")
            .attr("y", -10)
            .attr("x", 0)
            .text(function(d){ return(d.key)})
            .style("fill", function(d){ return color(d.key) })

        // X_axis measure selector
        function updateXAxis(new_x_axis_name) {
            x.domain([ 0, get_col_max(data, new_x_axis_name) ])
            d3.selectAll(".x_axis").call(x_axis)
            circles.transition()
                .duration(1000)
                .attr("cx", function(d) { return x(d[new_x_axis_name]); })
        }
        d3.select("#x_axis_options")
            .on("change", function(d) {
                const selectedOption = d3.select(this).property("value");
                updateXAxis(selectedOption);
        })

        // Y_axis measure selector
        function updateYAxis(new_y_axis_name) {
            y.domain([ 0, get_col_max(data, new_y_axis_name) ])
            d3.selectAll(".y_axis").call(y_axis)
            circles.transition()
                .duration(1000)
                .attr("cy", function(d) { return y(d[new_y_axis_name]); })
        }
        d3.select("#y_axis_options")
            .on("change", function(d) {
                const selectedOption = d3.select(this).property("value");
                updateYAxis(selectedOption);
            })
    })
}

drawChart_a2_v4();