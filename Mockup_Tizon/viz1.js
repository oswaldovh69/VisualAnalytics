                      //Dimensiones del objeto SVG y consideraciones de márgenes para el caso particular. 
          
        var svg = d3.select("#viz1"),
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
                .text("Porcentaje de afectación (%)")
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
                .attr("fill", function(d) { if (d.IRCAPromedio <= 5) {return "#ffffb2"} else if (d.IRCAPromedio <= 14) {return "#fecc5c"} else if (d.IRCAPromedio <= 35) {return "#fd8d3c"} else if (d.IRCAPromedio <= 70) {return "#f03b20"} else {return "#bd0026"} })
                .on("mousemove", function(d){
                    d3.select(this).attr("fill", "#588C73");
                    tooltip
                      .style("left", d3.event.pageX - 50 + "px")
                      .style("top", d3.event.pageY - 70 + "px")
                      .style("display", "inline-block")
                      .html("Afectación mediana: " + d3.format(".3")(d.IRCAPromedio) +"%" + "<br><span>" + "Región con mayor afectación: " + (d.municipioIRCAAlto) + " (" + d3.format(".3")(d.IRCAMasAlto)+ "%)" +"</span>" + "<br><span>" + "Región con menor afectación:: " + (d.municipioIRCABajo) + " (" + d3.format(".3")(d.IRCAMasBajo)+ "%)"  +"</span>");
                
          })
                    .on("mouseout", function(d, i) { tooltip.style("display", "none");d3.select(this).attr("fill", function(d) {if (d.IRCAPromedio <= 5) {return "#ffffb2"} else if (d.IRCAPromedio <= 14) {return "#fecc5c"} else if (d.IRCAPromedio <= 35) {return "#fd8d3c"} else if (d.IRCAPromedio <= 70) {return "#f03b20"} else {return "#bd0026"}
                    });})
          
            //Definiciones de las convenciones, fuente y posición
          var riskRanks = [100, 70, 35, 14, 5]; //Datos de las convenciones
          var z = d3.scaleOrdinal()
            .range(["#bd0026","#f03b20","#fd8d3c","#fecc5c","#ffffb2"]);
          
          var legend = g.append("g")
              .attr("font-family", "helvetica")
              .attr("font-size", 12)
              .attr("text-anchor", "start")
            .selectAll("g")
            .data(riskRanks)
            .enter().append("g")
              .attr("transform", function(d, i) { return "translate(0," + i * 25 + ")"; });
          legend.append("rect")
              .attr("x", width + 15)
              .attr("width", 19)
              .attr("height", 19)
              .attr("fill", z);
          //Nombrando las convenciones
          legend.append("text")
              .attr("x", width + 39)
              .attr("y", 9.5)
              .attr("dy", "0.32em")
              .text(function(d) { t = ""; if(d > riskRanks[1]){ t = "Devastado"} else if (d > riskRanks[2]){ t = "Muy afectado"} else if (d > riskRanks[3]){ t = "Medianamente afectado"} else if (d > riskRanks[4]){ t = "Poco afectado"} else {t = "No afectado"}; return t });
        });
          //Defino los tooltips
          var tooltip = d3.select("body").append("div").attr("class", "toolTip");
