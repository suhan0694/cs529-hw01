async function initD3GunMap() {
    let cities = await d3.csv('../resource/cities@1.csv')

    const statesJSON = await d3.json('../resource/freq2_by_state_updated.json')

    const gunEvents = await d3.csv('../resource/gunEvents.csv')

    const gunFreq = await d3.csv('../resource/frequency2.csv')

    const usData = await d3.json(
        'https://unpkg.com/us-atlas@3/counties-10m.json'
    )

    const lowColor = '#fee0d2'
    const highColor = '#de2d26'

    $('#hello').on('click', function () {})

    const svg = d3.select('#map')

    const projection = d3.geoAlbersUsa()
    const path = d3.geoPath(projection)

    const state = topojson.feature(usData, usData.objects.states)

    //Get total Deaths
    let totalDeaths = []
    gunFreq.forEach((data) => totalDeaths.push(data.total_deaths))

    //Get Range for Males and Female Deaths
    let deathPerGender = []
    statesJSON.forEach((data) => {
        deathPerGender.push(data.males)
        deathPerGender.push(data.females)
    })

    //Get Range for per state deaths
    let stateDeaths = []
    statesJSON.forEach((data) => stateDeaths.push(data.males + data.females))

    const rScale = d3.scaleLinear().domain(d3.extent(totalDeaths)).range([1, 4])

    const spikeScale = d3
        .scaleLinear()
        .domain(d3.extent(totalDeaths))
        .range([1, 50])

    const barScale = d3
        .scaleLinear()
        .domain(d3.extent(deathPerGender))
        .range([5, 100])

    var choloroScale = d3
        .scaleLinear()
        .domain(d3.extent(stateDeaths))
        .range([lowColor, highColor])

    const spike = (length, width = 7) =>
        `M${-width / 2},0L0,${-length}L${width / 2},0`

    // add a legend
    const w = 140,
        h = 300

    const key = d3
        .select('body')
        .append('svg')
        .attr('width', w)
        .attr('height', h)
        .attr('class', 'legend')

    const legend = key
        .append('defs')
        .append('svg:linearGradient')
        .attr('id', 'gradient')
        .attr('x1', '100%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%')
        .attr('spreadMethod', 'pad')

    legend
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', highColor)
        .attr('stop-opacity', 1)

    legend
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', lowColor)
        .attr('stop-opacity', 1)

    key.append('rect')
        .attr('width', w - 100)
        .attr('height', h)
        .style('fill', 'url(#gradient)')
        .attr('transform', 'translate(0,10)')

    const y = d3.scaleLinear().range([h, 0]).domain([5, 1500])

    const yAxis = d3.axisRight(y)

    key.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(41,10)')
        .call(yAxis)

    const spikeTip = d3
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

    const maleBarTip = d3
        .tip()
        .attr('class', 'd3-tip')
        .html(function (d) {
            return `<strong>State:</strong> <span style='color:red'>
                ${d.state}
                </span><br/>
                <strong>Male Deaths:</strong> <span style='color:red; margin-top: 5px'>
                ${d.males}
                </span><br/>
                `
        })

    const femaleBarTip = d3
        .tip()
        .attr('class', 'd3-tip')
        .html(function (d) {
            return `<strong>State:</strong> <span style='color:red'>
                ${d.state}
                </span><br/>
                <strong>Female Deaths:</strong> <span style='color:red; margin-top: 5px'>
                ${d.females}
                </span>
                `
        })

    var stateColored = svg.append('g')

    // load and display the World

    stateColored
        .selectAll('path')
        .data(state.features)
        .join('path')
        .attr('d', (f) => path(f))
        .attr('stroke', 'grey')
        .attr('fill', (d) => {
            const stateName = d.properties.name
            const stateObj = statesJSON.filter(
                (state) => state.NAME == stateName
            )
            return stateObj[0]
                ? choloroScale(stateObj[0].males + stateObj[0].females)
                : lowColor
        })
        .attr('stroke-width', 1)
        .attr('id', (d) => `state${d.id}`)
        .on('click', (d) => colorSvg(d))
    // .on('mouseover', (state, d) => {
    //     d3.select(`#state${state.id}`).attr('fill', 'red')
    //     //d3.selectAll('.states').attr('fill', 'red')
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

    // var spikeGroup = svg.append('g')

    // spikeGroup
    //     .attr('fill', 'red')
    //     .attr('fill-opacity', 0.3)
    //     .attr('stroke', 'red')
    //     .selectAll('path')
    //     .data(gunFreq)
    //     .join('path')
    //     .attr(
    //         'transform',
    //         (d) =>
    //             `translate(${projection([d.lng, d.lat])[0]}, ${
    //                 projection([d.lng, d.lat])[1]
    //             })`
    //     )
    //     .attr('d', (d) => spike(spikeScale(d.total_deaths)))
    //     .on('mouseover', spikeTip.show)
    //     .on('mouseout', spikeTip.hide)

    var maleGroup = svg.append('g')

    maleGroup
        .attr('fill', 'red')
        .attr('fill-opacity', 0.3)
        .attr('stroke', 'red')
        .attr('id', 'spikePath')
        .selectAll('path')
        .data(statesJSON)
        .join('rect')
        .attr('height', function (d) {
            return barScale(d.males)
        })
        .attr('width', 10)
        .attr('y', function (d) {
            return -barScale(d.males)
        })
        .attr('class', 'bars')
        .style('fill', '#2959c9')
        .style('stroke', 'white')
        .style('stroke-width', 2)
        .attr(
            'transform',
            (d) =>
                `translate(${projection([d.lng, d.lat])[0] - 5}, ${
                    projection([d.lng, d.lat])[1]
                })`
        )
        .attr('d', (d) => spike(spikeScale(d.males)))
        .on('mouseover', maleBarTip.show)
        .on('mouseout', maleBarTip.hide)

    var femaleGroup = svg.append('g')

    femaleGroup
        .attr('fill', 'red')
        .attr('fill-opacity', 0.3)
        .attr('stroke', 'red')
        .attr('id', 'spikePath')
        .selectAll('path')
        .data(statesJSON)
        .join('rect')
        .attr('height', function (d) {
            return barScale(d.females)
        })
        .attr('width', 10)
        .attr('y', function (d) {
            return -barScale(d.females)
        })
        .attr('class', 'bars')
        .style('fill', '#c52d31')
        .style('stroke', 'white')
        .style('stroke-width', 2)
        .attr(
            'transform',
            (d) =>
                `translate(${projection([d.lng, d.lat])[0] + 5}, ${
                    projection([d.lng, d.lat])[1]
                })`
        )
        .attr('d', (d) => spike(spikeScale(d.females)))
        .on('mouseover', femaleBarTip.show)
        .on('mouseout', femaleBarTip.hide)

    var zoom = d3
        .zoom()
        .scaleExtent([1, 8])
        .on('zoom', function () {
            stateColored.attr('transform', d3.event.transform)
            maleGroup.attr('transform', d3.event.transform)
            femaleGroup.attr('transform', d3.event.transform)
        })

    var colorSvg = (data) => {
        const man = document.getElementById('man')
        const female = document.getElementById('female')
        const oldMan = document.getElementById('oldMan')
        const oldFemale = document.getElementById('oldFemale')
        const teens = document.getElementById('teens')
        // Get the SVG document inside the Object tag
        const svgDocMan = man.contentDocument
        const svgDocFemale = female.contentDocument
        const svgDocOldMan = oldMan.contentDocument
        const svgDocOldFemale = oldFemale.contentDocument
        const svgDocTeens = teens.contentDocument
        // Get one of the SVG items by ID;
        const svgItemMan = svgDocMan.getElementById('man_svg')
        const svgItemFemale = svgDocFemale.getElementById('female_svg')
        const svgItemOldMan = svgDocOldMan.getElementById('oldMale_svg')
        const svgItemOldFemale = svgDocOldFemale.getElementById('oldFemale_svg')
        const svgItemTeens = svgDocTeens.getElementById('teen_svg')
        // Set the colour to something else
        svgItemMan.setAttribute('fill', 'lime')
        svgItemFemale.setAttribute('fill', 'lime')
        svgItemOldMan.setAttribute('fill', 'lime')
        svgItemOldFemale.setAttribute('fill', 'lime')
        svgItemTeens.setAttribute('fill', 'lime')
    }

    svg.call(zoom)
    svg.call(spikeTip)
    svg.call(maleBarTip)
    svg.call(femaleBarTip)
}
