### Hallazgos (Insights)

#### Proporción de municipios en las diferentes categorías del IRCA

<style>
body {
  font-family: 'Open Sans', sans-serif;
}
#main {
  width: 1000px;
}
.axis .domain {
  display: none;
}
  
</style>
<div id="main">
<svg width="1000" height="500"></svg>
</div>
<script src="https://d3js.org/d3.v4.min.js"></script>
<script>
  
//Dimensiones del objeto SVG y consideraciones de márgenes para el caso particular. 
  
var bottomLabelMargin = 70,
    rightLabelMargin = 300;
  
var svg = d3.select("svg"),
    margin = {top: 20, right: 50, bottom: 50, left: 40},
    width = +svg.attr("width") - margin.left - margin.right - rightLabelMargin,
    height = +svg.attr("height") - margin.top - margin.bottom - bottomLabelMargin,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Selección de la escala del eje x
var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

// Selección de la escala del eje y
var y = d3.scaleLinear()
    .rangeRound([height, 0]);

//Selección de los colores de las barras 
var z = d3.scaleOrdinal()
    .range(["#bd0026","#f03b20","#fd8d3c","#fecc5c","#f1eef6"]);

//Carga de los datos para la visualización. Son datos procesados derivados de los 
d3.csv("datasets/sivicap2015_viz2.csv", function(d, i, columns) {
  for (i = 1, t = 0; i < 6; ++i) t += d[columns[i]] = +d[columns[i]];
  d.total = t;
  return d;
}, function(error, data) {
  if (error) throw error;

  //Selección de las columnas del conjunto de datos que utilizaré
  var keys = data.columns.slice(1, 6);

  //Ordenamiento de los datos según la categoría de sin riesgo para la 
  data.sort(function(a, b) { return b.sinRiesgoPerc - a.sinRiesgoPerc; });
  x.domain(data.map(function(d) { return d.departamento; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
  z.domain(keys);

  
  g.append("g")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data))
    .enter().append("g")
      .attr("fill", function(d) { return z(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.data.departamento); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth())
    .on("mouseover", function() { tooltip.style("display", null); d3.select(this).attr("fill", "#588C73")})
    .on("mouseout", function(d, i) { tooltip.style("display", "none");d3.select(this).attr("fill", function() {
                return "";
            });})
    .on("mousemove", function(d) {
      console.log(d);
      var xPosition = d3.mouse(this)[0]- 10;
      var yPosition = d3.mouse(this)[1]- 10;
      tooltip.attr("transform", "translate(" + (xPosition + 10) + "," + yPosition + ")");
      tooltip.select("text").text("Porcentaje de municipios en esta categoría de riesgo: " + d3.format(".4")(d[1]-d[0]) + "%");
    })
  	.attr("class", "bar");

    
  //Definiciones del eje X con rotación de etiquetas.
  g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
    	.selectAll("text")
  		.attr("transform", "rotate(45)")
      .attr("text-anchor", "start")
  		.attr("font-size", "12");
  
  //Definiciones del eje Y: Etiquetas, rótulo del eje y tamaño.
  g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
  		.text("Porcentaje de municipios por rangos de riesgo del IRCA (%)")
  		.attr("font-size", 12)
    	.attr("text-anchor", "middle")
  		.attr("transform", "rotate(-90)")
  		.attr("x", 0 - (height/2))
  		.attr("y", 5 - margin.left);

  //Definiciones de las convenciones, fuente y posición
  var legend = g.append("g")
      .attr("font-family", "helvetica")
      .attr("font-size", 12)
      .attr("text-anchor", "start")
    .selectAll("g")
    .data(keys.slice())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 26 + ")"; });

  legend.append("rect")
      .attr("x", width - 10)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

  //Nombrando las convenciones
  legend.append("text")
      .attr("x", width + 20)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { t = ""; if(d == "inviablePerc"){ t = "Sanitariamente inviable"} else if (d == "altoPerc"){ t = "Riesgo alto"} else if (d == "medioPerc"){ t = "Riesgo medio"} else if (d == "bajoPerc"){ t = "Riesgo bajo"} else {t = "Sin riesgo"}; return t });
});

  //Preparación de la forma de los tooltips
  var tooltip = svg.append("g")
    .attr("class", "tooltip")
    .style("display", "none");
      
  //Creación del rectángulo del tooltip
  tooltip.append("rect")
    .attr("width", 360)
    .attr("height", 22)
    .attr("fill", "white")
    .style("opacity", 0.4);

  //Justificación del texto en el rectángulo
  tooltip.append("text")
    .attr("x", 2)
    .attr("dy", "1.2em")
    .style("text-anchor", "center")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");

</script>

Se puede observar que...
