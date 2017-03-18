// The current number of tabs
var numberTabs = 1;
// The current tab
var activeTab = 1;
// The maximum number of tabs
var maxTabs = 10;
// The array of schemes for the double click modal
var schemesArray = [];
// The distance a node which is in the same position as another is offset when the upload JSON validation runs
var findNodeQuandrantOffset = 20;
// The variable for jquery.layout - global to allow toggle source button functionality (set in setupLayout)
var layout;
/*
$(window).bind("beforeunload",function() {
	if( $("#txta-source-1").val() != "" || $("#txta-source-2").val() != "" || ($("#txta-source-3").val() != "" || $("#txta-source-4").val() != "" || ($("#txta-source-5").val() != "" ||
	$("#txta-source-6").val() != "" || $("#txta-source-7").val() != "" || $("#txta-source-8").val() != "" || $("#txta-source-9").val() != "" || $("#txta-source-10").val() != "") )) {
		return confirm("Confirm refresh");
	}
});
*/
//ONLOAD FUNCTION
$(window).load(function() {
	setupLayout();
	uploadText();
	uploadJSON();
	sampleText();
	createSVG();
	setupSchemes();
	showTab(1);
	textareaRemoveActive();
	elementSizeCheck();
	moveElementsToFit();
	// DEVELOPER ONLY
	setDeveloperMode(1);

	window.addEventListener("resize", function(){
		elementSizeCheck();
	});

	// Set the text currently in the tab to the data object tabs sub-array
	$(".txta-source").on("keyup onpaste oncut", function () {
		data.tabs[(activeTab-1)].text = this.value;
	});

	console.log("Loading finished!");
});

function setDeveloperMode(type) {
	// If the function parameter is 1 - set the developer-mode localStorage item to true - else set to false
	if(type == 1) {
		localStorage.setItem("developer-mode","true");
	} else {
		localStorage.setItem("developer-mode","false");
	}
}

function getSVGDimensions() {
	var dim = {};
	dim.w = $("#svg-vis").width();
	dim.h = $("#svg-vis").height();
	return dim;
}

// Function creates the layout which allows resizing
function setupLayout() {
	if(layout != undefined) {
		layout.destroy();
	}

	if($("#txta-source-"+activeTab).data("hwt") != undefined) {
		$("#txta-source-"+activeTab).data("hwt").destroy();
	}

	var minWPercent = 0.2;
	var maxWPercent = 0.4;
	var initialWPercent = 0.3;

	layout = $(".panel-container").layout({
		center: {
		},
		west: {
			minSize: ($(window).width() * minWPercent),
			maxSize: ($(window).width() * maxWPercent)
		},
		onresize_end: function() {
			elementSizeCheck();
			moveElementsToFit();
		},
		onclose_end: function() {
			$("#i-source").removeClass("fa-chevron-left");
			$("#i-source").addClass("fa-chevron-right");
		},
		onopen_end: function() {
			$("#i-source").removeClass("fa-chevron-right");
			$("#i-source").addClass("fa-chevron-left");
			elementSizeCheck();
			moveElementsToFit();
		}
	});
	layout.sizePane("west",($(window).width() * initialWPercent));
	elementSizeCheck();
}

function addHighlighting() {
	if($("#txta-source-"+activeTab).data("hwt") != undefined) {
		$("#txta-source-"+activeTab).data("hwt").destroy();
	}
	$("#txta-source-"+activeTab).highlightWithinTextarea(onInput);
	// Setup mark ids for node setup
	setupMarks();
}

function removeHighlighting() {
	if($("#txta-source-"+activeTab).data("hwt") != undefined) {
		$("#txta-source-"+activeTab).data("hwt").destroy();
	}
}

function setupMarks() {
	var current = highlight.ranges.filter(function(i) {
		if(i.tab == activeTab) {
			return i;
		}
	});

	$("mark").each(function(index) {
		$(this).attr("id","mark-"+current[index].id);
		$(this).attr("class","mark-highlight");
	});
}

function addNodeMark(id) {	
	$("#mark-"+id).css("background","orange");
}

function removeNodeMark() {
	$(".mark-highlight").css("background","#FFFF00");
}

function merge(ranges) {
    var result = [];

	// Sort ranges by the start value
	ranges.sort(function(a,b){ return a[0] - b[0] });

    ranges.forEach(function(r) {
        if(!result.length || r[0] > result[result.length-1][1]) {
            result.push(r);
        } else {
            result[result.length-1][1] = r[1];
		}
    });
	return result;
}

function onInput() {
	var tabRanges = [];

	// Create a new array with only the start and end of the range
	$.each(highlight.ranges, function(index, value) {
		if(value.tab == activeTab) {
			var element = [];
			element[0] = value.start;
			element[1] = value.end;
			tabRanges.push(element);
		}
	});
	return merge(tabRanges);
}

function setupSchemes() {
	$("li.drop-accordian a").on("click", function(e) {
		$(this).next('ul').slideToggle();
		e.stopPropagation();
	});

	$('#firstLevelNav_small').on('hidden.bs.dropdown', function() {
		$(this).find('ul.drop-accordian-menu').hide();
	})

	// Set the onclick to addNode - with scheme type parameter and the value parameter as the text of the link
	$(".a-scheme-option").each(function(index) {
		$(this).attr("onclick", "addNode(2,'"+$(this).text()+"')");
		// Add the value of the text to the array of scheme types
		schemesArray.push($(this).text());
	});
}

function elementSizeCheck() {
	// LEFT PANEL
	if($("#div-col-left-button-top").width() < 120) {
		$(".span-col-left-button-top").hide();
	} else {
		$(".span-col-left-button-top").show();
	}
	if($("#div-col-left-button-bottom").width() < 120) {
		$(".span-col-left-button-bottom").hide();
	} else {
		$(".span-col-left-button-bottom").show();
	}
	// RIGHT PANEL
	// Not current used - col-md-1 button is only a chevron for source panel toggle
	if($("#div-col-right-button.col-md-1").width() < 120) {
		$(".span-col-right-button-1").hide();
	} else {
		$(".span-col-right-button-1").show();
	}
	// Text, Scheme, Content, and Mouseover Overlay button
	if($("#div-col-right-button.col-md-2").width() < 105) {
		$(".span-col-right-button-2").hide();
	} else {
		$(".span-col-right-button-2").show();
	}
	// Monkeypuzzle button - this hides MONKEYPUZZLE text and shows MP instead of only hiding the text
	if($("#div-col-right-button.col-md-3").width() < 130) {
		$(".span-col-right-button-3").hide();
		$(".span-col-right-button-3-small").show();
	} else {
		$(".span-col-right-button-3").show();
		$(".span-col-right-button-3-small").hide();
	}
}

function sampleText() {
	$("#txta-source-"+activeTab).val("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec in sagittis magna. Quisque augue nisl, aliquet vel vehicula sit amet, lobortis at ex."
		+ "Donec quis lacinia lorem. Pellentesque venenatis eget lacus ac sagittis. Phasellus a congue purus. Vestibulum fringilla lectus ac massa volutpat cursus. Donec ac eleifend"
		+ "tortor, et blandit erat. Quisque a consequat ligula, non tincidunt mauris. Quisque tincidunt ultrices tortor, a venenatis sapien facilisis sed. Aliquam nisl elit, tempor at"
		+ "feugiat non, tempus quis enim. Donec cursus tempus augue, vitae dapibus sem volutpat eu. Vivamus dolor sapien, porttitor fermentum tortor at, placerat malesuada sem. Sed vitae enim scelerisque,"
		+ "fringilla urna sed, tempor turpis. Fusce ac molestie dui, ut lobortis libero. Maecenas leo tellus, tempus id dictum sed, facilisis quis augue. Integer at ullamcorper enim."
		+ "Sed viverra tortor non urna hendrerit euismod. In magna ligula, faucibus at lobortis at, interdum a turpis. Maecenas laoreet lobortis elit, at commodo metus congue quis. Integer"
		+ "in egestas diam. In at velit ut lorem feugiat pulvinar in vestibulum leo. Aliquam eu eros non massa fermentum malesuada efficitur a ligula. Donec posuere consequat enim nec eleifend."
		+ "Curabitur suscipit metus et tincidunt condimentum. Ut porttitor eros fringilla, tincidunt augue vel, ultricies elit. Integer porttitor, tellus a vulputate vulputate, mauris diam mattis"
		+ "enim, et finibus sem enim maximus enim. In sollicitudin lacus fermentum tellus molestie aliquam. Donec faucibus dolor nec ex suscipit lobortis. Sed ut eros ipsum."
		+ "Suspendisse pellentesque sagittis ligula non facilisis. Nulla sed turpis eget nunc pharetra lobortis elementum vitae ante. Morbi vehicula, quam ac ultricies eleifend, ante elit semper lectus,"
		+ "tempor tincidunt erat sem fermentum libero. Vivamus semper nulla vel arcu tincidunt semper ut nec arcu. Sed in iaculis mauris. Vivamus molestie est dui, at iaculis dolor egestas id. Nullam pulvinar"
		+ "consectetur mi sit amet aliquet. Curabitur id venenatis urna. Vivamus id massa sapien. Morbi porttitor urna fermentum mi blandit, sed lacinia mi elementum. Sed nec tempus mauris. Sed quis lorem sapien."
		+ "Morbi vel maximus nisi. Ut orci mi, ultrices nec lorem sagittis, congue dictum quam. Maecenas placerat, ipsum ut consequat eleifend, metus ipsum ornare quam, eu semper purus mi nec turpis. Curabitur ut accumsan arcu."
		+ "Nam dolor nunc, tincidunt sed nunc eget, pulvinar sollicitudin arcu. Nulla et dictum erat. Phasellus pulvinar blandit mauris, aliquet pellentesque tortor sagittis sit amet. Nullam vel ex odio."
		+ "Maecenas posuere gravida mi tempor tristique. Nullam facilisis, lacus sed vestibulum hendrerit, dui felis mattis turpis, nec pellentesque diam leo eu nulla. Donec egestas risus erat, vitae efficitur ante gravida nec."
		+ "Donec accumsan, leo semper rutrum interdum, tellus felis imperdiet libero, id rutrum libero neque interdum mauris. Phasellus pharetra molestie nisi ac ullamcorper. Vestibulum nec volutpat leo. "
		+ "Maecenas eu ullamcorper metus. Aliquam commodo, justo eu accumsan sollicitudin, turpis odio rutrum ipsum, ut finibus neque lorem at nulla. Nunc eu felis volutpat, egestas felis in, vulputate ipsum."
		+ "Maecenas ullamcorper. Aliquam ut finibus neque lorem at nulla. commodo, turpis odio rutrum ipsum, justo eu accumsan sollicitudin. Nunc eu felis volutpat, egestas felis in, vulputate ipsum."
		+ "accumsan, leo semper rutrum interdum, tellus felis imperdiet libero, id rutr Phasellus pharetra molestie nisi ac ullamcorper. Vestibulum nec volutpat leo. "
		+ "semper rutrum interdum, tet libero, id rutrum libero neque interdum mauris. Phasellus pharetra molestie npat leo. "
		+ "Donec accumsan, um interdum, tellus felis  id rutrum libero neque interdum mauris. Phasellus pharetra molestie nisi ac ullamcorper. Vestibulum nec volutpat leo. ");
}

function textareaRemoveActive() {
	// When any textarea is clicked, remove the active element from d3.js
	$(".txta-source").on("focus", function () {
		removeActive();
		removeDragLine();
		removeTextOverlay();
	});
}

function lockTab() {
	// If the current tab (source and title) is readonly (locked) unlock it - else lock it
	if ($("#txta-tab-"+activeTab).attr("readonly") && $("#txta-source-"+activeTab).attr("readonly")) {
		$("#txta-tab-"+activeTab).attr("readonly", false);
		$("#txta-source-"+activeTab).attr("readonly", false);

		$("#i-lock-tab").removeClass("fa-unlock");
		$("#i-lock-tab").addClass("fa-lock");
		$("#span-lock").text(" Lock Tab");
	} else {
		$("#txta-tab-"+activeTab).attr("readonly", true);
		$("#txta-source-"+activeTab).attr("readonly", true);

		// If the tab title is empty when they lock it - set the title to default (Tab X).
		if (!$("#txta-tab-"+activeTab).val()) {
			$("#txta-tab-"+activeTab).val("Tab "+activeTab);
		}

		$("#i-lock-tab").removeClass("fa-lock");
		$("#i-lock-tab").addClass("fa-unlock");
		$("#span-lock").text(" Unlock Tab");
	}
}

function clearSource() {
	// Clear the textarea of the current tab source
	$("#txta-source-"+activeTab).val("");
	// Clear the textarea of the current tab title
	$("#txta-tab-"+activeTab).val("");
}

function uploadText() {
	// This function allows the upload button to read and upload the text back to back
	$("#fileSourceInput").on("click", function (e) {
		$(this).prop("value", "");
	});

	$("#fileSourceInput").on("change", function (e) {
		var name = readFile(this.files[0], function (e) {
			// Get the text of the current file
			var currentFile = e.target.result;

			$("#txta-source-"+activeTab).val("");
			$("#txta-source-"+activeTab).val(currentFile);

			// Update the value of the data object to include the text uploaded
			var currentTab = (activeTab - 1);
			data.tabs[currentTab].text = currentFile;
		});

		// Set the name of the tab to the name of the uploaded file
		$("#txta-tab-"+activeTab).val(name);
	});
}

function readFile(file, callback) {
	var reader = new FileReader();
	reader.onload = callback;
	reader.readAsText(file);
	// Return the file name
	return file.name;
}

// Save the current tab content as a .txt
function saveTextAsFile(type) {
	try {
		switch (Number(type)) {
			case 1:
				var textToWrite = $("#txta-source-"+activeTab).val();
				if(textToWrite == "") {
					break;
				}
				var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
				var fileNameToSaveAs = $("#txta-tab-"+activeTab).val();
				// If the file name is empty - set to the default "MonkeyPuzzle"
				if (fileNameToSaveAs == "") {
					fileNameToSaveAs = "MonkeyPuzzle";
				}
				break;
			case 2:
				var textToWrite = JSON.stringify(data);
				var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
				var fileNameToSaveAs = $("#input-download-JSON").val();
				// If the file name is empty - set to the default "MonkeyPuzzle"
				if (fileNameToSaveAs == "") {
					fileNameToSaveAs = "MonkeyPuzzle";
				}
				break
			default:
				console.log("saveTextAsFile switch error!");
		}

		var downloadLink = document.createElement("a");
		downloadLink.download = fileNameToSaveAs;
		downloadLink.innerHTML = "Download File";
		if (window.URL != null) {
			// Chrome allows the link to be clicked without actually adding it to the DOM.
			downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		} else {
			// Firefox requires the link to be added to the DOM before it can be clicked.
			downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
			downloadLink.onclick = destroyClickedElement;
			downloadLink.style.display = "none";
			document.body.appendChild(downloadLink);
		}
		downloadLink.click();
	}
	catch (e) {
		logMyErrors(e); // pass exception object to error handler
	}
}

function addTab() {
	// If the button does not have the disabled class
	if(!$("#btn-add-tab").hasClass("disabled")) {
		// If the current number of tabs is less than the maximum allowed
		if (numberTabs < maxTabs) {
			// Insert the new tab after the last tab
			$(".source-tab:last").after("<div id='div-source-tab-" + (numberTabs + 1) + "' class='source-tab no-padding-lr col-md-1'><button class='btn btn-source btn-block btn-tab' onclick='showTab(" + (numberTabs + 1) + ")'></span>" + (numberTabs + 1) + "</button></div>");
			// Set the number of tabs
			numberTabs = $(".source-tab").length;
			showTab(numberTabs);
			// Disable the add tab button - prevents the modal being spammed
			if(numberTabs == 10) {
				$("#btn-add-tab").addClass("disabled");
			}
		}
	}
}

function removeTab() {
	var sourceTextArray = [];
	var sourceTitleArray = [];

	// If there is only one tab - you can not remove it - else remove tab
	if (numberTabs == 1) {
		showModal(8);
	} else {
		// Remove the tab header
		$("#div-source-tab-" + activeTab).remove();

		// Loop through each source
		$(".txta-source").each(function(index) {
			if ((index + 1) <= numberTabs) {
				// If the source id is not the active tab - this is required because we don't want the title of current tab (it is being deleted!)
				if ($(".txta-source").eq(index).attr("id") != ("txta-source-" + activeTab)) {
					// Add the value in both the tab text and title to arrays
					sourceTextArray.push($(".txta-source").eq(index).val());
					sourceTitleArray.push($(".txta-tab").eq(index).val());
				}
			}
		});

		// Correct the number of tabs
		numberTabs = $(".source-tab").length;

		// If the number of tabs is less than the maximum - remove the disabled class
		if(numberTabs < maxTabs) {
			$("#btn-add-tab").removeClass("disabled");
		}
		// When removing tabs - set the current tab view to the first
		showTab(1);
		// Reorder tabs - orders tabs by number and updates button attributes - pass the array of source textarea values to get tabs moved
		reorderTabs(sourceTextArray, sourceTitleArray);
	}
}

function reorderTabs(sourceTextArray, sourceTitleArray) {
	// For each tab - set the id of the containing div - the button onclick parameter - the button text (note index starts at 0)
	$(".source-tab").each(function(index) {
		// Update the tab title container properties - id - the parameter passed in the onclick - the text - the tab titles
		$(this).attr("id", "div-source-tab-"+(index+1));
		$(this).children().attr("onclick", "showTab("+(index+1)+")");
		$(this).children().text((index+1));
	});

	// Empty the source textareas - replace content with values from array
	$(".txta-source").val("");
	$(".txta-tab").val("");

	// Set the value of the textarea to the correct text - based on tabs being removed
	$(".source-tab").each(function(index) {
		// If the loop index plus 1 is less than or equal to the sourceTextArrayLength
		if ((index+1) <= sourceTextArray.length) {
			$("#txta-source-"+(index+1)).val(sourceTextArray[index]);
			$("#txta-tab-"+(index+1)).val(sourceTitleArray[index]);
		}
	});

	// Loop and update the tab titles after being reordered
	$(".txta-tab").each(function(index) {
		if ($("#txta-tab-"+(index+1)).val() == "") {
			$("#txta-tab-"+(index+1)).val("Tab "+(index+1));
		}
	});
}

function showTab(num) {
	// Based on parameter - hide all the textereas and then show only the current tab textarea
	$(".txta-source").hide();
	$(".txta-tab").hide();
	$("#txta-source-"+num).show();
	$("#txta-tab-"+num).show();

	// If the tab is locked when you show it - set the lock icon else set the unlock icon
	//if($("#txta-tab-"+num).prop("readonly") && $("#txta-source-"+num).prop("readonly")) {
	if($("#txta-source-"+num).prop("readonly")) {
		$("#i-lock-tab").removeClass("fa-lock");
		$("#i-lock-tab").addClass("fa-unlock");
		$("#span-lock").text(" Unlock Tab");
	} else {
		$("#i-lock-tab").removeClass("fa-unlock");
		$("#i-lock-tab").addClass("fa-lock");
		$("#span-lock").text(" Lock Tab");
	}

	// Remove the active tab css and add it to the new activeTab
	$(".source-tab").children().removeClass("active-tab");
	$("#div-source-tab-"+num).children().addClass("active-tab");

	// Remove highlighting when switching tabs - if is used to check if the highlighting has been initialised
	if($(".hwt-container").length) {
		removeHighlighting();
	}
	activeTab = num;
	addHighlighting();
}

function copyNodeText() {
	if ($("#txta-node-text").val() != "") {
		window.prompt("Copy to clipboard: Ctrl+C -> Enter", $("#txta-node-text").val());
	}
}

function saveSVGAsPNG() {
	// Remove active element from the visualisation when saving
	removeActive();

	var fileNameToSaveAs = $("#input-SVG-file-name").val();

	// Check if the chosen filename is blank - if so set file name to "MonkeyPuzzle"
	if (fileNameToSaveAs == "") {
		fileNameToSaveAs = "MonkeyPuzzle";
	}

	// Use the library to get a PNG of the SVG
	saveSvgAsPng(document.getElementById("svg-vis"), fileNameToSaveAs);
}

function saveSVGAsSVG() {
	// Remove active element from the visualisation when saving
	removeActive();

	var SVGToWrite = $("#svg-vis")[0].outerHTML;
	var SVGFileAsBlob = new Blob([SVGToWrite], { type: "image/svg+xml;charset=utf-8" });
	var fileNameToSaveAs = $("#input-SVG-file-name").val();
	var fileExtension = ".svg";

	// Check if the chosen filename is blank - if so set file name to "MonkeyPuzzle"
	if (fileNameToSaveAs == "") {
		fileNameToSaveAs = "MonkeyPuzzle";
	}

	var downloadLink = document.createElement("a");
	downloadLink.download = fileNameToSaveAs + fileExtension;
	if (window.URL != null) {
		// Chrome allows the link to be clicked without actually adding it to the DOM.
		downloadLink.href = window.URL.createObjectURL(SVGFileAsBlob);
	} else {
		// Firefox requires the link to be added to the DOM before it can be clicked.
		downloadLink.href = window.URL.createObjectURL(SVGFileAsBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
	}
	downloadLink.click();
}

// Allow the data object to be downloaded
function saveDataAsJSON() {
	try {
		var JSONToWrite = JSON.stringify(data);
		var JSONFileAsBlob = new Blob([JSONToWrite], { type: "octet/stream" });
		var fileNameToSaveAs = $("#input-download-JSON").val();
		var fileExtension = ".json";

		// Check if the chosen filename is blank - if so set file name to "MonkeyPuzzle"
		if (fileNameToSaveAs == "") {
			fileNameToSaveAs = "MonkeyPuzzle";
		}

		var downloadLink = document.createElement("a");
		downloadLink.download = fileNameToSaveAs + fileExtension;
		if (window.URL != null) {
			// Chrome allows the link to be clicked without actually adding it to the DOM.
			downloadLink.href = window.URL.createObjectURL(JSONFileAsBlob);
		} else {
			// Firefox requires the link to be added to the DOM before it can be clicked.
			downloadLink.href = window.URL.createObjectURL(JSONFileAsBlob);
			downloadLink.onclick = destroyClickedElement;
			downloadLink.style.display = "none";
			document.body.appendChild(downloadLink);
		}
		downloadLink.click();
	}
	catch (e) {
		logMyErrors(e); // pass exception object to error handler
	}
}

function uploadJSON() {
	var schema = {
		"type": "object",
		"properties": {
			"nodes": {
				"type": "array",
					"items": {
						"type": "object",
						"properties": {
						"id": {
							"type": "integer",
							"minimum": 0,
							"exclusiveMinimum": false,
							"maximum": 99,
							"exclusiveMaximum": false
						},
						"x": {
							"type": "number",
							"minimum": 0,
							"exclusiveMinimum": false
						},
						"y": {
							"type": "number",
							"minimum": 0,
							"exclusiveMinimum": false
						},
						"text": {
							"type": "string"
						},
						"displayText": {
							"type": "string"
						},
						"type": {
							"type": "string",
							"enum": [
							"text",
							"scheme"
							]
						}
						},
						"required": [
						"id",
						"x",
						"y",
						"text",
						"displayText",
						"type"
						],
						"additionalProperties": false
					}
				},
				"links": {
					"type": "array",
						"items": {
							"type": "object",
							"properties": {
								"source": {
									"type": "integer",
									"minimum": 0,
									"exclusiveMinimum": false,
									"maximum": 99,
									"exclusiveMaximum": false
								},
								"target": {
									"type": "integer",
									"minimum": 0,
									"exclusiveMinimum": false,
									"maximum": 99,
									"exclusiveMaximum": false
								}
							},
							"required": ["source", "target"],
							"additionalProperties": false
						}
				},
				"tabs": {
					"type": "array",
						"items": {
							"type": "object",
							"properties": {
								"tab": {
									"type": "integer",
									"minimum": 1,
									"exclusiveMinimum": false,
									"maximum": 10,
									"exclusiveMaximum": false
								},
								"text": {
									"type": "string",
									"minLength": 0
								}
							},
							"required": ["tab","text"],
							"additionalProperties": false
						}
				},
				"currentNodeID": {
					"type": "number",
					"minimum": 0,
					"exclusiveMinimum": false,
					"maximum": 100,
					"exclusiveMaximum": true
				}
			},
			"required": ["nodes","links","tabs","currentNodeID"]
		};

	// This function allows the upload button to read and upload the text back to back
	$("#fileJSONInput").on("click", function (e) {
		$(this).prop("value", "");
	});

	$("#fileJSONInput").on("change", function (e) {
		readFile(this.files[0], function (e) {
			// Parse the file as JSON
			JSONData = JSON.parse(e.target.result);

			// Check the uploaded JSON against the JSON Schema
			var valid = tv4.validate(JSONData, schema);

			if(tv4.error == null) {
				// Pass the parsed data to the checkJSONInput function to validate the data
				JSONDataProcessed = checkJSONInput(JSONData);
				data = JSONDataProcessed;
				update();
				moveElementsToFit();
			} else {
				showModal(5,null,tv4.error);
				return;
			}
		});
	});
}

function checkJSONInput(json) {
	// Reset all ids to be incremental from 0 (for nodes) and 1 (for tabs)
	json = resetIDs(json);

	// Set the currentNodeID
	json = setCurrentNodeID(json);

	json.nodes = checkNodePositions(json);

	// Remove links which have a source or target which is higher than any node id
	json.links = removeInvalidLinks(json);

	// Remove links which are duplicates of another link
	json.links = removeDuplicateLinks(json);

	// Remove links which are the opposite of another link
	json.links = removeOppositeLinks(json);

	return json;
}

function resetIDs(json) {
	// Update the ids of the nodes to start at zero and increment upwards
	$.each(json.nodes, function(index, value) {
		json.nodes[index].id = index;
	});

	// Update the id of the tabs to start at zero and increment upwards
	$.each(json.tabs, function(index, value) {
		json.tabs[index].tab = index;
	});

	return json;
}

function checkNodePositions(json) {
	// Check nodes positions and update if taken
	var r = [];
	o: for(var i = 0; i < json.nodes.length; i++) {
		for(var j = 0; j < r.length; j++) {
			if(((Number(r[j].x) == Number(json.nodes[i].x)) && (Number(r[j].y) == Number(json.nodes[i].y)))) {
				// Update the node position since it is equal to a previous node
				json.nodes[i] = updateNodePosition(json.nodes[i]);
				r.push(json.nodes[i]);
				continue o;
			}
		}
		r.push(json.nodes[i]);
	}
	return r;
}

function updateNodePosition(node) {
	// Offset the node based on which quadrant of the screen it is located in
	if(node.x < ($("#svg-vis").width() / 2)) {
		node.x = (node.x - findNodeQuandrantOffset);
	} else {
		node.x = (node.x + findNodeQuandrantOffset);
	}
	if(node.y < ($("#svg-vis").height() / 2)) {
		node.y = (node.y - findNodeQuandrantOffset);
	} else {
		node.y = (node.y + findNodeQuandrantOffset);
	}
	return node;
}

function removeInvalidLinks(json) {
	var removal = json.links.filter(function(l) {
		// If a link has an id which is higher than the number of nodes return it - If a link has the same source and target return it
		if((l.source > (json.nodes.length - 1) || l.target > (json.nodes.length - 1)) || (l.source == l.target)) {
			return l;
		};
	});

	$.each(removal, function(index, value) {
		json.links.splice(json.links.indexOf(removal[index]), 1);
	});
	return json.links;
}

function removeDuplicateLinks(json) {
	// Remove duplicate link elements
	var r = [];
	o: for(var i = 0; i < json.links.length; i++) {
		for(var j = 0; j < r.length; j++) {
			if(r[j].source == json.links[i].source && r[j].target == json.links[i].target) {
				continue o;
			}
		}
		r.push(json.links[i]);
	}
	return r;
}

function removeOppositeLinks(json) {
	// Remove duplicate link elements
	var r = [];
	o: for(var i = 0; i < json.links.length; i++) {
		for(var j = 0; j < r.length; j++) {
			if(r[j].source == json.links[i].target && r[j].target == json.links[i].source) {
				continue o;
			}
		}
		r.push(json.links[i]);
	}
	return r;
}

function setCurrentNodeID(json) {
	json.currentNodeID = json.nodes.length;
	return json;
}