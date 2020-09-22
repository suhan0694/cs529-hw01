async function initD3GunMap() {
    const width = 1000
    const height = 500

    let us = await d3.json('https://unpkg.com/us-atlas@3/counties-10m.json')
    let cities = await d3.csv('../resource/cities@1.csv')
    //     let gunEvents = await d3.csv("../resource/gunEvents.csv");
    //     console.log(gunEvents);
    //     console.log(cities)
    let states = topojson.feature(us, us.objects.states)
    //     let counties = topojson.feature(us, us.objects.counties);

    //     //Zoom Feature
    //     const zoom = d3.zoom()
    //     .scaleExtent([1, 8])
    //     .on("zoom",zoomed);

    //     //const svg = d3.select("#map");
    //     const svg = d3.select('body').append('svg')
    //       .attr('width', 1000)
    //       .attr('height', 600);

    //     const g = svg.append("g")

    //     svg.call(zoom);

    //     svg.selectAll('.states')
    //       .data(states.features)
    //       .join('path')
    //       .attr('d', f => path(f))
    //       .attr('stroke', 'grey')
    //       .attr('fill', 'none')
    //       .attr('stroke-width', 1);

    //     svg.selectAll('circle')
    //       .data(gunEvents)
    //       .join('circle')
    //       .attr('cx', d => projection([d.lng, d.lat])[0])
    //       .attr('cy', d => projection([d.lng, d.lat])[1])
    //       .attr('r', 1)
    //       .attr('fill', 'black')

    //     function zoomed()  {
    //         g
    //         .selectAll('path') // To prevent stroke width from scaling
    //         .attr('transform', d3.event.transform);
    //      }

    //      var svg = d3.select("body").append("svg")
    //     .attr("width", width)
    //     .attr("height", height);

    // var path = d3.geoPath()
    //     .projection(projection);

    // var g = svg.append("g");

    // // load and display the World
    // d3.csv("../resource/cities@1.csv").then(function(cities) {

    //     svg.selectAll('.states')
    //           .data(states.features)
    //           .join('path')
    //           .attr('d', f => path(f))
    //           .attr('stroke', 'grey')
    //           .attr('fill', 'none')
    //           .attr('stroke-width', 1);

    //         svg.selectAll('circle')
    //           .data(cities)
    //           .join('circle')
    //           .attr('cx', d => projection([d.x, d.y])[0])
    //           .attr('cy', d => projection([d.x, d.y])[1])
    //           .attr('r', 6)
    //           .attr('fill', 'black')
    // });

    // var zoom = d3.zoom()
    //       .scaleExtent([1, 8])
    //       .on('zoom', function() {
    //           g.selectAll('path')
    //            .attr('transform', d3.event.transform);
    // });

    // svg.call(zoom);

    // var projection = d3.geoMercator()
    //     .center([0, 5 ])
    //     .scale(150)
    //     .rotate([-180,0]);

    var svg = d3
        .select('body')
        .append('svg')
        .attr('width', width)
        .attr('height', height)

    const projection = d3.geoAlbersUsa()
    const path = d3.geoPath(projection)

    const usData = await d3.json(
        'https://unpkg.com/us-atlas@3/counties-10m.json'
    )
    const gunEvents = await d3.csv('../resource/gunEvents.csv')

    var g = svg.append('g')

    // load and display the World

    g.selectAll('path')
        .data(topojson.feature(usData, usData.objects.states).features)
        .enter()
        .append('path')
        .attr('d', (f) => path(f))
        .attr('stroke', 'grey')
        .attr('fill', 'none')
        .attr('stroke-width', 1)

    g.selectAll('circle')
        .data(gunEvents)
        .join('circle')
        .attr('cx', (d) => projection([d.lng, d.lat])[0])
        .attr('cy', (d) => projection([d.lng, d.lat])[1])
        .attr('r', 1)
        .attr('fill', 'black')

    var zoom = d3
        .zoom()
        .scaleExtent([1, 8])
        .on('zoom', function () {
            g.selectAll('path').attr('transform', d3.event.transform)
            g.selectAll('circle').attr('transform', d3.event.transform)
        })

    svg.call(zoom)
}
