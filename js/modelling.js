// The radius of the circle text nodes
var nodeRadius = 12;
// Circle node offset for the id text
var nodeIdOffset = 4;
// Size (width and height) of scheme nodes
var nodeSchemeSize = 22;
// Offset for scheme nodes
var nodeSchemeOffset = (nodeSchemeSize / 2);
// Offset for positioning scheme nodes
var schemeContainOffset = Math.sqrt((Math.pow((nodeSchemeSize/2), 2) + Math.pow((nodeSchemeSize/2), 2))) + 1;
// Offset for the text overlays
var nodeTextBoxOffset = 20;
// If a text overlay is open (active)
var activeTextOverlay = false;
// Status of showing all text nodes at once (preventing multiple instances simultaneously)
var allActiveTextOverlay = false;
// Currently selected element
var selectedElement = null;
// Node drag event listener status
var dragging = false;
// X and Y offset  for adding nodes
var addNodeOffset = 0;
// Increment for increasing the distance a node moves when added in the centre of the screen
var addNodeIncrement = 20;
// Node mouseover overlay status
var nodeMouseOverEnabled = false;

/*
// The object holding the existing visualisation data
var data = {
	"nodes": [{"id": 0, "x": 200, "y": 400, "text": "lorem", "displayText": "lorem", "type":"text"},{"id": 1, "x": 400, "y": 400, "text": "ipsum", "displayText": "ipsum", "type":"scheme"},{"id": 2, "x": 400, "y": 200, "text": "dolor sit amet, consectetur adipiscing elit. Donec in sagittis magna. Quisque augue nisl, aliquet vel vehicula sit amet, lobortis at ex. Donec quis lacinia lorem. Pellentesque venenatis eget lacus ac sagittis.", "displayText": "dolor sit amet, consectetur adipiscing elit. Donec in sagittis magna. Quisque augue nisl, aliquet vel vehicula sit amet, lobortis at ex. Donec quis lacinia lorem. Pellentesque venenatis eget lacus ac sagittis.", "type":"text"},{"id": 3, "x": 600, "y": 400, "text": "sit", "displayText": "sit", "type":"scheme"},{"id": 4, "x": 400, "y": 600, "text": "amet", "displayText": "amet", "type":"text"}],
	//"links": [{"source":2,"target":3},{"source":1,"target":2}],
	"links": [{"source":2,"target":3}],
	"tabs": [{"tab": 1, "text": ""}, {"tab": 2, "text": ""}, {"tab": 3, "text": ""}, {"tab": 4, "text": ""}, {"tab": 5, "text": ""}, {"tab": 6, "text": ""}, {"tab": 7, "text": ""}, {"tab": 8, "text": ""}, {"tab": 9, "text": ""}, {"tab": 10, "text": ""}],
	"currentNodeID": 0
};
*/

var data = {
	"nodes": [],
	"links": [],
	"tabs": [{"tab": 1, "text": ""}, {"tab": 2, "text": ""}, {"tab": 3, "text": ""}, {"tab": 4, "text": ""}, {"tab": 5, "text": ""}, {"tab": 6, "text": ""}, {"tab": 7, "text": ""}, {"tab": 8, "text": ""}, {"tab": 9, "text": ""}, {"tab": 10, "text": ""}],
	"currentNodeID": 0
};

// The object holding highlighting state
var highlight = {
	ranges: [],
	highlightColor: "#FFFF00"
};

function createSVG() {
	d3.select(window)
		.on("keydown", keyDown);

	// Get the SVG container and append the SVG element
	var svg = d3.select("#div-vis")
		.append("svg")
		.attr("id","svg-vis")
		.attr("xmlns","http://www.w3.org/2000/svg")
		.attr("xmlns:xlink","http://www.w3.org/1999/xlink")
		.attr("version","1.1")
		// CSS Style is applied here because saving visualisations as images rely on inline styles
		.style("background","#FFFFFF")
		.append("defs");

	var defs = d3.select("defs");

	// Arrow marker for the end of a link (marker is back from end of link to sit on node perimeter)
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

	// Arrow marker for the end of the drag link
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

	// Arrow marker for the end of an active link
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

	// Lines between nodes called links
	links = svg.selectAll("link")
		.data(data.links)
		.enter()
		.append("line")
		// This class is added to allow the active state to be applied
		.classed("svg-link", true)
		// CSS Styles are applied here because saving visualisations as images rely on inline styles
		.style("stroke", "#000")
		.style("stroke-width","2")
		.style("cursor","pointer")
		.attr("x1", function(d) {
			// Find the node which has the id of the link source and return the x co-ordinate
			var x1 = data.nodes.filter(function(n) {
				if (n.id == d.source) { return n; }
			});
			return x1[0].x;
		})
		.attr("y1", function(d) {
			// Find the node which has the id of the link source and return the y co-ordinate
			var y1 = data.nodes.filter(function(n) {
				if (n.id == d.source) { return n; }
			});
			return y1[0].y;
		})
		.attr("x2", function(d) {
			// Find the node which has the id of the link target and return the x co-ordinate
			var x2 = data.nodes.filter(function(n) {
				if (n.id == d.target) { return n; }
			});
			return x2[0].x;
		})
		.attr("y2", function(d) {
			// Find the node which has the id of the link target and return the y co-ordinate
			var y2 = data.nodes.filter(function(n) {
				if (n.id == d.target) { return n; }
			});
			return y2[0].y;
		})
		.attr("marker-end","url(#arrow)");

	// Hidden line which shows when creating a link
	dragLink = svg.append("line")
		.classed("svg-link-drag", true)
		.style("stroke-width", 2)
		.classed("hidden", true);

	// Circles representing nodes
	nodes = svg.selectAll("circle")
		.data(data.nodes)
		.enter()
		.each(function(d) {
			if (d.type == "scheme") {
				d3.select(this)
					.append("rect")
					.classed("svg-node", true)
					// CSS Styles are applied here because saving visualisations as images rely on inline styles
					.style("fill","lightgreen")
					.style("stroke","lightgreen")
					.style("stroke-width","2")
					.attr("id", function(d) { return d.id; })
					.attr("x", function (d) { return d.x - nodeSchemeOffset; })
					.attr("y", function (d) { return d.y - nodeSchemeOffset; })
					.attr("width", nodeSchemeSize)
					.attr("height", nodeSchemeSize)
					.attr("transform", function(d) { return "rotate(45 " + d.x + " " + d.y + ")"; })
					.on("mouseover", mouseOverNode)
					.on("mouseout", mouseOutNode)
					.on("click", click)
					.on("dblclick", doubleClick)
					.call(d3.drag()
						.on("drag", dragNode)
						.on("end", dragEnd));
			} else {
				d3.select(this)
					.append("circle")
					.classed("svg-node", true)
					// CSS Styles are applied here because saving visualisations as images rely on inline styles
					.style("fill","#7AA3FF")
					.style("stroke","#7AA3FF")
					.style("stroke-width","2")
					.attr("id", function(d) { return d.id; })
					.attr("cx", function(d) { return d.x; })
					.attr("cy", function(d) { return d.y; })
					.attr("r", nodeRadius)
					.on("mouseover", mouseOverNode)
					.on("mouseout", mouseOutNode)
					.on("click", click)
					.on("dblclick", doubleClick)
					.call(d3.drag()
						.on("start", dragStart)
						.on("drag", dragNode)
						.on("end", dragEnd));
			}
		})

	// Text displaying node identification
	nodeId = svg.selectAll("text")
		.data(data.nodes)
		.enter()
		.append("text")
		.classed("svg-text", true)
		.classed("no-select", true)
		// If the id of the node is greater than or equal to 9 (since node ids are +1 so they start at 1) - apply the offset twice since there are two digits - else apply offset once
		.attr("x", function(d) { if (d.id >= 9) { return d.x - (nodeIdOffset*2); } else { return d.x - nodeIdOffset; }})
		.attr("y", function(d) { return d.y + nodeIdOffset; })
		.text(function(d) { return  d.id + 1; })
		.attr("pointer-events", "none");

	// Link on click to allow selection and deletion
	links.on("click", click);

	// Remove the active element
	svg.on("click", function() {
		d3.event.stopPropagation();
		removeActive();
		removeDragLine();
		removeTextOverlay();
	});
}

function click(d) {
	d3.event.stopPropagation();
	removeActive();
	addActive(this);
}

// When double clicking a node - show modal to edit text
function doubleClick(d) {
	console.log("doubleClick!");
	d3.event.stopPropagation();

	var id = selectedElement.attr("id");

	// Only open a modal if the node type is text
	var type = data.nodes.filter(function(n) {
		return (n.id == id);
	});

	removeTextOverlay();
	removeActive();
	showModal(11,id);

	if (type[0].type == "text") {
		// Show text node div and button
		$(".modal-edit-text-node").show();

		// When the modal hide is called - before finishing
		$("#modal-edit-node").on("hide.bs.modal", function(e) {
			var val = $(document.activeElement).attr("id");
			// If the activeElement is the edit text node button
			if (val == "btn-modal-edit-text-node") {
				var value = $("#txta-edit-text").val();
				// If the new value is not empty - update node value
				if (value != "") {
					data.nodes[id].displayText = value;

					// Since the text could be changed to something which is not inside any tab - remove the range which has the id of the selected element
					var removalRange = highlight.ranges.filter(function(r) {
						return (r.id == id);
					});
					highlight.ranges.splice(highlight.ranges.indexOf(removalRange[0]), 1);

					removeHighlighting();
					addHighlighting();
				}
			}
			// Remove this event listener - prevent additional scheme node shorcuts being added
			$("#modal-edit-node").off("hide.bs.modal");
		});
	} else {
		// Show scheme node div and button
		$(".modal-edit-scheme-node").show();

		// Append an option for each element in the schemesArray
		$.each(schemesArray, function(index, value) {
			$("#select-schemes").append("<option value='"+schemesArray[index]+"'>"+schemesArray[index]+"</option>");
		});

		// When the modal hide is called - before finishing
		$("#modal-edit-node").on("hide.bs.modal", function(e) {
			var val = $(document.activeElement).attr("id");
			// If the activeElement is the edit scheme node button
			if (val == "btn-modal-edit-scheme-node") {
				// Get the selected option from the dropdown
				var value = $('#select-schemes').find(":selected").text();
				// If the value is not empty
				if (value != "") {
					data.nodes[id].displayText = value;
				}
			}
			// Remove this event listener - prevent additional scheme node shorcuts being added
			$("#modal-edit-node").off("hide.bs.modal");
		});
	}
}

function dragStart() {
	// Set dragging to true - done (in drag start) to prevent nodes from being dragged from underneath the addLink element rendered on-top
	dragging = true;
}

function dragNode(d) {
	var svg = d3.select("svg");
	var nodeId = svg.selectAll(".svg-text");
	var links = svg.selectAll(".svg-link");

	// If all the text overlays are currently open - close them when dragging begins
	if (allActiveTextOverlay == true) {
		removeTextOverlay();
	}

	d.x = d3.event.x;
	d.y = d3.event.y;

	// Containment function for nodes to prevent them being dragged off screen
	if (d.type == "scheme") {
		if (d3.event.x >= (getSVGDimensions().w - schemeContainOffset)) {
			d.x = (getSVGDimensions().w - schemeContainOffset);
		}
		if (d3.event.y >= (getSVGDimensions().h - schemeContainOffset)) {
			d.y = (getSVGDimensions().h - schemeContainOffset);
		}
		if (d3.event.x <= (0 + schemeContainOffset)) {
			d.x = schemeContainOffset;
		}
		if (d3.event.y <= (0 + schemeContainOffset)) {
			d.y = schemeContainOffset;
		}
	}
	// Take the nodeRadius and increment it by 1 to account for the border
	var nodeOffset = nodeRadius + 1;
	if (d.type == "text") {
		if (d3.event.x >= (getSVGDimensions().w - nodeOffset)) {
			d.x = (getSVGDimensions().w - nodeOffset);
		}
		if (d3.event.y >= (getSVGDimensions().h - nodeOffset)) {
			d.y = (getSVGDimensions().h - nodeOffset);
		}
		if (d3.event.x <= (0 + nodeOffset)) {
			d.x = nodeOffset;
		}
		if (d3.event.y <= (0 + nodeOffset)) {
			d.y = nodeOffset;
		}
	}

	// For each link - if the source or target of the link is the same as the current (dragged) element - update this position
	links.each(function(l) {
		if (l.source == d.id) {
			d3.select(this).attr("x1", d.x).attr("y1", d.y);
		}
		if (l.target == d.id) {
			d3.select(this).attr("x2", d.x).attr("y2", d.y);
		}
	});

	// If the node id is equal to the currently dragged node - update the position of the element accounting for the text offset
	nodeId.each(function(l) {
		if (l == d) {
			// If the id of the node is greater than 9 - apply the node offset twice since the id will have 2 digits - else apply once
			if (d.id >= 9) {
				d3.select(this).attr("x", d.x - (nodeIdOffset*2)).attr("y", d.y + nodeIdOffset);
			} else {
				d3.select(this).attr("x", d.x - nodeIdOffset).attr("y", d.y + nodeIdOffset);
			}
		}
	});

	// If the type of node is scheme the node is a square rotated 45deg so apply different transform - else the node is a circle so apply circle specific action
	if (d.type == "scheme") {
		d3.select(this).attr("transform","rotate(45 "+d.x+" "+d.y+")");
		d3.select(this).attr("x", d.x - nodeSchemeOffset).attr("y", d.y - nodeSchemeOffset);
	} else {
		d3.select(this).attr("cx", d.x).attr("cy", d.y);
	}
}

function dragEnd() {
	// Set the dragging to false so action can be taken on the node
	dragging = false;
}

function removeActive() {
	removeNodeMark();
	// Return all lines to the default marker
	d3.selectAll("line").attr("marker-end","url(#arrow)");
	selectedElement = null;
	// Remove the active element
	d3.selectAll("*").classed("active", false);
}

function addActive(element) {
	selectedElement = d3.select(element);
	// If the selected element is a SVG line - change the marker to the active one - else its a node so get its text
	if (selectedElement.node() instanceof SVGLineElement) {
		d3.select(element).attr("marker-end","url(#arrow-active)");
	}

	d3.select(element).classed("active", true);
	addNodeMark(d3.select(element).attr("id"));
}

function deleteSVGElements() {
	var svg = d3.select("svg");
	// Remove all svg elements to be appended re-added later
	svg.selectAll("rect, circle, line, text").remove();
}

function keyDown() {
	switch(d3.event.keyCode) {
		case 46: // Delete
		case 8: // Backspace (mac)
			// If the selected element is not null and is not being dragged
			if (selectedElement != null && dragging == false) {
				// Check if the selected element is a node
				if (selectedElement.node() instanceof SVGCircleElement || selectedElement.node() instanceof SVGRectElement) {
					removeLinksFromNode();
					removeNodeFromArray();
					// Remove the highlighting and add it back
					removeHighlighting();
					addHighlighting();
				}
				// Check if the selected element is a link
				if (selectedElement.node() instanceof SVGLineElement) {
					removeLinkFromArray();
				}
			}
			break;
		case 16: // Shift
			// If the selected element is not null and is not being dragged
			if (selectedElement != null && dragging == false) {
				if (selectedElement.node() instanceof SVGCircleElement || selectedElement.node() instanceof SVGRectElement) {
					addLink();
				}
			}
			break;
		case 17: // Control
			// If the selected element is not null and is not being dragged
			if (selectedElement != null && dragging == false) {
				if (selectedElement.node() instanceof SVGCircleElement || selectedElement.node() instanceof SVGRectElement) {
					// Prevent the overlay being spammed when the control key repeats by checking for an open overlay
					if (activeTextOverlay == false) {
						showNodeTextOverlay(selectedElement.attr("id"), false);
					}
				}
			}
			break;
		case 9: // Tab
			// If the selected element is not null and is not being dragged
			if (selectedElement != null && dragging == false) {
				if (selectedElement.node() instanceof SVGCircleElement || selectedElement.node() instanceof SVGRectElement) {
					moveToNodeSourceTab(selectedElement.attr("id"));
				}
			}
			break;
	}
}

// Remove link from data object and update
function removeLinkFromArray() {
	var source = data.nodes.filter(function(n) {
		return ( n.x == Number(d3.select(selectedElement).node().attr("x1")) && n.y && Number(d3.select(selectedElement).node().attr("y1")) );
	});

	var target = data.nodes.filter(function(n) {
		return (n.x == Number(d3.select(selectedElement).node().attr("x2")) && n.y && Number(d3.select(selectedElement).node().attr("y2")));
	});

	// Find the exact link
	var removal = data.links.filter(function(l) {
		return (l.source == source[0] && l.target == target[0]);
	});

	data.links.splice(data.links.indexOf(removal[0]), 1);

	update();
}

// Remove node from data object and update
function removeNodeFromArray() {
	var removeId = Number(d3.select(selectedElement).node().attr("id"));

	// Remove the node which has the id of the selected element
	var removalNode = data.nodes.filter(function(n) {
		return (n.id == removeId);
	});
	data.nodes.splice(data.nodes.indexOf(removalNode[0]), 1);

	// Remove the range which has the id of the selected element
	var removalRange = highlight.ranges.filter(function(r) {
		return (r.id == removeId);
	});
 	highlight.ranges.splice(highlight.ranges.indexOf(removalRange[0]), 1);

	update();
}

// Remove links attached to a node
function removeLinksFromNode() {
	var removeId = Number(d3.select(selectedElement).node().attr("id"));

	// Find link with source or target equal to the id
	var removal = data.links.filter(function(l) {
		return (l.source == removeId || l.target == removeId);
	});

	$.each(removal, function(index, value) {
		data.links.splice(data.links.indexOf(value), 1);
	});

	update();
}

function showAllTextOverlay() {
	if (allActiveTextOverlay == false) {
		$.each(data.nodes, function(index, value) {
			var id = data.nodes[index].id;

			activeTextOverlay = false;

			showNodeTextOverlay(id, true);
		});
		allActiveTextOverlay = true;
	}
	selectedElement = null;
}

function showNodeTextOverlay(id, showAll) {
	var svg = d3.select("svg");
	// Number of characters per line
	var overlayLengthPerLine = 40;
	var nodeTextOverLengthPerLine = false;

	// Get the node which is to have an overlay opened over it
	var node = data.nodes.filter(function(n) {
		return (n.id == id);
	});

	if (activeTextOverlay == false) {
		if (node[0].displayText.length > overlayLengthPerLine) {
			var re = new RegExp('.{1,' + overlayLengthPerLine + '}', 'g');
			var array = node[0].displayText.match(re);


			// Trim leading whitespace from array
			$.each(array, function(index, value) {
				if (array[index].charAt(0) == " ") {
					// Trim array element
					array[index] = $.trim(array[index]);
				}
			});
			nodeTextOverLengthPerLine = true;
		}

		// Text for the overlay
		nodeText = svg.append("text")
			.attr("id", "svg-overlay"+id)
			.classed("svg-overlay", true)
			.classed("no-select", true)
			.classed("svg-overlay-text-text", function(d) { return node[0].type == "text"; })
			.classed("svg-overlay-text-scheme", function(d) { return node[0].type == "scheme"; })
			.attr("dy","0.35em")
			// If the node displayText is over length per line set text to first value of array - else just set text to displayText
			.text(function() {
				if (nodeTextOverLengthPerLine == true) {
					return array[0];
				} else {
					return node[0].displayText;
				}
			})
			.attr("x", function() { return node[0].x + nodeTextBoxOffset; })
			.attr("y", function() { return node[0].y + nodeTextBoxOffset; });

		// If the node displayText will go over one line - append the additional lines
		if (nodeTextOverLengthPerLine == true) {
			// Loop through the array and add a line for each element
			$.each(array, function(index, value) {
				// Skip the first element - the first element is added above
				if (index == 0) {
					return true;
				}
				// Append tspans with the subsequent lines
				nodeText.append("tspan")
					.classed("svg-overlay", true)
					.attr("x",0)
					.attr("dy","0.35em")
					.attr("x", function() { return node[0].x + nodeTextBoxOffset; })
					// Offset the line y attribute for each line
					.attr("y", function() { return node[0].y + ((nodeTextBoxOffset * index) + nodeTextBoxOffset); })
					.text(array[index]);
			});
		}

		var textBox = d3.select("#svg-overlay"+id);
		var bbox = textBox.node().getBBox();

		// Rect background for the text overlay - insert the rectangle before the text element
		rect = svg.insert("rect", "#svg-overlay"+id)
			.attr("id", "svg-overlay-rect-"+id)
			.classed("svg-overlay", true)
			.classed("svg-overlay-rect-text", function(d) { return node[0].type == "text"; })
			.classed("svg-overlay-rect-scheme", function(d) { return node[0].type == "scheme"; })
			.attr("x", bbox.x - 10)
			.attr("y", bbox.y - 5)
			.attr("width", bbox.width + 20)
			.attr("height", bbox.height + 10);

		// Variable holding open state of text box
		activeTextOverlay = true;

	} else if (showAll == false) {
		// If the function call does not request all text overlays to be shown - remove text overlay
		//removeTextOverlay();
	}
}

function removeTextOverlay() {
	console.log("removeTextOverlay!");
	// Remove other text boxes and set active to false
	d3.selectAll(".svg-text-overlay, .svg-overlay").remove();
	activeTextOverlay = false;
	allActiveTextOverlay = false;
}

function moveToNodeSourceTab(id) {
	var tab = highlight.ranges.filter(function(r) {
		if (r.id == id) {
			return r;
		}
	});
	// If the tab the node was added from is different to the current (active) tab - show the tab which the text was sourced from and set the mark
	if (tab[0].tab != activeTab) {
		console.log("different tab!");
		showTab(tab[0].tab);
		addNodeMark(tab[0].id);
	}
}

function changeMouseOverNodeStatus() {
	if (nodeMouseOverEnabled == false) {
		nodeMouseOverEnabled = true;
		// Update button icon to represent action state
		$("#i-mouseover-toggle").removeClass("fa-mouse-pointer");
		$("#i-mouseover-toggle").addClass("fa-keyboard-o");
	} else {
		nodeMouseOverEnabled = false;
		// Revert button icon to represent action state
		$("#i-mouseover-toggle").removeClass("fa-keyboard-o");
		$("#i-mouseover-toggle").addClass("fa-mouse-pointer");
	}
}

function mouseOverNode(d) {
	// If the option for having node text overlays open on node mouse is set to true
	if (nodeMouseOverEnabled == true) {
		showNodeTextOverlay(d.id, false);
	}
}

function mouseOutNode(d) {
	// If all the text overlays are shown and the node mouseover option is on - remove since this is used to see all nodes
	if (allActiveTextOverlay == false && nodeMouseOverEnabled == true) {
		removeTextOverlay();
	}
}

function addNode(type,schemeName,nodePosition) {
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

			if (selectedText != "") {
				newNode.text = selectedText;
				newNode.displayText = selectedText;

				// Highlighting
				var range = {};
				range.start = start;
				range.end = end;
				range.tab = activeTab;
				range.id = Number(data.currentNodeID);
				highlight.ranges.push(range);
				addHighlighting();
			} else {
				// Show modal 1
				showModal(1);
				removeActive();
				return;
			}

			// Reset textarea selection
			textaSource.selectionStart = null;
			textaSource.selectionEnd = null;

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

			// Get the text the user entered
			var missingText = $("#txta-missing").val();

			// If the text entered is not empty set the text and displayText property to the value - else return and don't add node
			if (missingText != "") {
				newNode.text = missingText;
				newNode.displayText = missingText;
			} else {
				// Quit adding node
				return;
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
		default:
			console.log("addNode switch error!");
	}

	var newPos = findNewNodePosition(nodeX,nodeY);

	newNode.x = Number(newPos.x);
	newNode.y = Number(newPos.y);

	// Add the new node to the array
	data.nodes.push(newNode);

	// Increment the nodeId value
	data.currentNodeID = data.currentNodeID+1;

	update();
}

// Function which locates a new position for a node if one already exists in the centre of the visualisation
function findNewNodePosition(nodeX, nodeY) {
	// Variable to hold if a node is already in the centre of the svg
	var originalPositionTaken = false;

	// Find whether or not a node is already in the centre of the svg
	data.nodes.filter(function(n) {
		if ((n.x == nodeX) && (n.y == nodeY)) {
			originalPositionTaken = true;
		}
	});

	addNodeOffset = 0;
	var newX = 0;
	var newY = 0;

	// If the original position passed to this function has been taken - run the loop and find a new position - else add the node at the original position
	if (originalPositionTaken == true) {
		while(originalPositionTaken == true) {
			addNodeOffset = addNodeOffset + addNodeIncrement;
			newX = nodeX + addNodeOffset;
			newY = nodeY + addNodeOffset;

			var newPositionTaken = false;

			data.nodes.filter(function(n) {
				if ((n.x == newX) && (n.y == newY)) {
					newPositionTaken = true;
				}
			});

			if (newPositionTaken == false) {
				var newPos = {};
				newPos.x = newX;
				newPos.y = newY;
				return newPos;
			}
		}
	} else {
		var newPos = {};
		newPos.x = nodeX;
		newPos.y = nodeY;
		return newPos;
	}
}

function addLink(idStart,idEnd) {
	var node = d3.selectAll(".svg-node");
	// Remove text overlay before creating link
	removeTextOverlay();

	// If the parameter is null - set id1 to the selectedElement id
	if (idStart == null) {
		// The first id - the source of the link
		var id1 = d3.select(selectedElement).node().attr("id");
	} else {
		var id1 = idStart;
	}

	var id1Filter = data.nodes.filter(function(n) {
		return (n.id == Number(id1));
	});

	id1Type = id1Filter[0].type;

	// Loop through data.links and check for a link with the source of the current node - if one is found with type scheme - prevent the link being added
	for(var i = 0; i < data.links.length; i++) {
		if (data.links[i].source == id1 && id1Type == "scheme") {
			showModal(2);
			removeActive();
			return;
		}
	}

	// Function which displays the drag line
	dragLine(id1);

	node.on("mouseup", function(d) {
		// The second id - the target of the link
		var id2 = d3.select(this).attr("id");

		var id2Filter = data.nodes.filter(function(n) {
			return (n.id == Number(id2));
		});

		id2Type = id2Filter[0].type;

		// Check for a link with the reverse source and target - if found prevent addition, remove dragline -show modal - return
		for(var i = 0; i < data.links.length; i++) {
			if (data.links[i].source == id2 && data.links[i].target == id1) {
				// Show modal 3
				showModal(3);
				removeDragLine();
				return;
			}
		}

		// Check both nodes being linked and if they are both text they can not be linked
		if (id1Type == "text" && id2Type == "text") {
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

			// Remove drag line
			removeDragLine();
			// Remove the node as active
			removeActive();
			return;
		}
		// If the source of the link is different to the target
		if (id1 != id2) {
			addLinkToData(id1,id2);
		}
	});
	// Set the selectedElement to null
	selectedElement = null;
}

function addLinkToData(id1,id2) {
	var link = {};
	link.source = id1;
	link.target = id2;

	// Push the link to the data object
	data.links.push(link);

	update();
}

function dragLine(id) {
	var svg = d3.select("svg");
	var line = d3.select(".svg-link-drag");

	// Check the type of element the selected node
	if (selectedElement.node() instanceof SVGCircleElement) {
		// The source X and Y attribute of the node - JQuery used here because D3.js doesnt like only numeric ids
		var sourceX = $("#"+id).attr("cx");
		var sourceY = $("#"+id).attr("cy");

		// Append a circle which can be dragged from to show the line
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

		// Append a rect which can be dragged from to show the line
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
	var line = d3.select(".svg-link-drag");
    var m = d3.mouse(this);

    line.attr("x2", m[0])
        .attr("y2", m[1]);
}

function mouseup() {
	removeDragLine();
}

function removeDragLine() {
	var svg = d3.select("svg");
	var line = d3.select(".svg-link-drag");

	// Hide the line and remove the dummy node
	line.classed("hidden", true);
	d3.select(".svg-drag-node").remove();
	svg.on("mousemove", null);

	// Prevent mousing up over a node still completing the link
	var node = d3.selectAll(".svg-node");
	node.on("mouseup", null);
}

function moveElementsToFit() {
	var width = $("#svg-vis").width();
	var height = $("#svg-vis").height();

	$.each(data.nodes, function(index, value) {
		if (value.type == "scheme") {
			if (value.x >= (width - schemeContainOffset)) {
				data.nodes[index].x = (width - schemeContainOffset);
			}
			if (value.y >= (height - schemeContainOffset)) {
				data.nodes[index].y = (height - schemeContainOffset);
			}
			if (value.x <= (0 + schemeContainOffset)) {
				data.nodes[index].x = schemeContainOffset;
			}
			if (value.y <= (0 + schemeContainOffset)) {
				data.nodes[index].y = schemeContainOffset;
			}
		}
		// Increment the node radius by 1 to push entire node inside container
		var nodeOffset = nodeRadius + 1
		if (value.type == "text") {
			if (value.x >= (width - nodeOffset)) {
				data.nodes[index].x = (width - nodeOffset);
			}
			if (value.y >= (height - nodeOffset)) {
				data.nodes[index].y = (height - nodeOffset);
			}
			if (value.x <= (0 + nodeOffset)) {
				data.nodes[index].x = nodeOffset;
			}
			if (value.y <= (0 + nodeOffset)) {
				data.nodes[index].y = nodeOffset;
			}
		}
	});
	update();
}
