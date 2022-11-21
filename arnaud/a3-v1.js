function drawChart_a3_v1() {
    const div_id = "#a3_v1";

    //Width and height
    let width = 1000;
    let height = 2000;

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

        console.log((max_x-min_x));
        console.log((max_y-min_y));

        const ratio = (max_x-min_x) / (max_y-min_y);
        console.log(ratio)


        // Map and projection
        const projection = d3.geoIdentity()
            .reflectY(true)
            .fitSize([width, width*ratio], data);

        // Draw the map
        d3.select(div_id)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .selectAll("path")
            .data(data.features)
            .join("path")
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .attr("fill", "#69b3a2")
            .style("stroke", "#fff")

    })
}
drawChart_a3_v1();