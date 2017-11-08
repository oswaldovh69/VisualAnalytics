//Establishing the margins and dimensions of the plot
var margin = {top: 20, right: 90, bottom: 30, left: 90},
    width = 1300 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    padding = 5;

//Establishing the numeric format of the numbers inside the TreeMap
var numberFormat = d3.format(",d");

//Creation of the Color Scale to be used in this map
var colorScale = d3.scaleSequential(d3.interpolateViridis).domain([-5, 5]);

//Creating the SVG canvas I am going to work in
var svgCanvas = d3.select("#vis")
				  .append("svg")
				  .attr("width", width)
				  .attr("height", height);

//Reading the data
d3.json("datasets/titanic_tree.json", function(error, data){
	if(error) throw error;

	//Establishes the root node of the hierarchical data
	var treeMapRoot = d3.hierarchy(data, function(d) {return d.children});
	
	//Setting up the treemap layout
	var treeMapLayout = d3.treemap()
						  .size([width, height])
						  .padding(padding)
						  .round(true);

	//Summing and sorting data array for data binding in further steps, and obtaining descendants of the root node
	var drawnNodes = treeMapLayout(treeMapRoot
							 .sum(function(d) {return d.Number;})
							 .sort(function(a, b) {return b.height - a.height || b.Number - a.Number;}))
					 .descendants();

	//Data binding to the elements of the DOM
	var treeMapCells = svgCanvas.selectAll(".cell")
						 .data(drawnNodes) //Here we have the array of descendants in the hierarchy.
						 .enter().append("g")
						 .attr("transform", function(d){ return "translate(" + d.x0 + "," + d.y0 +")"; })
						 .attr("class", "node")
						 .each(function(d){d.node = this})
						 .on("mouseover", hovered(true))
						 .on("mouseout", hovered(false))
						 ;
	
	treeMapCells.append("rect")
				.attr("id", function(d, i){return "rect-" + d.data.name + "-" + i; })
				.attr("width", function(d) {return d.x1 - d.x0;})
				.attr("height", function(d) {return d.y1 - d.y0;})
				.style("fill", function(d) {return colorScale(d.depth)});

  	treeMapCells.append("clipPath")
      			.attr("id", function(d, i) { return "clip-" + d.data.name + "-" + i; })
    			.append("use")
      			.attr("xlink:href", function(d, i) {return "#rect-" + d.data.name + "-" + i; });				

  	var label = treeMapCells.append("text")
      .attr("clip-path", function(d, i) { return "url(#clip-" + d.data.name + "-"+ i + ")"; });

    treeMapCells.append("title")
      .text(function(d) {return d.data.name + "\n" + numberFormat(d.value); });  

})


function hovered(hover) {
  return function(d) {
    d3.selectAll(d.ancestors().map(function(d) { return d.node; }))
        .classed("node--hover", hover)
      .select("rect")
        .attr("width", function(d) { return d.x1 - d.x0 - hover; })
        .attr("height", function(d) { return d.y1 - d.y0 - hover; });
  };
}


