d3.queue()
    .defer(d3.csv, 'datasets/data.csv', function (d) {
        return {
            name: d.state,
            obesity: +d.obesity,
            income: +d.income
        }
    })
    .defer(d3.json, 'datasets/us-states.json')
    .awaitAll(initialize)

var color = d3.scaleThreshold()
    .domain([0.24, 0.28, 0.32])
    .range(['#fbb4b9', '#f768a1', '#c51b8a', '#7a0177'])

function initialize(error, results) {
    if (error) { throw error }

    var data = results[0]
    var features = results[1].features

    var components = [
        choropleth(features),
        scatterplot(onBrush)
    ]

    function update() {
        components.forEach(function (component) { component(data) })
    }

    function onBrush(x0, x1, y0, y1) {
        var clear = x0 === x1 || y0 === y1
        data.forEach(function (d) {
            d.filtered = clear ? false
                : d.income < x0 || d.income > x1 || d.obesity < y0 || d.obesity > y1
        })
        update()
    }

    update()
}

function scatterplot(onBrush) {
    var margin = { top: 10, right: 15, bottom: 40, left: 75 }
    var width = 480 - margin.left - margin.right
    var height = 350 - margin.top - margin.bottom

    var x = d3.scaleLinear()
        .range([0, width])
    var y = d3.scaleLinear()
        .range([height, 0])

    var xAxis = d3.axisBottom()
        .scale(x)
        .tickFormat(d3.format('$.2s'))
    var yAxis = d3.axisLeft()
        .scale(y)
        .tickFormat(d3.format('.0%'))

    var brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on('start brush', function () {
            var selection = d3.event.selection

            var x0 = x.invert(selection[0][0])
            var x1 = x.invert(selection[1][0])
            var y0 = y.invert(selection[1][1])
            var y1 = y.invert(selection[0][1])

            onBrush(x0, x1, y0, y1)
        })

    var svg = d3.select('#scatterplot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    var bg = svg.append('g')
    var gx = svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
    var gy = svg.append('g')
        .attr('class', 'y axis')

    gx.append('text')
        .attr('x', width)
        .attr('y', 35)
        .style('text-anchor', 'end')
        .style('fill', '#000')
        .style('font-weight', 'bold')
        .text('Variable 1 (Magnitud)')

    gy.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', 0)
        .attr('y', -40)
        .style('text-anchor', 'end')
        .style('fill', '#000')
        .style('font-weight', 'bold')
        .text('Variable 2 (Porcentaje)')

    svg.append('g')
        .attr('class', 'brush')
        .call(brush)

    return function update(data) {
        x.domain(d3.extent(data, function (d) { return d.income })).nice()
        y.domain(d3.extent(data, function (d) { return d.obesity })).nice()

        gx.call(xAxis)
        gy.call(yAxis)

        var bgRect = bg.selectAll('rect')
            .data(d3.pairs(d3.merge([[y.domain()[0]], color.domain(), [y.domain()[1]]])))
        bgRect.exit().remove()
        bgRect.enter().append('rect')
            .attr('x', 0)
            .attr('width', width)
            .merge(bgRect)
            .attr('y', function (d) { return y(d[1]) })
            .attr('height', function (d) { return y(d[0]) - y(d[1]) })
            .style('fill', function (d) { return color(d[0]) })

        var circle = svg.selectAll('circle')
            .data(data, function (d) { return d.name })
        circle.exit().remove()
        circle.enter().append('circle')
            .attr('r', 4)
            .style('stroke', '#fff')
            .merge(circle)
            .attr('cx', function (d) { return x(d.income) })
            .attr('cy', function (d) { return y(d.obesity) })
            .style('fill', function (d) { return color(d.obesity) })
            .style('opacity', function (d) { return d.filtered ? 0.5 : 1 })
            .style('stroke-width', function (d) { return d.filtered ? 1 : 2 })
    }
}

function choropleth(features) {
    var width = 480
    var height = 350

    var projection = d3.geoAlbersUsa()
        .scale([width * 1.25])
        .translate([width / 2, height / 2])

    var path = d3.geoPath().projection(projection)

    var svg = d3.select('#choropleth')
        .append('svg')
        .attr('width', width)
        .attr('height', height)

    svg.selectAll('path')
        .data(features)
        .enter()
        .append('path')
        .attr('d', path)
        .style('stroke', '#fff')
        .style('stroke-width', 1)

    return function update(data) {
        svg.selectAll('path')
            .data(data, function (d) { return d.name || d.properties.name })
            .style('fill', function (d) { return d.filtered ? '#ddd' : color(d.obesity) })
    }
}
