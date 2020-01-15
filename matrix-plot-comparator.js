 // javascript
var dataset = [80, 100, 56, 120, 180, 30, 40, 120, 160];

var datasets = {
  "gb-6m" : {
	 type:"book",
	 users:530,
         items:100,
	 ratings:60000},
  "amz-music" : {
         type:"product",
	 users:710,
	 items:830,
	 ratings:5000},
   'ml-100k' : {
         type:"movie",
         users:10,
         items:20,
         ratings:1000},
   'ml-1m' : {
         type:"movie",
	 users:60,
	 items:40,
	 ratings:10000},
   'ml-10m' : {
         type:"movie",
         users:720,
         items:110,
         ratings:100000},
};

// Used to set matrix plot element colour 
// based on rating type.
var colourMap = {
	"book"    : "blue",
	"movie"   : "green",
	"product" : "red" 
};

// Function to set the rectangle opacity based on the sparsity of the 
// matrix. Computed as numRatings / (rectWidth * rectHeight)
// When numRatings = (recWidth * rectHeight), opacity is 1.
// Typically numRatings << (recWidth * rectHeight), resulting in light opacity.
function getOpacity(numRatings, numItems, numUsers) { 
	var colourCorrection = 0; // Used to increase opacity magnitude for actual visibility; uniformly applied)
	return (numRatings / (numItems * numUsers)) + colourCorrection; 
}

// Iterate over the dictionary to determine the canvas width and height.
// Must enforce ordering to simultaneously compute X-axis center values.
function getSVGdimensions(dsOrder, dataset) {
	var lastCenter = 0;
	var totalItems = 0;
	var userRange  = [];
	var axisCenter = [];
	for(var ds in dsOrder) {
		console.log(ds);
		axisCenter.push(lastCenter + (0.5 * dataset[dsOrder[ds]].items) + 50);
		lastCenter = lastCenter  + 36 * ds;
  		totalItems = totalItems +  dataset[dsOrder[ds]].items;
		userRange.push(dataset[dsOrder[ds]].users);
	}
  	return {width:totalItems,
	        height:(d3.max(userRange) - d3.min(userRange)) + 0.75 * d3.max(userRange),
		axisHandle:axisCenter};
}

// Zip together the dataset names and ratings values, sort on the latter,
// and then return the names by that order.
// Used to enforce ordering in getSVGdimensions().
function getOrdering(dataset) {
	// Combine the dataset names with number of ratings
	var list = [];
	for(var ds in dataset) { list.push({'ds':ds, 'ratz': dataset[ds].ratings}); }
	
	// Sort the list on ratings (ratz)
	list.sort(function(a, b) { return ((a.ratz < b.ratz) ? -1 : ((a.ratz == b.ratz) ? 0 : 1)); });

	// Iterate out the ds ordering
	var dsOrder = [];
	for (var i = 0; i < list.length; i++) {
    		dsOrder.push(list[i].ds);
	}
	return dsOrder;
}	

// Return the list of number of items, ordered according to the number of ratings.
function getOrderedItems(dsOrder, dataset) {
	var list = [];
	for(var ds in dsOrder) { list.push(dataset[dsOrder[ds]].items); }
	return list;
}

// Returns the list of number of users, ordered according to the number of ratings.
function getOrderedUsers(dsOrder, dataset) {
        var list = [];
        for(var ds in dsOrder) { list.push(dataset[dsOrder[ds]].users); }
        return list;
}

function drawFramingLines(svg, ds) {
	// Compute reference points to simplify
	var xCenter = svgDim.axisHandle[dsOrder.indexOf(ds)] + (0.5 * datasets[ds].items);
	var yCenter = svgDim.height - 1 * datasets[ds].users;
	var xRight  = svgDim.axisHandle[dsOrder.indexOf(ds)] + (1.0 * datasets[ds].items);
	var xLeft   = svgDim.axisHandle[dsOrder.indexOf(ds)] - (0.0 * datasets[ds].items);
	var yTop    = svgDim.height - 1.5 * datasets[ds].users;
	var yBottom = svgDim.height - 0.5 * datasets[ds].users;
	var percentEdge = 0.01;

	// Draw the Top-Line
	svg.append("line").attr("x1", xLeft).attr("y1", yTop)
		          .attr("x2", xRight).attr("y2", yTop)
			  .attr("stroke-width", 2).attr("stroke", "black");
	
	// Draw the Bottom-Line
        svg.append("line").attr("x1", xLeft).attr("y1", yBottom)
                          .attr("x2", xRight).attr("y2", yBottom)
                          .attr("stroke-width", 2).attr("stroke", "black");

	// Draw the Center-Line
        svg.append("line").attr("x1", xCenter).attr("y1", yTop)
                          .attr("x2", xCenter).attr("y2", yBottom)
                          .attr("stroke-width", 2).attr("stroke", "black").style('stroke-dasharray', "5,5");

	// Draw the Middle-Line
        svg.append("line").attr("x1", xLeft).attr("y1", yCenter)
                          .attr("x2", xRight).attr("y2", yCenter)
                          .attr("stroke-width", 2).attr("stroke", "black").style('stroke-dasharray', "5,5");
	
	// Draw Top-Left-Edge
        svg.append("line").attr("x1", xLeft).attr("y1", yTop)
                          .attr("x2", xLeft).attr("y2", yTop + (percentEdge * (yBottom - yTop)))
                          .attr("stroke-width", 2).attr("stroke", "black");
	// Draw Top-Right-Edge
        svg.append("line").attr("x1", xRight).attr("y1", yTop)
                          .attr("x2", xRight).attr("y2", yTop + (percentEdge * (yBottom - yTop)))
                          .attr("stroke-width", 2).attr("stroke", "black");

	// Draw Bottom-Left-Edge
        svg.append("line").attr("x1", xLeft).attr("y1", yBottom)
                          .attr("x2", xLeft).attr("y2", yBottom - (percentEdge * (yBottom - yTop)))
                          .attr("stroke-width", 2).attr("stroke", "black");
        // Draw Bottom-Right-Edge
        svg.append("line").attr("x1", xRight).attr("y1", yBottom)
                          .attr("x2", xRight).attr("y2", yBottom - (percentEdge * (yBottom - yTop)))
                          .attr("stroke-width", 2).attr("stroke", "black");
	
}

// Keep local copies for ease of access when drawing the SVG!
var dsOrder    = getOrdering(datasets);
var svgDim     = getSVGdimensions(dsOrder, datasets); 
var barPadding = parseInt(0.05 * svgDim.width);

// For verbosity sake...
console.log('Total Items: '  + svgDim.width);
console.log('Total Users: '  + svgDim.height);
console.log('Bar Padding:'   + barPadding);
console.log('Dataset Order: '+ dsOrder);
console.log('List Users: '+ getOrderedUsers(dsOrder, datasets));
console.log('List Items: '+ getOrderedItems(dsOrder, datasets));
console.log('Min Users: '+ d3.min(getOrderedUsers(dsOrder, datasets)));
console.log('Max Users: '+ d3.max(getOrderedUsers(dsOrder, datasets)));
console.log('Axis Centers: ' + svgDim.axisHandle);

// Setup the initial svg canvas!
var svg = d3.select('svg')
    .attr("width", svgDim.width + ((dsOrder.length + 3) * barPadding))
    .attr("height", svgDim.height + ((dsOrder.length) * barPadding));

var xscale = d3.scaleLinear()
    .domain([0, d3.max(getOrderedItems(dsOrder, datasets))])
    .range([0, svgDim.width + ((dsOrder.length + 2) * barPadding)]);

// Generate uniform ticks as a measurement
var uniformTicks = [0];
for(var i = 1; i < xscale.ticks().length; i++ ){ uniformTicks.push(xscale.ticks()[1] - xscale.ticks()[0]) }

var yscale = d3.scaleLinear()
              .domain([d3.min(getOrderedUsers(dsOrder, datasets)), d3.max(getOrderedUsers(dsOrder, datasets))])
              .range([svgDim.height, 0]);

var x_axis = d3.axisBottom().scale(xscale).tickValues(uniformTicks);
var y_axis = d3.axisLeft().scale(yscale);


svg.append("g")
   .attr("transform", "translate(50, 10)")
   .call(y_axis);

svg.append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", 0)
   .attr("x",0 - (svgDim.height / 2))
   .attr("dy", "1em")
   .style("text-anchor", "middle")
   .text("Num. of Users");  

svg.append("text")             
   .attr("transform", "translate(" + (svgDim.width/2) + " ," + (svgDim.height + 20) + ")")
      .style("text-anchor", "middle")
      .text("Num. of Items");

var xAxisTranslate = svgDim.height + 10;
svg.append("g")
   .attr("transform", "translate(50, " + xAxisTranslate + ")")
   .call(x_axis)

console.log(uniformTicks)
x_axis.tickFormat((d,i) => uniformTicks[i]).attr('transform', function(d,i) { return 'translate(' + + ')'; }));

// Add the rectangles to the SVG!
var barChart = svg.selectAll("rect")
    .data(dsOrder)
    .enter()
    .append("rect")
    .attr("y", function(d) { return svgDim.height - datasets[d].users - (0.5 * datasets[d].users); })
    .attr("height", function(d) { return datasets[d].users; })
    .attr("width", function(d) { return datasets[d].items;  })
    .attr("transform", function (d, i) {
        var translate = [svgDim.axisHandle[i], 0]; 
        return "translate("+ translate +")";
    });

// Change the colouring to match rating type and sparsity.
d3.selectAll("rect")
  .style('fill', function(d, i) { return colourMap[datasets[dsOrder[i]].type]; })
  .style('fill-opacity', function (d, i) { return getOpacity(datasets[dsOrder[i]].ratings, datasets[dsOrder[i]].items, datasets[dsOrder[i]].users); })
  //.style('stroke-width', 0.05 * barPadding)
  //.style('stroke', 'black')
  //.style('stroke-dasharray', "5,5")
;

// Draw framing lines for each rect
for(var ds in dsOrder){ drawFramingLines(svg, dsOrder[ds]); }

