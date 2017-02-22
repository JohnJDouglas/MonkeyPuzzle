// The radius of the circle text nodes
var nodeRadius = 12;
// Circle node offset for the id text
var nodeIdOffset = 4;
// Size (width and height) of scheme nodes
var nodeSchemeSize = 22;
// Offset for scheme nodes
var nodeSchemeOffset = 11;
// Offset for the text overlays
var nodeTextBoxOffset = 20;
// If a text overlay is open (active)
var activeTextOverlay = false;
// Status of showing all text nodes at once (preventing multiple instances simultaneously)
var allActiveTextOverlay = false;
// Currently selected element
var selectedElement = null;
// Node dragged status
var dragging = false;
// Editing node text status
var editText = false;
// X and Y offset  for adding nodes
var addNodeOffset = 0;
// Increment for increasing the distance a node moves when added in the centre of the screen
var addNodeIncrement = 20;
// Node mouseover overlay status
var nodeMouseOver = false;

var count = 0,
count2 = 0;

// The object holding the existing visualisation data
/*
var data = {
	nodes: [{id: 0, x: 200, y: 400, text: "lorem", displayText: "lorem", type:"text"},{id: 1, x: 400, y: 400, text: "ipsum", displayText: "ipsum", type:"scheme"},{id: 2, x: 400, y: 200, text: "dolor", displayText: "dolor", type:"text"},{id: 3, x: 600, y: 400, text: "sit", displayText: "sit", type:"scheme"},{id: 4, x: 400, y: 600, text: "amet", displayText: "amet", type:"text"}],
	links: [{source:{id: 2, x: 400, y: 200, text: "dolor", type:"text"},target:{id: 3, x: 600, y: 400, text: "sit", type:"scheme"}}],
	tabs: [{tab: 1, text: ""}, {tab: 2, text: ""}, {tab: 3, text: ""}, {tab: 4, text: ""}, {tab: 5, text: ""}, {tab: 6, text: ""}, {tab: 7, text: ""}, {tab: 8, text: ""}, {tab: 9, text: ""}, {tab: 10, text: ""},],
	currentNodeID: 0
};
*/
var data = {
	nodes: [{id: 0, x: 200, y: 400, text: "lorem", displayText: "lorem", type:"text"},{id: 1, x: 400, y: 400, text: "ipsum", displayText: "ipsum", type:"scheme"},{id: 2, x: 400, y: 200, text: "dolor sit amet, consectetur adipiscing elit. Donec in sagittis magna. Quisque augue nisl, aliquet vel vehicula sit amet, lobortis at ex. Donec quis lacinia lorem. Pellentesque venenatis eget lacus ac sagittis.", displayText: "dolor sit amet, consectetur adipiscing elit. Donec in sagittis magna. Quisque augue nisl, aliquet vel vehicula sit amet, lobortis at ex. Donec quis lacinia lorem. Pellentesque venenatis eget lacus ac sagittis.", type:"text"},{id: 3, x: 600, y: 400, text: "sit", displayText: "sit", type:"scheme"},{id: 4, x: 400, y: 600, text: "amet", displayText: "amet", type:"text"}],
	links: [{source:{id: 2, x: 400, y: 200, text: "dolor", type:"text"},target:{id: 3, x: 600, y: 400, text: "sit", type:"scheme"}}],
	tabs: [{tab: 1, text: ""}, {tab: 2, text: ""}, {tab: 3, text: ""}, {tab: 4, text: ""}, {tab: 5, text: ""}, {tab: 6, text: ""}, {tab: 7, text: ""}, {tab: 8, text: ""}, {tab: 9, text: ""}, {tab: 10, text: ""},],
	currentNodeID: 0
};
/*
var data = {
	nodes: [],
	links: [],
	tabs: [{tab: 1, text: ""}, {tab: 2, text: ""}, {tab: 3, text: ""}, {tab: 4, text: ""}, {tab: 5, text: ""}, {tab: 6, text: ""}, {tab: 7, text: ""}, {tab: 8, text: ""}, {tab: 9, text: ""}, {tab: 10, text: ""},],
	currentNodeID: 0
};
*/

function createSVG() {
	d3.select(window)
		.on("keydown", keyDown);
	
	// Set the id value for the next node added
	data.currentNodeID = data.nodes.length;
	console.log("new node id="+data.nodes.length);
		
	// SVG height and width;
	var w = $("#div-vis").width();
	var h = $("#div-vis").height();

	// Get the SVG container and append the SVG element
	var svg = d3.select("#div-vis")
		.append("svg")
		.attr("id","svg-vis")
		.attr("xmlns","http://www.w3.org/2000/svg")
		.attr("xmlns:xlink","http://www.w3.org/1999/xlink")
		.attr("version","1.1")
		.attr("width", w)
		.attr("height", h)
		.style("background","#FFF")
		.append("defs");

	var defs = d3.select("defs");
	
	// arrow marker for the end of a link (marker is back from end of link to sit on node perimeter)
	defs.append("marker")
		.attr("id","arrow")
		.classed("svg-marker-arrow", true)
		.attr("refX", 11)
		.attr("refY", 3)
		.attr("markerWidth", 10)
		.attr("markerHeight", 10)
		.attr("orient", "auto")
		.attr("markerUnits", "strokeWidth")
		.append("path")
		.attr("d","M0,0 L0,6 L6,3 z");

	// arrow marker for the end of the drag link
	defs.append("marker")
		.attr("id","arrow-drag")
		.classed("svg-marker-arrow-drag", true)
		.attr("refX", 4)
		.attr("refY", 3)
		.attr("markerWidth", 10)
		.attr("markerHeight", 10)
		.attr("orient", "auto")
		.attr("markerUnits", "strokeWidth")
		.append("path")
		.attr("d","M0,0 L0,6 L6,3 z");

	// arrow marker for the end of an active link
	defs.append("marker")
		.attr("id","arrow-active")
		.classed("svg-marker-arrow-active", true)
		.attr("refX", 11)
		.attr("refY", 3)
		.attr("markerWidth", 10)
		.attr("markerHeight", 10)
		.attr("orient", "auto")
		.attr("markerUnits", "strokeWidth")
		.append("path")
		.attr("d","M0,0 L0,6 L6,3 z");
		
	update();
}
	
function update() {
	var svg = d3.select("svg");
	
	deleteSVGElements();

	// lines between nodes called links
	links = svg.selectAll("link")
		.data(data.links)
		.enter()
		.append("line")
		.classed("svg-link", true)
		//.attr("id", function(d) { return "l"+d.source.id })
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; })
		.attr("marker-end","url(#arrow)");

	// hidden line which shows when creating a link
	dragLink = svg.append("line")
		.classed("svg-link-drag", true)
		.classed("hidden", true);

	// circles representing nodes
	nodes = svg.selectAll("circle")
		.data(data.nodes)
		.enter()
		.each(function(d) {
			if(d.type == "scheme") {
				d3.select(this)
					.append("rect")
					.classed("svg-node", true)		
					.style("fill","lightgreen")
					.style("stroke","lightgreen")
					.style("stroke-width","2")
					.attr("id", function(d) { return d.id; })
					.attr("x", function (d) { return d.x - nodeSchemeOffset; })
					.attr("y", function (d) { return d.y - nodeSchemeOffset; })
					.attr("width", nodeSchemeSize)
					.attr("height", nodeSchemeSize)
					.attr("transform", function(d) { return "rotate(45 " + d.x + " " + d.y + ")"; })
					.on("click", click)
					.on("dblclick", doubleClick)
					.call(d3.drag()
						.on("drag", dragNode)
						.on("end", dragEnd));
			} else {
				d3.select(this)
					.append("circle")
					.classed("svg-node", true)
					.style("fill","#7AA3FF")
					.style("stroke","#7AA3FF")
					.style("stroke-width","2")					
					.attr("id", function(d) { return d.id; })
					.attr("cx", function(d) { return d.x; })
					.attr("cy", function(d) { return d.y; })
					.attr("r", nodeRadius)
					.on("click", click)
					.on("dblclick", doubleClick)
					.call(d3.drag()
						.on("drag", dragNode)
						.on("end", dragEnd));
			}
		})

	// text displaying node identification 
	nodeId = svg.selectAll("text")
		.data(data.nodes)
		.enter()
		.append("text")
		.classed("svg-text", true)
		.classed("noselect", true)
		// If the id of the node (+1 because the nodes start from 0 but are display from 1 - double the offset of the node to accomodate the 2 digits)
		.attr("x", function(d) { if(d.id >= 9) { return d.x - (nodeIdOffset*2); } else { return d.x - nodeIdOffset; }})
		.attr("y", function(d) { return d.y + nodeIdOffset; })
		.text(function(d) { return  d.id + 1; })
		.attr("pointer-events", "none");
	
	// link on click to allow selection and deletion
	links.on("click", click);

	// remove the active element
	svg.on("click", function() {	
		console.log("svg click!");
		d3.event.stopPropagation();
		removeActive();
		removeDragLine();
		removeTextOverlay();
		clearTextRow();
	});
}

function click(d) {
	console.log("click!");
	d3.event.stopPropagation();
	removeTextOverlay();
	removeActive();
	addActive(this);
}

// When double clicking a node - show modal to edit text
function doubleClick(d) {
	console.log("doubleClick!");
	d3.event.stopPropagation();

	var id = selectedElement.attr("id");
	console.log("id="+id);

	removeTextOverlay();
	removeActive();
	
	// Set the parameter on the onclick button in the modal - the active element is remove to prevent issues such as delete
	$("#btn-modal-edit-text").attr("onclick","modalEditNodeText("+id+")");
	showModal(11);
	// When the modal hide is called - before finishing
	$("#modal-edit-node-text").on("hide.bs.modal", function(e) {
		// Reset the parameter on the onclick button in the modal
		$("#btn-modal-edit-text").attr("onclick","modalEditNodeText()");
		// Remove this event listener - prevent additional scheme node shorcuts being added
		$("#modal-edit-node-text").off("hide.bs.modal");
	});
}

function dragNode(d) {
	//console.log("dragNode!");
	var svg = d3.select("svg");
	var nodeId = svg.selectAll(".svg-text");
	var links = svg.selectAll(".svg-link");

	dragging = true;

	var w = $("#svg-vis").width();
	var h = $("#svg-vis").height();

	d.x = d3.event.x;
	d.y = d3.event.y;

	// Containment function for nodes to prevent them being dragged off screen
	// Scheme nodes are squares rotated 45deg - calculate the offset the make the node appear fully inside the boundary(w) - add 1 to this calculation to account for the border
	var schemeOffset = Math.sqrt((Math.pow((nodeSchemeSize/2), 2) + Math.pow((nodeSchemeSize/2), 2))) + 1;
	if(d.type == "scheme") {
		if(d3.event.x >= (w - schemeOffset)) {
			d.x = (w - schemeOffset);
		}
		if(d3.event.y >= (h - schemeOffset)) {
			d.y = (h - schemeOffset);
		}
		if(d3.event.x <= (0 + schemeOffset)) {
			d.x = schemeOffset;
		}
		if(d3.event.y <= (0 + schemeOffset)) {
			d.y = schemeOffset;
		}
	}
	// Take the nodeRadius and increment it by 1 to account for the border
	var nodeOffset = nodeRadius + 1;
	if(d.type == "text") {
		if(d3.event.x >= (w - nodeOffset)) {
			d.x = (w - nodeOffset);
		}
		if(d3.event.y >= (h - nodeOffset)) {
			d.y = (h - nodeOffset);
		}
		if(d3.event.x <= (0 + nodeOffset)) {
			d.x = nodeOffset;
		}
		if(d3.event.y <= (0 + nodeOffset)) {
			d.y = nodeOffset;
		}
	}	

	// for each link check if the source or target is equal to the id of the dragged element
	links.each(function(l) {
		// if the id of the current source of the link is equal to the currently dragged items id - update position of link x1,y1 and update link position in data.links
		if(l.source.id == d.id) {
			l.source.x = d.x;
			l.source.y = d.y;
			d3.select(this).attr("x1", d.x).attr("y1", d.y);
		}
		// if the id of the current target of the link is equal to the currently dragged items id - update position of link x2,y2 and update link position in data.links
		if(l.target.id == d.id) {
			l.target.x = d.x;
			l.target.y = d.y;
			d3.select(this).attr("x2", d.x).attr("y2", d.y);
		}
	});
	
	// if the node id is equal to the currently dragged node - update the position of the element accounting for the text offset
	nodeId.each(function(l) {
		if (l == d) {
			// If the id of the node (+1 because the nodes start from 0 but are display from 1 - double the offset of the node to accomodate the 2 digits)
			if(d.id >= 9) {
				d3.select(this).attr("x", d.x - (nodeIdOffset*2)).attr("y", d.y + nodeIdOffset);
			} else {
				d3.select(this).attr("x", d.x - nodeIdOffset).attr("y", d.y + nodeIdOffset);
			}
		}
	});
	
	// if the type of node is scheme the node is a square rotated 45deg so apply different transform - else the node is a circle so apply circle specific action
	if(d.type == "scheme") {
		d3.select(this).attr("transform","rotate(45 "+d.x+" "+d.y+")");
		d3.select(this).attr("x", d.x - nodeSchemeOffset).attr("y", d.y - nodeSchemeOffset);
	} else {
		d3.select(this).attr("cx", d.x).attr("cy", d.y);
	}

	// Remove an open text overlay
	removeTextOverlay();

	// Add this element as the selected one
	removeActive();
	addActive(this);
}

function dragEnd() {
	console.log("dragEnd!");

	dragging = false;
}

function removeActive() {
	// Return all lines to the default marker
	d3.selectAll("line").attr("marker-end","url(#arrow)");
	selectedElement = null;
	// Remove the active element
	d3.selectAll("*").classed("active", false);
	// Remove active from the bottom node text display bar and make it readonly
	$("#txta-node-text").css("background","lightblue");
	$("#txta-node-text").prop("readonly", true);
	// Return the edit button to the edit form and reset editText variable
	$("#i-edit").removeClass("fa-save");
	$("#i-edit").addClass("fa-edit");
	editText = false;
}

function addActive(element) {
	selectedElement = d3.select(element);
	// If the selected element is a SVG line - change the marker to the active one - else its a node so get its text
	if(selectedElement.node() instanceof SVGLineElement) {
		d3.select(element).attr("marker-end","url(#arrow-active)");
	} else {
		setTextRow(element.id);
	}
	
	d3.select(element).classed("active", true);
}

function deleteSVGElements() {
	var svg = d3.select("svg");
	// Remove all svg elements to be appended re-added later
	svg.selectAll("rect, circle, line, text").remove();
}

function keyDown() {
	// D3.event.preventDefault();
	switch(d3.event.keyCode) {
		case 46: // Delete
		case 8: // Backspace (mac)
			console.log("delete!");
			// If the selected element is not null and is not being dragged
			if(selectedElement != null && dragging == false) {
				// Check if the selected element is a node
				if(selectedElement.node() instanceof SVGCircleElement || selectedElement.node() instanceof SVGRectElement) {
					console.log("active node!");
					removeLinksFromNode();	
					removeNodeFromArray();
				}
				// Check if the selected element is a link
				if(selectedElement.node() instanceof SVGLineElement) {
					console.log("active link!");
					removeLinkFromArray();
				}
			}
			break;
		case 16: // Shift
			console.log("shift!");
			// If the selected element is not null and is not being dragged
			if(selectedElement != null && dragging == false) {
				if(selectedElement.node() instanceof SVGCircleElement || selectedElement.node() instanceof SVGRectElement) {
					addLink();
				}
			}
			break;
		case 17: // Control
			console.log("control!");
			// If the selected element is not null and is not being dragged
			if(selectedElement != null && dragging == false) {
				if(selectedElement.node() instanceof SVGCircleElement || selectedElement.node() instanceof SVGRectElement) {
					console.log("selectedElement="+selectedElement.attr("id"));
					showNodeTextOverlay(selectedElement.attr("id"), false);
				}
			}
			break;
	}
}

// Remove link from data object and update
function removeLinkFromArray() {
	// Get all coordinates from the link line element
	var coords = {x1: Number(d3.select(selectedElement).node().attr("x1")), y1: Number(d3.select(selectedElement).node().attr("y1")),
				  x2: Number(d3.select(selectedElement).node().attr("x2")), y2: Number(d3.select(selectedElement).node().attr("y2"))};

	// Find the exact link
	var removal = data.links.filter(function(l) {
		return (l.source.x == coords.x1 && l.source.y == coords.y1 && l.target.x == coords.x2 && l.target.y == coords.y2);
	});

	// Get the first element of the removal array
	toRemove = removal[0];
	
	data.links.splice(data.links.indexOf(toRemove), 1);
		
	update();
}

// Remove node from data object and update
function removeNodeFromArray() {
	var removeId = Number(d3.select(selectedElement).node().attr("id"));
	
	// Find the exact node
	var removal = data.nodes.filter(function(n) {
		return (n.id == removeId);
	});	
	
	$.each(removal, function(index, value){
		console.log(index + ':' + JSON.stringify(value));
		data.nodes.splice(data.nodes.indexOf(value), 1);
	});
	
	update();
}

// Remove links attached to a node
function removeLinksFromNode() {
	var removeId = Number(d3.select(selectedElement).node().attr("id"));
	
	// Find link with source or target equal to the id
	var removal = data.links.filter(function(l) {
		return (l.source.id == removeId || l.target.id == removeId);
	});
	
	console.log("removal="+JSON.stringify(removal));
	
	$.each(removal, function(index, value){
		console.log(index + ':' + JSON.stringify(value));
		data.links.splice(data.links.indexOf(value), 1);
	});
		
	update();
}

function setTextRow(id) {
	//console.log("setTextRow!");
	// Set the bottom row text display
	var element = data.nodes.filter(function(n) {
		return (n.id == Number(id));
	});
	$("#txta-node-text").val(element[0].displayText);
}

// Clear the text row
function clearTextRow() {
	$("#txta-node-text").val("");
}

function showNodeTextOverlay(id, showAll) {
	var svg = d3.select("svg");
	// Number of characters per line
	var overlayLengthPerLine = 40;
	var nodeTextOverLengthPerLine = false;

	// Set the bottom row text display
	setTextRow(id);
	
	if(activeTextOverlay == false) {

		if(data.nodes[id].displayText.length > overlayLengthPerLine) {
			console.log("node text too long!");
			var re = new RegExp('.{1,' + overlayLengthPerLine + '}', 'g');
			var array = data.nodes[id].displayText.match(re);
			console.log("array="+array);

			// Trim leading whitespace from array
			$.each(array, function(index, value) {
				if(array[index].charAt(0) == " ") {
					// Trim array element
					array[index] = $.trim(array[index]);
				}
			});
			nodeTextOverLengthPerLine = true;
		}

		// Text for the overlay
		nodeTextBox = svg.append("text")
			.attr("id", "svg-overlay"+id)
			.classed("svg-overlay", true)
			.classed("svg-overlay-text-text", function(d) { return data.nodes[id].type == "text"; })
			.classed("svg-overlay-text-scheme", function(d) { return data.nodes[id].type == "scheme"; })
			.attr("dy","0.35em")
			// If the node displayText is over length per line set text to first value of array - else just set text to displayText
			.text(function() { 
				if(nodeTextOverLengthPerLine == true) {
					return array[0];
				} else {
					return data.nodes[id].displayText;
				}
			})
			.attr("x", function() { return data.nodes[id].x + nodeTextBoxOffset; })
			.attr("y", function() { return data.nodes[id].y + nodeTextBoxOffset; });

		// If the node displayText will go over one line - append the additional lines
		if(nodeTextOverLengthPerLine == true) {
			// Loop through the array and add a line for each element
			$.each(array, function(index, value) {
				// Skip the first element - the first element is added above
				if(index == 0) {
					return true;
				}
				// Append tspans with the subsequent lines
				nodeTextBox.append("tspan")
					.classed("svg-overlay", true)
					.attr("x",0)
					.attr("dy","0.35em")
					.attr("x", function() { return data.nodes[id].x + nodeTextBoxOffset; })
					// Offset the line y attribute for each line
					.attr("y", function() { return data.nodes[id].y + ((nodeTextBoxOffset * index) + nodeTextBoxOffset); })
					.text(array[index]);
			});
		}
					
		var textBox = d3.select("#svg-overlay"+id);
		var bbox = textBox.node().getBBox();
		
		// Rect background for the text overlay - insert the rectangle before the text element
		rect = svg.insert("rect", "#svg-overlay"+id)
			.attr("id", "svg-overlay-rect-"+id)
			.classed("svg-overlay", true)
			.classed("svg-overlay-rect-text", function(d) { return data.nodes[id].type == "text"; })
			.classed("svg-overlay-rect-scheme", function(d) { return data.nodes[id].type == "scheme"; })
			.attr("x", bbox.x - 10)
			.attr("y", bbox.y - 5)
			.attr("width", bbox.width + 20)
			.attr("height", bbox.height + 10);
		
		// Variable holding open state of text box		
		activeTextOverlay = true;

	} else if(showAll == false) {
		// If the function call does not request all text overlays to be shown - remove text overlay
		removeTextOverlay();
	}
}

function removeTextOverlay() {
	// Remove other text boxes and set active to false
	d3.selectAll(".svg-text-overlay, .svg-overlay").remove();
	activeTextOverlay = false;
	allActiveTextOverlay = false;
}

// Show node text overlays on mouseover when enabled
function mouseOverTextOverlay() {
	if(nodeMouseOver == false) {
		console.log("nodeMouseover = false!");
		// Update button icon to represent action state
		$("#i-mouseover-toggle").removeClass("fa-eye");
		$("#i-mouseover-toggle").addClass("fa-eye-slash");
		// Add mouseover event handler
		$(".svg-node").on("mouseover", function(e) {
			var id = $(this).attr("id");
			console.log("id="+id);
			// Show node text overlay passing id of the current node with mouseover and
			showNodeTextOverlay(id, false);
		});
		// Add mouseout event handler
		$(".svg-node").on("mouseout", function(e) {
			removeTextOverlay();
		});
		nodeMouseOver = true;
		return;
	}
	if(nodeMouseOver == true) {
		console.log("nodeMouseover = true!");
		// Revert button icon to represent action state
		$("#i-mouseover-toggle").removeClass("fa-eye-slash");
		$("#i-mouseover-toggle").addClass("fa-eye");
		// Remove mouseover and mouseout event handler
		$(".svg-node").off("mouseover");
		$(".svg-node").off("mouseout");
		nodeMouseOver = false;
		return;
	}
}

function showAllTextOverlay() {
	console.log("showAllTextOverlay()");

	if(allActiveTextOverlay == false) {
		for(var i = 0; i < data.nodes.length; i++) {
			var id = data.nodes[i].id;
			console.log("id="+id);

			activeTextOverlay = false;

			showNodeTextOverlay(id, true);
		}
		allActiveTextOverlay = true;
	}
	// Clear the bottom row text display
	clearTextRow();
	selectedElement = null;
}

function addNode(type,schemeName,nodePosition) {
	console.log("nodePosition="+nodePosition);

	var svg = d3.select("svg");

	var newNode = {};
    newNode.id = Number(data.currentNodeID);

	// Based on the parameter to this function the type of node changes - set the type here
	switch(type) {
		// Text node
		case 1:
			// Text nodes are added in the centre of the SVG - find X and Y
			var nodeX = ($("svg").width() / 2);
			var nodeY = ($("svg").height() / 2);

			// If the node request is a text node and has text from a source tab - set node type and store the text selection range in the node object 
			newNode.type = "text";

			// Get selection in the source textarea
			var textaSource = document.getElementById("txta-source-"+activeTab);

			var start = textaSource.selectionStart;
			var end = textaSource.selectionEnd;
			var selectedText = textaSource.value.substring(start,end);

			// Store the start end end value of the text
			newNode.start = start;
			newNode.end = end;

			/* HIGHLIGHTING
			var range = [start, end];
			console.log("range="+JSON.stringify(range));
			highlightRange.push(range);
			console.log("highlightRange="+JSON.stringify(highlightRange));
			$("#txta-source-1").highlightWithinTextarea(onInputArray);
			*/

			if(selectedText != "") {
				newNode.text = selectedText;
				newNode.displayText = selectedText;
			} else {
				// Show modal 1
				showModal(1);
				removeActive();
				return;
			}
			break;
		// Scheme node
		case 2:
			// Scheme nodes are added in the centre of the SVG - find X and Y
			var nodeX = ($("svg").width() / 2);
			var nodeY = ($("svg").height() / 2);

			newNode.type = "scheme";
			newNode.text = schemeName;
			newNode.displayText = schemeName;
			break;
		// Missing Text node
		case 3:
			// Missing Text nodes are added in the centre of the SVG - find X and Y
			var nodeX = ($("svg").width() / 2);
			var nodeY = ($("svg").height() / 2);

			newNode.type = "text";
			newNode.start = 0;
			newNode.end = 0;

			var missingText = $("#txta-missing").val();
			
			if(missingText != "") {
				newNode.text = missingText;
				newNode.displayText = missingText;
			} else {
				newNode.text = "Missing Text node";
				newNode.displayText = "Missing Text node";
			}

			break;
		// Text node to text node shortcut scheme node
		case 4:
			// Shortcut scheme nodes are added between the start node and the end - find X and Y between these nodes
			var nodeX = ((nodePosition.x2 + nodePosition.x1) / 2);
			var nodeY = ((nodePosition.y2 + nodePosition.y1) / 2);

			newNode.type = "scheme";
			newNode.text = "Default";
			newNode.displayText = "Default";
			break;

			break;
		default:
			console.log("addNode switch error!");
	}

	// Variable to hold if a node is already in the centre of the svg
	var positionTaken = false;

	// Find whether or not a node is in the centre of the svg
	data.nodes.filter(function(n) {
		if((n.x == nodeX) && (n.y == nodeY)) {
			positionTaken = true;
		};
	});

	// If a node has been found to be in the centre of the svg - update the node location to be offset
	if(positionTaken == true) {
		addNodeOffset = addNodeOffset + addNodeIncrement;
		newNode.x = nodeX + addNodeOffset;
		newNode.y = nodeY + addNodeOffset;
	} else {
		// Set the new node to appear at the centre of the svg
		newNode.x = Number(nodeX);
		newNode.y = Number(nodeY);
	}
	
	// Add the new node to the array
	data.nodes.push(newNode);

	// Increment the nodeId value
	data.currentNodeID = data.currentNodeID+1;

	// Reset textarea selection
	textaSource.selectionStart = null;
	textaSource.selectionEnd = null;

	update();
}

function addLink(idStart,idEnd) {
	console.log("idStart="+idStart);
	console.log("idEnd="+idEnd);

	var node = d3.selectAll(".svg-node");
	// Remove text overlay before creating link
	removeTextOverlay();
	
	// If the parameter is null - set id1 to the selectedElement id
	if(idStart == null) {
		// The first id - the source of the link
		var id1 = d3.select(selectedElement).node().attr("id");
	} else {
		var id1 = idStart;
	}
	
	var id1Filter = data.nodes.filter(function(n) {
		return (n.id == Number(id1));
	});

	id1Type = id1Filter[0].type;
	console.log("id1Type="+id1Type);

	// Nodes can only connect to one other node - whilst being able to receive any number of links to it
	var alreadySource = false;
	
	// Links can only exist one way
	var reverseLink = false;

	// Loop through data.links (links array) and check if there is a link with the source of the current node - if so set alreadySource to true
	for(var i = 0; i < data.links.length; i++) {
		if(data.links[i].source.id == id1) {
			alreadySource = true;
		}
	}

	// If the node already has a link from it - show error modal and return
	if(alreadySource == true) {
		// show modal 2
		showModal(2);
		removeActive();
		return;
	}
	
	// Function which displays the drag line
	dragLine(id1);

	var id2 = 0;

	node.on("mouseover", function(d) {	
		// The second id - the target of the link
		id2 = d3.select(this).attr("id");

		console.log("id2="+id2);

		var id2Filter = data.nodes.filter(function(n) {
			return (n.id == Number(id2));
		});

		id2Type = id2Filter[0].type;
		console.log("id2Type="+id2Type);
		
		// Check for a link with the reverse source and target - if found prevent addition, remove dragline and show modal
		for(var i = 0; i < data.links.length; i++) {
			if(data.links[i].source.id == id2 && data.links[i].target.id == id1) {
				// show modal 3
				showModal(3);
				removeDragLine();
				return;
			}
		}

		// Check both nodes being linked and if they are both text they can not be linked
		if(id1Type == "text" && id2Type == "text") {
			// Show modal 5
			showModal(5);
			$("#modal-link-text").on("hide.bs.modal", function(e) {
				var val = $(document.activeElement).attr("id");
				console.log(val);

				if(val == "btn-add-scheme-between-text") {
					var position = {};
					position.x1 = Number(id1Filter[0].x);
					position.y1 = Number(id1Filter[0].y);
					position.x2 = Number(id2Filter[0].x);
					position.y2 = Number(id2Filter[0].y);

					// Add a default scheme node
					addNode(4,"",position);

					currentNodeId = (data.currentNodeID - 1);

					addLinkToData(id1Filter[0].id,currentNodeId);
					addLinkToData(currentNodeId,id2Filter[0].id);

					console.log("id1="+id1Filter[0].id);
					console.log("id2="+id2Filter[0].id);
					console.log("id New="+data.currentNodeID);
				}
				// Remove this event listener - prevent additional scheme node shorcuts being added
				$("#modal-link-text").off("hide.bs.modal");
			});
			// Remove drag line
			removeDragLine();
			// Remove the node as active
			removeActive();
			return;
		}

		console.log("id1="+id1);
		console.log("id2="+id2);

		// If the source of the link is different to the target
		if(id1 != id2) {
			addLinkToData(id1,id2);
		}
	});
	// Set the selectedElement back to null
	selectedElement = null;
}

function addLinkToData(id1,id2) {
	console.log("id1="+id1);
	console.log("id2="+id2);

	var link = {};
	var source = data.nodes.filter(function(n) {
		return (n.id == Number(id1));
	});
	
	// Set the source of the link to the first element of the filter (it should only ever return one result)
	link.source = source[0];

	console.log("source="+JSON.stringify(source[0]));
	
	var target = data.nodes.filter(function(n) {
		return (n.id == Number(id2));
	});
	
	// Set the target of the link to the first element of the filter (it should only ever return one result)
	link.target = target[0];

	console.log("target="+JSON.stringify(target[0]));
	
	// Push the link to the data object
	data.links.push(link);
	
	update();
}

function dragLine(id) {	
	var svg = d3.select("svg");
	var line = d3.select(".svg-link-drag");

	// Check the type of element the selected node 
	if(selectedElement.node() instanceof SVGCircleElement) {
		// The source X and Y attribute of the node - JQuery used here because D3.js doesnt like only numeric ids
		var sourceX = $("#"+id).attr("cx");
		var sourceY = $("#"+id).attr("cy");

		node = svg.append("circle")
			.classed("svg-drag-node", true)
			.attr("cx", sourceX)
			.attr("cy", sourceY)
			.attr("r", nodeRadius)
			.on("mousedown", mousedown);

		line.on("mouseup", mouseup)
			.attr("x1", sourceX)
        	.attr("y1", sourceY);
	} else {
		// The source X and Y attribute of the node - JQuery used here because D3.js doesnt like only numeric ids
		var sourceX = Number($("#"+id).attr("x"));
		var sourceY = Number($("#"+id).attr("y"));

		node = svg.append("rect")
			.classed("svg-drag-node", true)
			.attr("x", sourceX)
			.attr("y", sourceY)
			.attr("width", nodeSchemeSize)
			.attr("height", nodeSchemeSize)
			.attr("transform", function(d) { return "rotate(45 " + (sourceX + nodeSchemeOffset) + " " + (sourceY + nodeSchemeOffset) + ")"; })
			.on("mousedown", mousedown);
		
		line.on("mouseup", mouseup)
			.attr("x1", (sourceX + nodeSchemeOffset))
        	.attr("y1", (sourceY + nodeSchemeOffset));
	}
}

function mousedown() {	
	console.log("mousedown!");
	var svg = d3.select("svg");
    var m = d3.mouse(this);
	
	var line = d3.select(".svg-link-drag")
		.classed("hidden", false)
		.attr("marker-end","url(#arrow-drag)")
        .attr("x2", m[0])
        .attr("y2", m[1]);

    svg.on("mousemove", mousemove);
}

function mousemove() {
	console.log("mousemove!");
	var line = d3.select(".svg-link-drag");
    var m = d3.mouse(this);
		
    line.attr("x2", m[0])
        .attr("y2", m[1]);
}

function mouseup() {
	console.log("mouseup!");
	removeDragLine();
}

function removeDragLine() {
	var svg = d3.select("svg");
	var line = d3.select(".svg-link-drag");
		
	// Hide the line and remove the dummy node
	line.classed("hidden", true);
	d3.select(".svg-drag-node").remove();
	svg.on("mousemove", null);
	
	// Prevent mousing over a node still completing the link
	var node = d3.selectAll(".svg-node");
	node.on("mouseover", null);
}

function moveElementsToFit(width, height) {
	console.log("moveElementsToFit()");
	var svg = d3.select("svg");
	var nodes = d3.select(".svg-node");
	var links = svg.selectAll(".svg-link");
	var text = svg.selectAll(".svg-text");

	var schemeOffset = Math.sqrt((Math.pow((nodeSchemeSize/2), 2) + Math.pow((nodeSchemeSize/2), 2)));
	$.each(data.nodes, function(index, value) {
		if(value.type == "scheme") {
			if(value.x >= (width - schemeOffset)) {
				data.nodes[index].x = (width - schemeOffset);
			}
			if(value.y >= (height - schemeOffset)) {
				data.nodes[index].y = (height - schemeOffset);
			}
			if(value.x <= (0 + schemeOffset)) {
				data.nodes[index].x = schemeOffset;
			}
			if(value.y <= (0 + schemeOffset)) {
				data.nodes[index].y = schemeOffset;
			}
		}
		if(value.type == "text") {
			if(value.x >= (width - nodeRadius)) {
				data.nodes[index].x = (width - nodeRadius);
			}
			if(value.y >= (height - nodeRadius)) {
				data.nodes[index].y = (height - nodeRadius);
			}
			if(value.x <= (0 + nodeRadius)) {
				data.nodes[index].x = nodeRadius;
			}
			if(value.y <= (0 + nodeRadius)) {
				data.nodes[index].y = nodeRadius;
			}
		}	
	});
	updateLinks();
}

function updateLinks() {
	console.log("updateLinks()");

	$.each(data.nodes, function(index, value) {
		//console.log("source id="+JSON.stringify(value.source.id));
		//console.log("target id="+JSON.stringify(value.target.id));
	
		links = $.map(data.links, function(obj, index) {
			//console.log("obj.id="+obj.id);
			if(obj.source.id == value.id) {
				//console.log("obj="+JSON.stringify(obj));
				obj.source = value;
			}
			if(obj.target.id == value.id) {
				//console.log("obj="+JSON.stringify(obj));
				obj.target = value;
			}
		})
	});

	update();
}

// Make the text row at the bottom of the ui allow editing and apply that editing to the text value of the selected node
function editNodeText() {
	console.log("editNodeText!");

	if(selectedElement != null && editText == false) {
		var id = selectedElement.attr("id");
		console.log("id="+id);

		$("#txta-node-text").css("background","orange");
		$("#txta-node-text").prop("readonly", false);
		$("#i-edit").removeClass("fa-edit");
		$("#i-edit").addClass("fa-save");

		editText = true;
		return;
	}
	
	if(selectedElement != null && editText == true) {
		var id = selectedElement.attr("id");

		// If the new value is not empty - update value
		if($("#txta-node-text").val() != "") {
			data.nodes[id].displayText = $("#txta-node-text").val();
		}
		console.log("new node["+id+"] displayText="+data.nodes[id].displayText);

		// Update the text row text
		setTextRow(id);

		$("#txta-node-text").css("background","lightblue");
		$("#txta-node-text").prop("readonly", true);
		$("#i-edit").removeClass("fa-save");
		$("#i-edit").addClass("fa-edit");

		editText = false;
		return;
	}
}

// Edit text function called when using the "Change Text" button on the double click node modal
function modalEditNodeText(id) {
	var val = $("#txta-edit-text").val();
	console.log("val="+val);

	// If the new value is not empty - update value
	if($("#txta-edit-text").val() != "") {
		data.nodes[id].displayText = $("#txta-edit-text").val();
	}	
}

// Log the data object to console
function logDataToConsole(type) {
	switch(type) {
		case "d":
			console.log("data="+JSON.stringify(data));
			break;
		case "n":
			console.log("data.nodes="+JSON.stringify(data.nodes));
			break;
		case "l":
			console.log("data.links="+JSON.stringify(data.links));
			break;
		case "t":
			console.log("data.tabs="+JSON.stringify(data.tabs));
			break;
		case "id":
			console.log("data.currentNodeID="+JSON.stringify(data.currentNodeID));
			break;
		default:
			console.log("logDataToConsole switch error");
	}
}

function logCount() {
	console.log("count="+count+" count2="+count2);
}