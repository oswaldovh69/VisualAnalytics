// Set the dimensions of the SVG canvas.
var margin = {top: 20, right: 250, bottom: 50, left: 80},
    width = 1100 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

// Set the ranges of the scales to be shown.
var x = d3.scaleLinear().range([0, width]),  
    y = d3.scaleLinear().range([height, margin.top]);
  
// Define the plot as a linechart
var utilityLine = d3.line()	
    .x(function(d) { return x(d.año); })
    .y(function(d) { return y(d.utilidad); });
    
// Selects the linechart div in the DOM to append the SVG element.
var linechart = d3.select("#linechart")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

// Get the data from the CSV table
d3.csv("formatted_data.csv", function(error, data) {
  
//This is for assuring that the data is correctly interpreted by JavaScript.
        data.forEach(function(d) {
            d.año = parseInt(d.año);
            d.utilidad = parseInt(d.utilidad);
            d.rentabilidad = parseInt(d.rentabilidad);
        });

 	//Obtaining maximum, minimum values, and number of years to establish the domain of each axis.
  var yMaxScale = d3.max(data, function(d) { return d.utilidad; }),
      yMinScale = d3.min(data, function(d) { return d.utilidad; }),
      xMinScale = d3.min(data, function(d) { return d.año; }),
      xMaxScale = d3.max(data, function(d) { return d.año; }),
      uniqueYears = d3.map(data, function(d){return d.año}).keys().length;
  
  
    // Scale the axes with the range of the data.
    x.domain([xMinScale, xMaxScale]);
    y.domain([yMinScale, yMaxScale]);

    // Nest the data entries by crop type.
    var dataNest = d3.nest()
        .key(function(d) {return d.cultivo;})
        .entries(data);

    // Setting the color scale to be used for the line click events
    var color = d3.scaleOrdinal(d3.schemeCategory20);
    var legendSpace = 20; // Arbitrary spacing for the legends

    // Loop through each crop type / key as obtained in the nesting step
    dataNest.forEach(function(d,i) { 

        linechart.append("path")
            .attr("class", "line")
            .style("stroke", "#9C9C9C")
            .attr("id", 'tag'+d.key.replace(/\s+/g, '')) // Assign identifiers to each path element in the plot
            .attr("d", utilityLine(d.values))
        		.attr("opacity", 0.2)
        		.on("click", function(){
                // Determine if current line is visible 
                var active   = d.active ? false : true,
                newColor = active ? color(d.key) : "#9C9C9C"; 
          			newOpacity = active ? 1 : 0.2;

          
                // Hide or show the elements upon clicking the text legend on the right side of the plot
                d3.select(this)
                    .transition().duration(300) 
                    .style("stroke", newColor)
                		.style("opacity", newOpacity); 
          
        	  //Change the behaviour of the text
								d3.select("#legend"+d.key.replace(/\s+/g, '')) 
                  .style("fill", newColor); 
                // Update whether or not the elements are active
                d.active = active;
                })  ;
      

        // Add the Legend
        linechart.append("text")
            .attr("x", width + (legendSpace) )  // Legend placement
            .attr("y", height - (i*20))
        		//.attr("font-weight", "bold")
            .attr("id", 'legend'+d.key.replace(/\s+/g, ''))    // Assign identifiers to each text element in the plot
        		.style("fill", "#9C9C9C")
            .on("click", function(){
                // Determine if current line is visible 
                var active   = d.active ? false : true,
                newColor = active ? color(d.key) : "#9C9C9C"; 
          			newOpacity = active ? 1 : 0.2;
          
                // Hide or show the elements upon clicking the key on the right
                d3.select("#tag"+d.key.replace(/\s+/g, ''))
                    .transition().duration(300) 
                    .style("stroke", newColor)
                		.style("opacity", newOpacity); 
          
        	  //Change the color of the text
								d3.select(this)
                	.transition().duration(300)
                  .style("fill", newColor); 
                // Update whether or not the elements are active
                d.active = active;
                })  
            .text(d.key); 

    });

    // Define the placement properties of the x/y axes.  
    var axisLabelProperties = {yOffset: -60, yHeight:-(height/1.5),  xLength: width/2, xOffset: height + margin.bottom};
  
  // Add the X Axis  
  linechart.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(uniqueYears).tickFormat(d3.format("d"))); 

	//Add the X axis label
  linechart.append("text")
    .text("Año")
  	.attr("class", "axisLabels")
  	.attr("x",axisLabelProperties.xLength)
    .attr("y",axisLabelProperties.xOffset);
  

  // Add the Y Axis
  linechart.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y));
  
  //Add the Y Axis label
  linechart.append("text")
  	.text("Utilidad (Millones de pesos)")
  	.attr("class", "axisLabels")
  	.attr("transform", "rotate(-90)")
  	.attr("x", axisLabelProperties.yHeight)
  	.attr("y", axisLabelProperties.yOffset);
  
  //Add the chart title
  linechart.append("text")
  .text("Rentabilidad de los productos agrícolas de Sucre en el periodo 2011 - 2015")
  .attr("x", width/7)
  .attr("y", 0)
  .attr("class", "chartTitle");

});
