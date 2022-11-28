function drawChart_a3_v2() {
    const div_id = "#a3_v2";

    //Width and height
    let width = 1000;
    let height = 1100;

    // Sizes definitions
    const win_ratio = 3/2;
    const win_width = d3.select(div_id).node().getBoundingClientRect().width;
    const win_height = win_width / win_ratio;

    const margin = {top: 20, right: 20, bottom: 20, left: 20};

    const main_win_width = (win_width*(2/3) ) - margin.right - margin.left;
    const main_win_height = win_height - margin.top - margin.bottom;

    const tool_win_width = (win_width/3) - margin.right - margin.left;

    d3.select(div_id)
        .style("display", "flex")
        .style("flex-direction", "row")

    // Basic definition of svg zone of main graph
    let svg = d3.select(div_id)
        .append("div")
        .style("border-style", "solid")
        .style("width", main_win_width + "px")
        .style("height", main_win_height + "px")
        .append("svg")
        .attr("viewBox", "0 0 " + main_win_width + " " + main_win_height);

    // Right toolbar
    let toolBar = d3.select(div_id)
        .append("div")
        .style("width", tool_win_width + "px")
        .style("height", main_win_height + "px");

    // Mini map
    let minimap = toolBar.append("div")
        .style("border-style", "solid")
        .style("width", tool_win_width + "px")
        .style("height", tool_win_width + "px");

    // create a tooltip
    let Tooltip = d3.select(div_id)
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("padding", "5px");

    function normalize_name(name) {
        return name.replaceAll(' ', '').replaceAll('.', '');
    }

    let minimap_divs = {};

    d3.json("../data_clean/a3.json").then( function(data) {
        const measure = "Canopy Cover Density (perc)";

        /* ---------------------------------------------------------------------------------------------
        Color Range
        --------------------------------------------------------------------------------------------- */
        const max_dens = d3.max(data.features, (d) => d.properties[measure])
        const colors = d3.scaleLinear()
            .domain([0, max_dens])
            .range(["white", "darkgreen"])

        /* ---------------------------------------------------------------------------------------------
        Main svg
        --------------------------------------------------------------------------------------------- */
        const projection = d3.geoIdentity()
            .reflectY(true)
            .fitSize([main_win_width, main_win_width], data);

        let zones = svg.append("g")
            .selectAll(".zones")
            .data(data.features)
            .enter()
            .append("path")
            .attr("class", "zones")
            .attr("id", (d) => normalize_name(d.properties.Name) )
            .attr("d", d3.geoPath().projection(projection))
            .attr("fill", (d) => colors(d.properties[measure]))
            .style("stroke", "black");

        /* ---------------------------------------------------------------------------------------------
        Hover functions
        --------------------------------------------------------------------------------------------- */
        function mouseover(event, d) {
            const circ = d.properties.Name;
            zones.style("opacity", 0.8);
            d3.selectAll("#" + normalize_name(circ) + ".zones")
                .style("stroke-width", 3)
                .style("opacity", 1);
            Tooltip.style("opacity", 1);
        }
        zones.on("mouseover", mouseover);

        function mousemove(event, d) {
            const circ = d.properties.Name;
            const density = d.properties["Canopy Cover Density (perc)"];
            const tot_area = d.properties["Area"];
            Tooltip.html(
                circ + "<br>" +
                "Total area: " + tot_area + " m2<br>" +
                density + "% of area covered in trees"
            )
                .style("left", (event.pageX+20) + "px")
                .style("top", (event.pageY) + "px");
        }
        zones.on("mousemove", mousemove)

        function mouseleave(event, d) {
            const circ = d.properties.Name;
            zones.style("opacity", 1);
            d3.selectAll("#" + normalize_name(circ) + ".zones")
                .style("stroke-width", 1)
                .style("opacity", 0.8);
            Tooltip.style("opacity", 0);
        }
        zones.on("mouseleave", mouseleave)

        /* ---------------------------------------------------------------------------------------------
        Minimap zones
        --------------------------------------------------------------------------------------------- */
        const circos = data.features.map((d) => [d.properties.Name, d.properties['Quartiere']]);
        for (let i in circos){
            const circo_name = circos[i][0];
            const circo_data = circos[i][1];

            let minimap_svg = minimap.append("div")
                .style("opacity", 0)
                .style("position", "absolute")
                .attr("id", "minimap_" + normalize_name(circo_name))
                .append("svg")
                .attr("width", tool_win_width)
                .attr("height", tool_win_width);

            minimap_svg.append("g")
                .selectAll("quart")
                .data(circo_data.features)
                .enter()
                .append("path")
                .attr("d", d3.geoPath().projection(
                    d3.geoIdentity()
                        .reflectY(true)
                        .fitSize([tool_win_width, tool_win_width], circo_data)
                ))
                .style("fill", (d) => colors(d.properties[measure]))
                .style("stroke", "black");
        }

        /* ---------------------------------------------------------------------------------------------
        Minimap toggle
        --------------------------------------------------------------------------------------------- */
        let active_minimap = null;
        function mouseclick(event, d) {
            const circo = normalize_name(d.properties.Name);
            if (active_minimap === circo) {
                d3.select("#minimap_" + active_minimap).style("opacity", 0);
                active_minimap = null;
            }
            else {
                d3.select("#minimap_" + active_minimap).style("opacity", 0);
                d3.select("#minimap_" + circo).style("opacity", 1);
                active_minimap = circo;
            }
        }
        zones.on("click", mouseclick);
    });
}

drawChart_a3_v2();