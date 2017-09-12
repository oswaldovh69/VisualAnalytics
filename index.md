## ¿Cuál es el panorama de la calidad de agua en los departamentos de Colombia?

### Contexto: Características Calidad del Agua – SIVICAP 2015

El Instituto Nacional de Salud de Colombia (INS), dando cumplimiento a la normatividad establecida en el Decreto 1575 de 2007, creó el Sistema de Información de la Vigilancia de la Calidad del Agua para Consumo Humano (SIVICAP) que monitorea parámetros fisicoquímicos y microbiológicos en los suministros de agua potable de los municipios de Colombia.

En el sitio web de [Datos abiertos de Colombia](https://www.datos.gov.co/Salud-y-Protecci-n-Social/Caracter-sticas-Calidad-del-Agua-SIVICAP/jjzc-8w82) el INS depositó las mediciones obtenidas para 1019 municipios colombianos de todos los departamentos y les asignó un puntaje consolidado en la escala del Índice del Riesgo de la Calidad del Agua para Consumo Humano (IRCA) en el que se consideran [los siguientes rangos](http://www.aguasyaguas.com.co/calidad_agua/index.php/es/home-es-es/10-contenido/10-irca-definicion-analisis-e-interpretacion):

| Clasificación IRCA (%)       | Nivel de riesgo           | Consideraciones                                          |
|:----------------------------:|:-------------------------:|:---------------------------------------------------------|
| 70.1 - 100                   | Inviable sanitariamente   | Agua **NO** apta para el consumo humano. Requiere vigilancia máxima, especial y detallada  |
| 35.1 - 70                    | Alto                      | Agua **NO** apta para el consumo humano. Requiere vigilancia especial.|
| 14.1 - 35                    | Medio                     | Agua **NO** apta para el consumo humano. Gestión directa del prestador.    |
| 5.1 - 14                     | Bajo                      | Agua **NO** apta para el consumo humano. Susceptible de mejoramiento|
| 0 - 5                        | Sin riesgo                | Agua **APTA** para el consumo humano. Continuar vigilancia|

### Misión
En este trabajo busco explorar los datos para entender la distribución actual de este índice de calidad del agua en los diferentes departamentos del país.

#### Hallazgos (Insights)

##### Departamentos ordenados por el riesgo mediano

<style>
body {
  font-family: 'Open Sans', sans-serif;
}
#main2 {
  width: 1000px;
}
.axis .domain {
  display: none;
}
  
.toolTip {
  pointer-events: none;
	position: absolute;
  display: none;
  min-width: 50px;
  height: auto;
  background: none repeat scroll 0 0 #ffffff;
  padding: 9px 14px 6px 14px;
  border-radius: 4px;
  text-align: left;
  line-height: 1.3;
  color: #5B6770;
  box-shadow: 0px 3px 9px rgba(0, 0, 0, .15);
}
.toolTip:after {
  content: "";
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 12px solid white;
  position: absolute;
  bottom: -10px;
  left: 50%;
  margin-left: -12px;
}  
.toolTip span {
	font-weight: 500;
  color: #081F2C;
  
</style>
<div id="main2">
<svg width="1000" height="500"></svg>
</div>
<script src="https://d3js.org/d3.v4.min.js"></script>
<script>
  
    //Dimensiones del objeto SVG y consideraciones de márgenes para el caso particular. 
  
var svg = d3.select("svg"),
    margin = {top: 20, right: 300, bottom: 130, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    
    
    // Selección de la escala del eje x
var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

// Selección de la escala del eje y
var y = d3.scaleLinear()
    .rangeRound([height, 0]);
    
    
    //Carga de los datos para la visualización. Son datos procesados derivados de los originales.
d3.csv("datasets/sivicap2015_viz1.csv", function(error, data) {
    if (error) throw error;
  
  
   //Selección de las columnas del conjunto de datos que utilizaré, establecimiento de los rangos máximos y ordenamiento de los datos.
  
  var maximumIRCAValue = 100;
  
		data.sort(function(a, b) { return a.IRCAPromedio - b.IRCAPromedio});
    x.domain(data.map(function(d) { return d.departamento; }));
    y.domain([0, maximumIRCAValue]).nice();

  
	//Establecer el eje X  
      g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
  				.attr("transform", "rotate(45)")
      		.attr("text-anchor", "start")
  				.attr("font-size", "13");
  
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
        .text("Mediana del IRCA (%)")
        .attr("font-size", 13)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (height/2))
        .attr("y", 7 - margin.left);
  
  g.selectAll(".bar")
      	.data(data)
      .enter().append("rect")
  			.attr("class", "barra")
        .attr("x", function(d) { return x(d.departamento); })
        .attr("y", function(d) { return y(d.IRCAPromedio); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.IRCAPromedio); })
  			.attr("fill", "#8787A3")
        .on("mousemove", function(d){
    				d3.select(this).attr("fill", "#588C73");
    				tooltip
              .style("left", d3.event.pageX - 50 + "px")
              .style("top", d3.event.pageY - 70 + "px")
              .style("display", "inline-block")
      				.html("Mediana del departamento: " + d3.format(".3")(d.IRCAPromedio) +"%" + "<br><span>" + "Municipio con mayor IRCA: " + (d.municipioIRCAAlto) + " (" + d3.format(".3")(d.IRCAMasAlto)+ "%)" +"</span>" + "<br><span>" + "Municipio con menor IRCA: " + (d.municipioIRCABajo) + " (" + d3.format(".3")(d.IRCAMasBajo)+ "%)"  +"</span>");
        
  })
    		    .on("mouseout", function(d, i) { tooltip.style("display", "none");d3.select(this).attr("fill", function() {
                return "#8787A3";
            });})

   	
});

  //Defino los tooltips
  var tooltip = d3.select("body").append("div").attr("class", "toolTip");

  
  </script>
  
  Al revisar los datos procesados...

[Siguiente](proportions.md)
