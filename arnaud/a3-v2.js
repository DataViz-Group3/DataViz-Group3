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

    function getDataRatio(data) {
        console.log(data)
        function getGroupedVal (func, ax) {
            return func(data, function (d){
                return func(d.geometry.coordinates, function (d1) {
                    return d1[0][ax];
                })
            })
        }

        const max_x = getGroupedVal(d3.max, 0);
        const max_y = getGroupedVal(d3.max, 1);
        const min_x = getGroupedVal(d3.min, 0);
        const min_y = getGroupedVal(d3.min, 1);

        return (max_x-min_x) / (max_y-min_y);
    }

    function normalize_name(name) {
        return name.replaceAll(' ', '').replaceAll('.', '');
    }

    d3.json("../data_clean/circo_poli.json").then( function(data) {
        let quart_data = data["Quartiere Name"];
        quart_data = Object.keys(quart_data).map((key) => [key, quart_data[key]]);

        let quart_divs = minimap
            .selectAll("quart_divs")
            .data(quart_data)
            .enter()
            .append("div")
            .style("position", "absolute")
            .attr("id", function(d) { return d[0]; });

        d3.json("../data/poli_sociali.json").then( function(data) {
            function poli_in_circo(circo) {
                return data.features.filter(function(poli) {
                    return circo.includes(poli.properties.nome_quart)
                });
            }

            quart_divs.append("svg")
                .attr("width", tool_win_width)
                .attr("height", tool_win_width)
                .append("g")
                .selectAll("quart")
                .data(function(circo) {
                    return poli_in_circo(circo[1]);
                })
                .join("path")
                .attr("d", d3.geoPath()
                        .projection(
                            d3.geoIdentity()
                                .reflectY(true)
                                .fitSize([tool_win_width, tool_win_width], data)
                        )

                )
                .style("fill", "white")
                .style("stroke", "black");
        })
    })

    let zones;
    d3.json("../data/circoscrizioni.json").then( function(data) {
        const ratio = getDataRatio(data.features);

        // Draw the map
        zones = svg
            .append("g")
            //.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .selectAll(".zones")
            .data(data.features)
            .join("path")
            .attr("class", "zones")
            .attr("id", function (d){ return normalize_name("zone_" + d.properties.nome); } )
            .attr("d", d3.geoPath()
                .projection(
                    d3.geoIdentity()
                        .reflectY(true)
                        .fitSize([main_win_width, main_win_width], data)
                )
            )
            .attr("fill", "white")
            .style("stroke", "black");
    })

    d3.csv("../data_clean/trees_located.csv").then( function(data) {
        const subgroup_data = d3.groups(data, d => d["Circoscrizione Name"]);

        let subgroup_data_dict = {};
        for (let i in subgroup_data) {
            subgroup_data_dict[subgroup_data[i][0]] = subgroup_data[i][1];
        }

        let subgroup_densities = {};
        let max_dens = 0;
        for (let subgroup in subgroup_data_dict) {
            const subgroup_area = subgroup_data_dict[subgroup][0]["Circoscrizione Area"];
            subgroup_densities[subgroup] = (100 * d3.sum(subgroup_data_dict[subgroup], function (d){
                return d["Canopy Cover (m2)"];
            }) / subgroup_area).toFixed(2);
            if (max_dens < subgroup_densities[subgroup]) {
                max_dens = subgroup_densities[subgroup];
            }
        }

        const colors = d3.scaleLinear()
            .domain([0, max_dens])
            .range(["white", "darkgreen"])

        // Three function that change the tooltip when user hover / move / leave a cell
        let mouseover = function (event, d) {
            const circ = d.properties.nome;
            d3.selectAll("#zone_" + normalize_name(circ))
                .style("stroke-width", 3)
                .style("opacity", 1);
            Tooltip.style("opacity", 1);
        }
        let mousemove = function (event, d) {
            const circ = d.properties.nome;
            const density = subgroup_densities[circ];
            const tot_area = subgroup_data_dict[circ][0]["Circoscrizione Area"];
            Tooltip.html(
                circ + "<br>" +
                "Total area: " + tot_area + " m2<br>" +
                density + "% of area covered in trees"
            )
                .style("left", (event.pageX+20) + "px")
                .style("top", (event.pageY) + "px");
        }
        let mouseleave = function (event, d) {
            const circ = d.properties.nome;
            d3.selectAll("#zone_" + normalize_name(circ))
                .style("stroke-width", 1)
                .style("opacity", 0.8);
            Tooltip.style("opacity", 0);
        }

        zones.attr("fill", function (d){
                const circ = d.properties.nome;
                return colors(subgroup_densities[circ]);
            })
            .style("opacity", 0.8)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
    })
}

drawChart_a3_v2();