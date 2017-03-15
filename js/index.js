// The current number of tabs
var numberTabs = 1;
// The current tab
var activeTab = 1;
// The maximum number of tabs
var maxTabs = 10;
//var wasUnlocked = null;
var schemesArray = [];
// The distance a node which is in the same position as another is offset when the upload JSON validation runs
var findNodeQuandrantOffset = 20;
// The variable for jquery.layout - global to allow toggle source button functionality (set in setupLayout)
var layout;

/*
$(window).bind("beforeunload",function(){
	// TODO - update this to account for all 10 tabs
	if(($("#txta-source-1").val() != "") || ($("#txta-source-2").val() != "") || ($("#txta-source-3").val() != "") || ($("#txta-source-4").val() != "") || ($("#txta-source-5").val() != "")) {
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
	clipboardSetup();
	elementSizeCheck();
	moveElementsToFit();
	mouseOverTextOverlay();

	window.addEventListener("resize", function(){
		elementSizeCheck();
	});

	// Set the text currently in the tab to the data object tabs sub-array
	$(".txta-source").on("keyup onpaste oncut", function () {
		data.tabs[(activeTab-1)].text = this.value;
	});

	var result = merge([[20,30],[28,33],[0,5],[4,10],[35,40]]);
	console.log("result="+JSON.stringify(result));
});


// Function creates the layout which allows resizing
function setupLayout() {
	console.log("setupLayout()");

	if(layout != undefined) {
		layout.destroy();
	}

	if($("#txta-source-"+activeTab).data("hwt") != undefined) {
		$("#txta-source-"+activeTab).data("hwt").destroy();
	}

	var minS = ($(window).width() * 0.2);
	var maxS = ($(window).width() * 0.4);

	layout = $(".panel-container").layout({
		center: {
		},
		west__size: minS,
		west: {
			minSize: minS,
			maxSize: maxS				
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
	elementSizeCheck();
}

function addHighlighting() {
	if($("#txta-source-"+activeTab).data("hwt") != undefined) {
		$("#txta-source-"+activeTab).data("hwt").destroy();
	}
	$("#txta-source-"+activeTab).highlightWithinTextarea(onInput);
	mark();
}

function removeHighlighting() {
	if($("#txta-source-"+activeTab).data("hwt") != undefined) {
		$("#txta-source-"+activeTab).data("hwt").destroy();
	}
}

function mark() {
	$("mark").each(function(index) {
		$(this).attr("id","mark-"+index);
		$(this).attr("class","mark-highlight");
	});
	console.log("closest="+JSON.stringify($(".hwt-container").closest("mark").attr("id")));
	
	$(".mark-highlight").on("mouseover", function() {
		console.log("mouseover mark id="+$(this).attr("id"));
	});
}

function addNodeMark(id) {
	console.log("addNodeMark()");
	$("#mark-"+id).css("background","orange");
}

function removeNodeMark() {
	console.log("removeNodeMark()");
	$(".mark-highlight").css("background","#FFFF00");
}

function merge(ranges) {
    var result = [];

	// Sort ranges by the start value
	ranges.sort(function(a,b){ return a[0] - b[0] });

    ranges.forEach(function(r) {
        if(!result.length || r[0] > result[result.length-1][1])
            result.push(r);
        else
            result[result.length-1][1] = r[1];
    });
    return result;
}

function onInput() {
	console.log("range="+JSON.stringify(highlight.ranges[(activeTab-1)].range));
	var merged = merge(highlight.ranges[(activeTab-1)].range);
	console.log("merged="+JSON.stringify(merged));
	return merged;
	
}

function clipboardSetup() {
	if(Clipboard.isSupported() == true) {
		var clipboard = new Clipboard(".btn-clipboard");
		clipboard.on("success", function(e) {
			console.log(e);
						var start = textaSource.selectionStart;
			var end = textaSource.selectionEnd;
			var selectedText = textaSource.value.substring(start,end);
		});
	} else {
		$(".btn-clipboard").hide();
	}
}

function setupSchemes() {
	$("li.drop-accordian a").on("click", function(e) {
		$(this).next('ul').slideToggle();
		e.stopPropagation();
	});

	$('#firstLevelNav_small').on('hidden.bs.dropdown', function() {
		$(this).find('ul.drop-accordian-menu').hide();
	})

	// Set the onclick to addNode - with scheme type parameter and the value parameter as the text of the link - Fill the schemesArray with all schemes
	$(".a-scheme-option").each(function(index) {
		//$(".a-scheme-option").eq(index).attr("onclick","addNode(2,'"+$(".a-scheme-option").eq(index).text()+"')");
		$(this).attr("onclick", "addNode(2,'"+$(this).text()+"')");
		// Add the value of the text to the array of scheme types
		schemesArray.push($(this).text());
	});
	console.log("schemesArray="+schemesArray);
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
	$("#txta-source-"+activeTab).val("Bears area Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec in sagittis magna. Quisque augue nisl, aliquet vel vehicula sit amet, lobortis at ex."
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
	console.log("textareaRemoveActive()");
	// When any textarea is clicked, remove the active element from d3.js
	$(".txta-source").on("focus", function () {
		removeActive();
		removeDragLine();
		removeTextOverlay();
	});
}

function lockTab() {
	// If the current tab (source and title) is readonly (locked) unlock it - else lock it
	if ($("#txta-tab-" + activeTab).prop("readonly") && $("#txta-source-" + activeTab).prop("readonly")) {
		$("#txta-tab-" + activeTab).prop("readonly", false);
		$("#txta-source-" + activeTab).prop("readonly", false);

		$("#i-lock-tab").removeClass("fa-unlock");
		$("#i-lock-tab").addClass("fa-lock");
		$("#span-lock").text(" Lock Tab");
	} else {
		$("#txta-tab-" + activeTab).prop("readonly", true);
		$("#txta-source-" + activeTab).prop("readonly", true);

		// If the tab title is empty when they lock it - set the title to default (Tab X).
		if (!$("#txta-tab-" + activeTab).val()) {
			console.log("tab title empty locking!");
			$("#txta-tab-" + activeTab).val("Tab " + activeTab);
		}

		$("#i-lock-tab").removeClass("fa-lock");
		$("#i-lock-tab").addClass("fa-unlock");
		$("#span-lock").text(" Unlock Tab");
	}
}

function clearSource() {
	// Clear the textarea of the current tab source
	$("#txta-source-" + activeTab).val("");
	// Clear the textarea of the current tab title
	$("#txta-tab-" + activeTab).val("");
}

function uploadText() {
	console.log("uploadText()");
	// This function allows the upload button to read and upload the text back to back
	$("#fileSourceInput").on("click", function (e) {
		$(this).prop("value", "");
	});

	$("#fileSourceInput").on("change", function (e) {
		var name = readFile(this.files[0], function (e) {
			// Get the text of the current file
			var currentFile = e.target.result;

			$("#txta-source-"+activeTab).val("");
			console.log("text="+currentFile);
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
	console.log(file.name);
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
	// If the current number of tabs is less than the maximum allowed
	if (numberTabs < maxTabs) {
		// Insert the new tab after the last tab
		$(".source-tab:last").after("<div id='div-source-tab-" + (numberTabs + 1) + "' class='source-tab no-padding-lr col-md-1'><button class='btn btn-source btn-block btn-tab' onclick='showTab(" + (numberTabs + 1) + ")'></span>" + (numberTabs + 1) + "</button></div>");
		// Set the number of tabs
		numberTabs = $(".source-tab").length;
		showTab(numberTabs);
	} else {
		// Show max tab modal
		showModal(10);
	}
}

function removeTab() {
	var sourceTextArray = [];
	var sourceTitleArray = [];

	// If there is only one tab - you can not remove it - else remove tab
	if (numberTabs == 1) {
		console.log("removeTab activeTab=" + activeTab);
		showModal(8);
	} else {
		// Log the active tab
		console.log("activeTab=" + activeTab);

		// Log the contents of each tab text and tab title
		$(".txta-source").each(function(index) {
			console.log("txta-source-" + (index + 1) + $("#txta-source-" + (index + 1)).val());
			console.log("txta-tab-" + (index + 1) + $("#txta-tab-" + (index + 1)).val());
		});

		// Remove the tab header
		$("#div-source-tab-" + activeTab).remove();

		// Loop through each source
		$(".txta-source").each(function(index) {
			if ((index + 1) <= numberTabs) {
				// If the source id is not the active tab - this is required because we don't want the title of current tab (it is being deleted!)
				if ($(".txta-source").eq(index).attr("id") != ("txta-source-" + activeTab)) {
					// Log the contents of each tab text and title
					console.log("txta-source-" + (index + 1) + "=" + $(".txta-source").eq(index).val());
					console.log("txta-tab-" + (index + 1) + "=" + $(".txta-tab").eq(index).val());
					// Add the value in both the tab text and title to arrays
					sourceTextArray.push($(".txta-source").eq(index).val());
					sourceTitleArray.push($(".txta-tab").eq(index).val());
				}
			}
		});

		// Correct the number of tabs
		numberTabs = $(".source-tab").length;
		console.log("numberTabs=" + Number(numberTabs));

		// Log the arrays
		console.log("sourceTextArray=" + JSON.stringify(sourceTextArray));
		console.log("sourceTitleArray=" + JSON.stringify(sourceTitleArray));

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
	if ($("#txta-tab-"+num).prop("readonly") && $("#txta-source-"+num).prop("readonly")) {
		$("#i-lock-tab").removeClass("fa-lock");
		$("#i-lock-tab").addClass("fa-unlock");
	} else {
		$("#i-lock-tab").removeClass("fa-unlock");
		$("#i-lock-tab").addClass("fa-lock");
	}

	// Remove the active tab css and add it to the new activeTab
	$(".source-tab").children().removeClass("active-tab");
	$("#div-source-tab-"+num).children().addClass("active-tab");

	// Remove highlighting when switching tabs - if is used to check if the highlighting has been initialised
	if($(".hwt-container").length) {
		removeHighlighting();
	}
	activeTab = num;
	console.log("activeTab=" + activeTab);

	addHighlighting();
}

function copyNodeText() {
	console.log("copyNodeText!");
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
	console.log("saveDataAsJSON()");
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
	console.log("uploadJSON()");
	
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

			console.log("valid="+JSON.stringify(valid));
			console.log("errors="+JSON.stringify(tv4.error));
			
			if(tv4.error == null) {
				console.log("VALIDATED!");
				// Pass the parsed data to the checkJSONInput function to validate the data 
				JSONDataProcessed = checkJSONInput(JSONData);	

				console.log("Corrected JSON="+JSON.stringify(JSONDataProcessed));

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

	//json.nodes = checkNodePositions(json);
	var test = checkNodePositions(json);

	console.log("test="+JSON.stringify(test));

	// Remove links which have a source or target which is higher than any node id
	json.links = removeInvalidLinks(json);

	// Remove links which are duplicates of another link
	json.links = removeDuplicateLinks(json);

	// Remove links which are the opposite of another link
	json.links = removeOppositeLinks(json);

	// Display the resulting json object
	console.log("json="+JSON.stringify(json));

	return json;
}

function resetIDs(json) {
	// Update the ids of the nodes to start at zero and increment upwards
	$.each(json.nodes, function(index, value) {
		//console.log("value["+index+"]="+JSON.stringify(value));
		json.nodes[index].id = index;
	});

	// Update the id of the tabs to start at zero and increment upwards
	$.each(json.tabs, function(index, value) {
		//console.log("value["+index+"]="+JSON.stringify(value));
		json.tabs[index].tab = index;	
	});
	return json;
}

function checkNodePositions(json) {
	// Remove duplicate link elements
	var r = [];
	o: for(var i = 0; i < json.nodes.length; i++) {
		for(var j = 0; j < r.length; j++) {
			if(((Number(r[j].x) == Number(json.nodes[i].x)) && (Number(r[j].y) == Number(json.nodes[i].y)))) {
				// Update the node position since it is equal to a previous node
				updateNodePosition(json.nodes[i]);
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
}

function removeInvalidLinks(json) { 
	var removal = json.links.filter(function(l) {
		// If a link has an id which is higher than the number of nodes return it - If a link has the same source and target return it
		if((l.source > (json.nodes.length - 1) || l.target > (json.nodes.length - 1)) || (l.source == l.target)) {
			return l;
		};
	});
	console.log("removal="+JSON.stringify(removal));

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