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
        const max_dens = d3.max(data.features, (d) => d.properties[measure]);
        const max_dens_quart = d3.max(data.features,
            (d) => d3.max(d.properties['Quartiere'].features,
                (d) => d.properties[measure]));
        const max_measure = max_dens > max_dens_quart? max_dens: max_dens_quart;

        const colors = d3.scaleThreshold()
            .domain([
                0.05,
                0.1,
                0.2,
                0.5,
                1.5,
                3,
                max_measure
            ])
            .range(d3.schemeGreens[7])

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
            const cover = Math.round(d.properties["Canopy Cover (m2)"] * 100) / 100;
            const density = Math.round(d.properties["Canopy Cover Density (perc)"] * 100) / 100;
            const tot_area = Math.round(d.properties["Area"] / 10000) / 100;
            Tooltip.html(
                circ + "<br>" +
                "Total area: " + tot_area + " km2<br>" +
                density + "% of area covered in trees<br>" +
                cover + " m2 of canopy cover"
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
        const circos = data.features.map((d) => [d.properties.Name, d]);
        for (let i in circos){
            const circo_name = circos[i][0];
            const circo_data = circos[i][1].properties['Quartiere'];

            const mini_projection = d3.geoIdentity()
                .reflectY(true)
                .fitSize([tool_win_width, tool_win_width], circo_data);

            let minimap_svg = minimap.append("div")
                .style("opacity", 0)
                .style("pointer-events", "none")
                .style("position", "absolute")
                .attr("class", "minimap")
                .attr("id", normalize_name(circo_name))
                .append("svg")
                .attr("width", tool_win_width)
                .attr("height", tool_win_width);

            let minimap_zones = minimap_svg.append("g")
                .selectAll("quart")
                .data(circo_data.features)
                .enter()
                .append("path")
                .attr("class", "mini_zones")
                .attr("id", (d) => normalize_name(d.properties.Name) )
                .attr("d", d3.geoPath().projection(mini_projection))
                .style("fill", (d) => colors(d.properties[measure]))
                .style("stroke", "black");

            /* ---------------------------------------------------------------------------------------------
            Minimap Border
            --------------------------------------------------------------------------------------------- */
            const circo_features = data.features;
            const circo_border = circo_features.filter((d) => d.properties.Name === circo_name);
            const filtered_data = {
                "features": circo_border,
                "type": "FeatureCollection"
            };
            const border_projection = d3.geoIdentity()
                .reflectY(true)
                .fitSize([tool_win_width, tool_win_width], filtered_data);

            minimap_svg.append("g")
                .selectAll("border")
                .data(circo_border)
                .enter()
                .append("path")
                .attr("d", d3.geoPath().projection(border_projection))
                .style("pointer-events", "none")
                .style("fill", "none")
                .style("stroke", "black")
                .style("stroke-width",3);

            /* ---------------------------------------------------------------------------------------------
            Minimap Hover functions
            --------------------------------------------------------------------------------------------- */
            function mouseover_mini(event, d) {
                const quart = d.properties.Name;
                d3.selectAll(".mini_zones").style("opacity", 0.8);
                d3.selectAll("#" + normalize_name(quart) + ".mini_zones")
                    .style("stroke-width", 3)
                    .style("opacity", 1);
                Tooltip.style("opacity", 1);
            }
            minimap_zones.on("mouseover", mouseover_mini);

            function mousemove_mini(event, d) {
                const quart = d.properties.Name;
                const cover = Math.round(d.properties["Canopy Cover (m2)"] * 100) / 100;
                const density = Math.round(d.properties["Canopy Cover Density (perc)"] * 100) / 100;
                const tot_area = Math.round(d.properties["Area"] / 10000) / 100;
                Tooltip.html(
                    quart + "<br>" +
                    "Total area: " + tot_area + " km2<br>" +
                    density + "% of area covered in trees<br>" +
                    cover + " m2 of canopy cover"
                )
                    .style("left", (event.pageX+20) + "px")
                    .style("top", (event.pageY) + "px");
            }
            minimap_zones.on("mousemove", mousemove_mini);

            function mouseleave_mini(event, d) {
                const quart = d.properties.Name;
                d3.selectAll(".mini_zones").style("opacity", 1);
                d3.selectAll("#" + normalize_name(quart) + ".mini_zones")
                    .style("stroke-width", 1)
                    .style("opacity", 0.8);
                Tooltip.style("opacity", 0);
            }
            minimap_zones.on("mouseleave", mouseleave_mini);


        }

        /* ---------------------------------------------------------------------------------------------
        Minimap toggle
        --------------------------------------------------------------------------------------------- */
        let active_minimap = null;
        function mouseclick(event, d) {
            const circo = normalize_name(d.properties.Name);
            if (active_minimap === circo) {
                d3.select("#" + active_minimap + ".minimap")
                    .style("opacity", 0)
                    .style("pointer-events", "none");
                active_minimap = null;
            }
            else {
                d3.select("#" + active_minimap + ".minimap")
                    .style("opacity", 0)
                    .style("pointer-events", "none");
                d3.select("#" + circo + ".minimap")
                    .style("opacity", 1)
                    .style("pointer-events", "auto");
                active_minimap = circo;
            }
        }
        zones.on("click", mouseclick);

        /* ---------------------------------------------------------------------------------------------
        Legend
        --------------------------------------------------------------------------------------------- */
        /*var legend = svg.selectAll('g.legendEntry')
            .data(colors.range())
            .enter()
            .append('g').attr('class', 'legendEntry');

        legend
            .append('rect')
            .attr("x", 120)
            .attr("y", function(d, i) {
                return 30+ i * 30;
            })
            .attr("width", 20)
            .attr("height", 20)
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("fill", function(d){return d;});
        //the data objects are the fill colors

        legend
            .append('text')
            .attr("x", 150) //leave 5 pixel space after the <rect>
            .attr("y", function(d, i) {
                return 30+ i * 30;
            })
            .attr("dy", "0.8em") //place text one line *below* the x,y point
            .text(function(d,i) {
                var extent = colors.invertExtent(d);
                //extent will be a two-element array, format it however you want:
                var format = d3.format("0.2f");
                if( i == 0 ) return "< " + format(+extent[1]);
                if(i == 6) return ">" + format(+extent[0]);
                return format(+extent[0]) + " - " + format(+extent[1]);
            });
        legend.append('text')
            .attr("x", 120)
            .attr("y", 20)
            .text("Tree Abundance")

         */

    });
}

drawChart_a3_v2();