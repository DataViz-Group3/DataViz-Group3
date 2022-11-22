function drawChart_a3_v5() {
    const div_id = "#a3_v5";

    //Width and height
    let width = 1000;
    let height = 2000;

    let normalize_name = function (name) {
        return name.replaceAll(' ', '').replaceAll('.', '');
    }

    let zones;

    // Load external data and boot
    d3.json("../data/circoscrizioni.json").then( function(data) {

        function getGroupedVal (func, ax) {
            return func(data.features, function (d){
                return func(d.geometry.coordinates, function (d1) {
                    return d1[0][ax];
                })
            })
        }

        const max_x = getGroupedVal(d3.max, 0);
        const max_y = getGroupedVal(d3.max, 1);
        const min_x = getGroupedVal(d3.min, 0);
        const min_y = getGroupedVal(d3.min, 1);

        const ratio = (max_x-min_x) / (max_y-min_y);

        // Map and projection
        const projection = d3.geoIdentity()
            .reflectY(true)
            .fitSize([width, width*ratio], data);

        // Draw the map
        zones = d3.select(div_id)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .selectAll("path")
            .data(data.features)
            .join("path")
            .attr("id", function (d){ return normalize_name("zone_" + d.properties.nome); } )
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .attr("fill", "white")
            .style("stroke", "black")

    })

    d3.csv("../data_clean/trees_located.csv").then( function(data) {
        const subgroup_data = d3.groups(data, d => d["Circoscrizione Name"]);
        const max_count = d3.max(subgroup_data.map(d => d[1].length));

        let subgroup_data_dict = {}
        for (let i in subgroup_data) {
            subgroup_data_dict[subgroup_data[i][0]] = subgroup_data[i][1];
        }

        const colors = d3.scaleLinear()
            .domain([max_count, 0])
            .range(["white", "darkgreen"])

        zones.attr("fill", function (d){
            console.log(subgroup_data_dict[d.properties.nome]);
            return colors(subgroup_data_dict[d.properties.nome].length);
        })
    })


}
drawChart_a3_v1();

function drawChart_a3_v2() {
    const div_id = "#a3_v2";

    //Width and height
    let width = 1000;
    let height = 2000;

    let normalize_name = function (name) {
        return name.replaceAll(' ', '').replaceAll('.', '');
    }

    let zones;

    // Load external data and boot
    d3.json("../data/circoscrizioni.json").then( function(data) {

        function getGroupedVal (func, ax) {
            return func(data.features, function (d){
                return func(d.geometry.coordinates, function (d1) {
                    return d1[0][ax];
                })
            })
        }

        const max_x = getGroupedVal(d3.max, 0);
        const max_y = getGroupedVal(d3.max, 1);
        const min_x = getGroupedVal(d3.min, 0);
        const min_y = getGroupedVal(d3.min, 1);

        const ratio = (max_x-min_x) / (max_y-min_y);

        // Map and projection
        const projection = d3.geoIdentity()
            .reflectY(true)
            .fitSize([width, width*ratio], data);

        // Draw the map
        zones = d3.select(div_id)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .selectAll("path")
            .data(data.features)
            .join("path")
            .attr("id", function (d){ return normalize_name("zone_" + d.properties.nome); } )
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .attr("fill", "white")
            .style("stroke", "black")

    })

    d3.csv("../data_clean/trees_located.csv").then( function(data) {
        const subgroup_data = d3.groups(data, d => d["Circoscrizione Name"]);
        const max_count = d3.max(subgroup_data.map(d => d[1].length));

        let subgroup_data_dict = {}
        for (let i in subgroup_data) {
            subgroup_data_dict[subgroup_data[i][0]] = subgroup_data[i][1];
        }

        const colors = d3.scaleLinear()
            .domain([max_count, 0])
            .range(["white", "darkgreen"])

        zones.attr("fill", function (d){
            console.log(subgroup_data_dict[d.properties.nome]);
            return colors(subgroup_data_dict[d.properties.nome].length);
        })
    })


}
drawChart_a3_v5();