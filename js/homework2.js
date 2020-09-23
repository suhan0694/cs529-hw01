async function initD3GunMap() {
    let cities = await d3.csv('../resource/cities@1.csv')

    const svg = d3.select('#map')

    const projection = d3.geoAlbersUsa()
    const path = d3.geoPath(projection)

    const usData = await d3.json(
        'https://unpkg.com/us-atlas@3/counties-10m.json'
    )
    const state = topojson.feature(usData, usData.objects.states)
    console.log(state)

    const gunEvents = await d3.csv('../resource/gunEvents.csv')

    const gunFreq = await d3.csv('../resource/frequency2.csv')
    let totalDeaths = []
    gunFreq.forEach((data) => totalDeaths.push(data.total_deaths))
    console.log(totalDeaths)

    const rScale = d3.scaleLinear().domain(d3.extent(totalDeaths)).range([1, 4])

    const spikeScale = d3
        .scaleLinear()
        .domain(d3.extent(totalDeaths))
        .range([1, 50])

    const spike = (length, width = 7) =>
        `M${-width / 2},0L0,${-length}L${width / 2},0`

    const legend = svg
        .append('g')
        .attr('fill', '#777')
        .attr('text-anchor', 'middle')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .selectAll('g')
        .data(spikeScale.ticks(4).reverse())
        .join('g')
        .attr('transform', (d, i) => `translate(${900 - (i + 1) * 18},500)`)

    legend
        .append('path')
        .attr('fill', 'red')
        .attr('fill-opacity', 0.3)
        .attr('stroke', 'red')
        .attr('d', (d) => spike(spikeScale(d)))

    legend
        .append('text')
        .attr('dy', '1.3em')
        .text(spikeScale.tickFormat(4, 's'))

    const tip = d3
        .tip()
        .attr('class', 'd3-tip')
        .html(function (d) {
            return `<strong>Total Deaths:</strong> <span style='color:red'>
                ${d.total_deaths}
                </span><br/>
                <strong>Male Deaths:</strong> <span style='color:red; margin-top: 5px'>
                ${d.males}
                </span><br/>
                <strong>Female Deaths:</strong> <span style='color:red; margin-top: 5px'>
                ${d.females}
                </span>
                `
        })

    var g = svg.append('g')

    // load and display the World

    g.selectAll('path')
        .data(state.features)
        .join('path')
        .attr('d', (f) => path(f))
        .attr('stroke', 'grey')
        .attr('fill', 'none')
        .attr('stroke-width', 1)
        .attr('id', (d) => `state${d.id}`)
    // .on('mouseover', (state, d) => {
    //     d3.select(`#state${state.id}`).attr('fill', 'red')
    // })
    // .on('mouseout', (state, d) => {
    //     d3.select(`#state${state.id}`).attr('fill', 'none')
    // })

    // g.selectAll('circle')
    //     .data(gunFreq)
    //     .join('circle')
    //     .attr('cx', (d) => projection([d.lng, d.lat])[0])
    //     .attr('cy', (d) => projection([d.lng, d.lat])[1])
    //     .attr('r', (d) => rScale(d.total_deaths))
    //     .attr('fill', (d) => (d.gender === 'M' ? '#2959c9' : '#c52d31'))
    var g2 = svg.append('g')

    g2.attr('fill', 'red')
        .attr('fill-opacity', 0.3)
        .attr('stroke', 'red')
        .selectAll('path')
        .data(gunFreq)
        .join('path')
        .attr(
            'transform',
            (d) =>
                `translate(${projection([d.lng, d.lat])[0]}, ${
                    projection([d.lng, d.lat])[1]
                })`
        )
        .attr('d', (d) => spike(spikeScale(d.total_deaths)))
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)

    var zoom = d3
        .zoom()
        .scaleExtent([1, 8])
        .on('zoom', function () {
            g.attr('transform', d3.event.transform)
            g2.attr('transform', d3.event.transform)
        })

    svg.call(zoom)
    svg.call(tip)
}
