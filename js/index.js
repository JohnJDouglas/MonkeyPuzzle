var selectedText = "";
var selectedTextMaxLength = 20;
var sourceToggle = false;
var numberTabs = 1;
var activeTab = 1;
var maxTabs = 10;
var sourceMaxWidth = 30;
var sourceIncrement = 5;
//var highlightRange = [[100, 200], [350, 400]];
var highlightRange = [];
//var highlightRange = [[0,80],[656,716]];
var highlightColor = "yellow";
var wasUnlocked = null;
var schemesArray = [];
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
	uploadText();
	sampleText();
	createSVG();
	setupSchemes();
	showTab(1);
	toggleSource(1);
	textareaRemoveActive();

	var w = $("svg").width();
	var h = $("svg").height();

	console.log("svg w="+w);
	console.log("svg h="+h);

	moveElementsToFit(w, h);

	// Set the text currently in the tab to the data object tabs sub-array
	$(".txta-source").on("keyup paste", function() {
		var currentTab = (activeTab-1);
		data.tabs[currentTab].text = this.value;
	});

	mouseOverTextOverlay();
});

function setupSchemes() {
	/*
	console.log("createSchemeDropdown()");
	var schemeTypeArray = ["Perception","Memory","Statistical Syllogism","Induction","Temporal persistence","General Knowledge","Witness Testimony","Argument From Sign","Argument from Example","Argument from Verbal Classification","Argument from Commitment","Circumstantial Argument Against the Person","Argument from Position to Know","Argument from Expert Opinion","Argument from Evidence to a Hypothesis","Argument from Falsification of a Hypothesis","Argument from Correlation to Cause","Argument from Cause to Effect","Argument from Consequences","Argument from Analogy","Argument from Waste","Argument from Popular Opinion","Argument from Popular Practice","Ethotic Argument","Argument from Bias","Argument from an Established Rule","Argument from an Exceptional Case","Argument from Precedent","Argument from Gradualism","Causal Slippery Slope Argument","Precedent Slippery Slope Argument","Argument from Vagueness of a Verbal Classification","Argument from Arbitrariness of a Verbal Classification","Verbal Slippery Slope Argument","Full Slippery Slope Argument","Deductive Argument from Ignorance","Plausible Argument from Ignorance","Probabilifying Conveyance Argument","Argument from the Sameness of Meaning","Argument from Singular Cause","Argument to Common Cause","Class-Membership Argument","Argument from Species to Genus","Argument to Singular Cause","Argument from Numerical Identity","Argument from Causal Law","Argument from the Constitution of Concrete Facts.","Argument from the Constitution of Properties","Argument from the Constitution of Positive Normative Facts","Argument from the Constitution of Causal Laws","Argument from Implication","Argument from the Constitution of Negative Normative Facts","Argument from the Constitution of Constitution Facts","Argument from the Constitution of Necessary Conditions","Argument from the Constitution of Possibilities","Argument from the Constitution of Singular Causal Conditionals","Argument from the Constitution of Singular Causal Facts","Argument from the Constitution of Kind Instance","Argument from Whole to Part","Argument from Non-Causal Law","Argument from the Constitution of Impossibilities","Argument from Part to Whole"];

	// Number of types of scheme that have been input
	var schemeTypeArrayLength = schemeTypeArray.length;
	console.log("schemeTypeArrayLength="+schemeTypeArray.length);
	// Number of scheme types per dropdown
	var schemeNumberPerDropdown = 20;
	// Get the number of dropdowns required
	var schemeTypeDropdowns = Math.ceil(schemeTypeArrayLength / schemeNumberPerDropdown);
	console.log("schemeTypeDropdowns="+schemeTypeDropdowns);

	if(schemeTypeArrayLength > 0) {
		for(i = 0; i < schemeTypeDropdowns; i++){
			// Add a default scheme option to the beginning of the list
			if(i == 0) {
				$("#ul-scheme").append("<li id='li-default'></li>");
				$("#li-default").attr("onclick","addNode(2,'Default')");
				$("#li-default").append("<a>Default</a>");
			}
			$("#ul-scheme").append("<li id='li-submenu-"+(i+1)+"' class='dropdown-submenu'></li>");
			$("#li-submenu-"+(i+1)).append("<a id='a-menu-"+(i+1)+"' class='test' tabindex='-1' href='#'>Argument Menu "+(i+1)+" <span class='caret'></span></a>");
			$("#li-submenu-"+(i+1)).append("<ul id='li-menu-"+(i+1)+"' class='dropdown-menu li-menu'>");
		}

		// For each scheme type - (the element index / number of schemes per dropdown) floored is the list which the element should be added
		$.each(schemeTypeArray, function(index, value) {
			var listNumber = Math.floor(index/schemeNumberPerDropdown);
			listNumber = listNumber + 1;
			var onclick = "addNode(2,"+schemeTypeArray[index]+")";
			$("#li-menu-"+listNumber).append("<li id='li-scheme-"+index+"' class='li-scheme li-scheme-"+listNumber+"'><a>"+schemeTypeArray[index]+"</a></li>");
		});

		$(".li-scheme").each(function(index) {
			$(this).attr("onclick","addNode(2,'"+schemeTypeArray[index]+"')");
		});
	}
	*/
	// Set the onclick to addNode - with scheme type parameter and the value parameter as the text of the link - Fill the schemesArray with all schemes
	$(".a-scheme-option").each(function(index) {
		//$(".a-scheme-option").eq(index).attr("onclick","addNode(2,'"+$(".a-scheme-option").eq(index).text()+"')");
		$(this).attr("onclick","addNode(2,'"+$(this).text()+"')");
		// Add the value of the text to the array of scheme types
		schemesArray.push($(this).text());
	});

	console.log("schemesArray="+schemesArray);
}


function panelResize(type) {
	// If the parameter is 0 - start dragging - else end
	if(Number(type) == 0) {
		console.log("Resizing Start");
		$("#txta-source-"+activeTab).addClass("noSelect");
		// Start - if the tab is not readonly (aka you could edit this)
		if(!$("#txta-source-"+activeTab).prop("readonly")) {
			console.log("you could edit this tab");
			// Prevent editing
			$("#txta-source-"+activeTab).prop("readonly", true);
			wasUnlocked = true;
		}
	} else {
		console.log("Resizing End");
		$("#txta-source-"+activeTab).removeClass("noSelect");
		if(wasUnlocked == true) {
			console.log("wasUnlocked == true!");
			$("#txta-source-"+activeTab).prop("readonly", false);
		}
		// Update the node positions when a drag is finished
		var w = $("#svg-vis").width();
		var h = $("#svg-vis").height();

		moveElementsToFit(w,h);
	}
}

function removeHighlight() {
	$("#txta-source-"+activeTab).data('hwt').destroy();
}

function onInputArray(input) {
	return highlightRange;
}

function sourceChange(type) {
	// If the parameter is 0 then decrease the source max width - else increase the value
	if(Number(type) == 0) {
		if(sourceMaxWidth > 20) {
			sourceMaxWidth = sourceMaxWidth - sourceIncrement;
			$("#input-source-display").val(sourceMaxWidth+"%");
			$(".panel-left").css("max-width",sourceMaxWidth+"%");
		}
	} else {
		if(sourceMaxWidth < 50) {
			sourceMaxWidth = sourceMaxWidth + sourceIncrement;
			$("#input-source-display").val(sourceMaxWidth+"%");
			$(".panel-left").css("max-width",sourceMaxWidth+"%");
		}
	}
}

function toggleSource(toggle) {
	console.log("toggleSource()");
	if(toggle == 1) {
		sourceToggle = true;
	} else if(toggle == 0) {
		sourceToggle = false;
	}
	if(sourceToggle == false) {
		$("#col-left").hide();
		$(".splitter").hide();
		
		$("#i-source").removeClass("fa-chevron-left");
		$("#i-source").addClass("fa-chevron-right");
		
		sourceToggle = true;
	} else {
		$("#col-left").show();	
		$(".splitter").show();
		
		$("#i-source").removeClass("fa-chevron-right");
		$("#i-source").addClass("fa-chevron-left");

		var w = $("#svg-vis").width();
		var h = $("#svg-vis").height();

		moveElementsToFit(w,h);
		
		sourceToggle = false;
	}
}

function sampleText() {
	$("#txta-source"+activeTab).val("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec in sagittis magna. Quisque augue nisl, aliquet vel vehicula sit amet, lobortis at ex."
	+"Donec quis lacinia lorem. Pellentesque venenatis eget lacus ac sagittis. Phasellus a congue purus. Vestibulum fringilla lectus ac massa volutpat cursus. Donec ac eleifend"
	+"tortor, et blandit erat. Quisque a consequat ligula, non tincidunt mauris. Quisque tincidunt ultrices tortor, a venenatis sapien facilisis sed. Aliquam nisl elit, tempor at"
	+"feugiat non, tempus quis enim. Donec cursus tempus augue, vitae dapibus sem volutpat eu. Vivamus dolor sapien, porttitor fermentum tortor at, placerat malesuada sem. Sed vitae enim scelerisque,"
	+"fringilla urna sed, tempor turpis. Fusce ac molestie dui, ut lobortis libero. Maecenas leo tellus, tempus id dictum sed, facilisis quis augue. Integer at ullamcorper enim."
	+"Sed viverra tortor non urna hendrerit euismod. In magna ligula, faucibus at lobortis at, interdum a turpis. Maecenas laoreet lobortis elit, at commodo metus congue quis. Integer"
	+"in egestas diam. In at velit ut lorem feugiat pulvinar in vestibulum leo. Aliquam eu eros non massa fermentum malesuada efficitur a ligula. Donec posuere consequat enim nec eleifend."
	+"Curabitur suscipit metus et tincidunt condimentum. Ut porttitor eros fringilla, tincidunt augue vel, ultricies elit. Integer porttitor, tellus a vulputate vulputate, mauris diam mattis"
	+"enim, et finibus sem enim maximus enim. In sollicitudin lacus fermentum tellus molestie aliquam. Donec faucibus dolor nec ex suscipit lobortis. Sed ut eros ipsum."
	+"Suspendisse pellentesque sagittis ligula non facilisis. Nulla sed turpis eget nunc pharetra lobortis elementum vitae ante. Morbi vehicula, quam ac ultricies eleifend, ante elit semper lectus,"
	+"tempor tincidunt erat sem fermentum libero. Vivamus semper nulla vel arcu tincidunt semper ut nec arcu. Sed in iaculis mauris. Vivamus molestie est dui, at iaculis dolor egestas id. Nullam pulvinar"
	+"consectetur mi sit amet aliquet. Curabitur id venenatis urna. Vivamus id massa sapien. Morbi porttitor urna fermentum mi blandit, sed lacinia mi elementum. Sed nec tempus mauris. Sed quis lorem sapien."
	+"Morbi vel maximus nisi. Ut orci mi, ultrices nec lorem sagittis, congue dictum quam. Maecenas placerat, ipsum ut consequat eleifend, metus ipsum ornare quam, eu semper purus mi nec turpis. Curabitur ut accumsan arcu."
	+"Nam dolor nunc, tincidunt sed nunc eget, pulvinar sollicitudin arcu. Nulla et dictum erat. Phasellus pulvinar blandit mauris, aliquet pellentesque tortor sagittis sit amet. Nullam vel ex odio."
	+"Maecenas posuere gravida mi tempor tristique. Nullam facilisis, lacus sed vestibulum hendrerit, dui felis mattis turpis, nec pellentesque diam leo eu nulla. Donec egestas risus erat, vitae efficitur ante gravida nec."
	+"Donec accumsan, leo semper rutrum interdum, tellus felis imperdiet libero, id rutrum libero neque interdum mauris. Phasellus pharetra molestie nisi ac ullamcorper. Vestibulum nec volutpat leo. "
	+"Maecenas eu ullamcorper metus. Aliquam commodo, justo eu accumsan sollicitudin, turpis odio rutrum ipsum, ut finibus neque lorem at nulla. Nunc eu felis volutpat, egestas felis in, vulputate ipsum."
	+"Maecenas ullamcorper. Aliquam ut finibus neque lorem at nulla. commodo, turpis odio rutrum ipsum, justo eu accumsan sollicitudin. Nunc eu felis volutpat, egestas felis in, vulputate ipsum."
	+"accumsan, leo semper rutrum interdum, tellus felis imperdiet libero, id rutr Phasellus pharetra molestie nisi ac ullamcorper. Vestibulum nec volutpat leo. "
	+"semper rutrum interdum, tet libero, id rutrum libero neque interdum mauris. Phasellus pharetra molestie npat leo. "
	+"Donec accumsan, um interdum, tellus felis  id rutrum libero neque interdum mauris. Phasellus pharetra molestie nisi ac ullamcorper. Vestibulum nec volutpat leo. ");
}

function textareaRemoveActive() {
	console.log("textareaRemoveActive()");
	// When any textarea is clicked, remove the active element from d3.js
	$(".txta-source").on("focus",function() {
		removeActive();
		removeDragLine();
		removeTextOverlay();
		clearTextRow();
	});
}

function lockTab() {
	// If the current tab (source and title) is readonly (locked) unlock it - else lock it
	if($("#txta-tab-"+activeTab).prop("readonly") && $("#txta-source-"+activeTab).prop("readonly")) {
		$("#txta-tab-"+activeTab).prop("readonly", false);
		$("#txta-source-"+activeTab).prop("readonly", false);

		$("#i-lock-tab").removeClass("fa-unlock");
		$("#i-lock-tab").addClass("fa-lock");
		$("#span-lock").text(" Lock Tab");
	} else {
		$("#txta-tab-"+activeTab).prop("readonly", true);
		$("#txta-source-"+activeTab).prop("readonly", true);

		// If the tab title is empty when they lock it - set the title to default (Tab X).
		if(!$("#txta-tab-"+activeTab).val()) {
			console.log("tab title empty locking!");
			$("#txta-tab-"+activeTab).val("Tab "+activeTab);
		}

		$("#i-lock-tab").removeClass("fa-lock");
		$("#i-lock-tab").addClass("fa-unlock");
		$("#span-lock").text(" Unlock Tab");
	}
}

function clearSource() {
	// Clear the textarea of the current textarea
	$("#txta-source-"+activeTab).val("");
}

function uploadText() {
	console.log("uploadText()");
	// This function allows the upload button to read and upload the text back to back
	$("#fileInput").on("click", function(e){
    	$(this).prop("value", "");
	});

	$("#fileInput").on("change", function(e) {
		var name = readFile(this.files[0], function(e) {
			// Get the text of the current file
			var currentFile = e.target.result;
			
			$("#txta-source-"+activeTab).val("");
			console.log("text="+currentFile);
			$("#txta-source-"+activeTab).val(currentFile);

			// Update the value of the data object to include the text uploaded
			var currentTab = (activeTab-1);
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
		switch(Number(type)) {
			case 1:
				// TODO - Update this to check for a title
				var textToWrite = $("#txta-source-"+activeTab).val();
				var textFileAsBlob = new Blob([ textToWrite ], { type: 'text/plain' });
				var fileNameToSaveAs = "MonkeyPuzzleTab"+activeTab;
				break;
			case 2:
				var textToWrite = JSON.stringify(data);
				var textFileAsBlob = new Blob([ textToWrite ], { type: 'text/plain' });
				var fileNameToSaveAs = $("#input-download-JSON").val();
				// If the file name is empty - set to the default "data"
				if(fileNameToSaveAs == "") {
					fileNameToSaveAs = "data";
				}
				break
			default:
				console.log("saveTextAsFile switch error!");
		}
		//var textToWrite = $("#txta-source-"+activeTab).val();
		//var textFileAsBlob = new Blob([ textToWrite ], { type: 'text/plain' });
		//var fileNameToSaveAs = "MonkeyPuzzleTab"+activeTab;

		var downloadLink = document.createElement("a");
		downloadLink.download = fileNameToSaveAs;
		downloadLink.innerHTML = "Download File";
		if(window.URL != null) {
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
	if(numberTabs < maxTabs) {
		// Insert the new tab after the last tab
		$(".source-tab:last").after("<div id='div-source-tab-"+(numberTabs+1)+"' class='source-tab no-padding-lr col-md-1'><button class='btn btn-source btn-block' onclick='showTab("+(numberTabs+1)+")'></span>"+(numberTabs+1)+"</button></div>");
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
	if(numberTabs == 1)  {
		console.log("removeTab activeTab="+activeTab);
		showModal(8);
	} else {
		// Log the active tab
		console.log("activeTab="+activeTab);

		// Log the contents of each tab text and tab title
		$(".txta-source").each(function(index) {
			console.log("txta-source-"+(index+1)+$("#txta-source-"+(index+1)).val());
			console.log("txta-tab-"+(index+1)+$("#txta-tab-"+(index+1)).val());
		});

		// Remove the tab header
		$("#div-source-tab-"+activeTab).remove();

		// Loop through each source
		$(".txta-source").each(function(index) {
			if((index+1) <= numberTabs) {
				// If the source id is not the active tab - this is required because we don't want the title of current tab (it is being deleted!)
				if($(".txta-source").eq(index).attr("id") != ("txta-source-"+activeTab)) {
					// Log the contents of each tab text and title
					console.log("txta-source-"+(index+1)+"="+$(".txta-source").eq(index).val());
					console.log("txta-tab-"+(index+1)+"="+$(".txta-tab").eq(index).val());
					// Add the value in both the tab text and title to arrays
					sourceTextArray.push($(".txta-source").eq(index).val());
					sourceTitleArray.push($(".txta-tab").eq(index).val());
				}
			}
		});

		// Correct the number of tabs
		numberTabs = $(".source-tab").length;
		console.log("numberTabs="+Number(numberTabs));

		// Log the arrays
		console.log("sourceTextArray="+JSON.stringify(sourceTextArray));
		console.log("sourceTitleArray="+JSON.stringify(sourceTitleArray));

		// When removing tabs - set the current tab view to the first
		showTab(1);
		// Reorder tabs - orders tabs by number and updates button attributes - pass the array of source textarea values to get tabs moved
		reorderTabs(sourceTextArray,sourceTitleArray);
	}
}

function reorderTabs(sourceTextArray,sourceTitleArray) {
	// For each tab - set the id of the containing div - the button onclick parameter - the button text (note index starts at 0)
	$(".source-tab").each(function(index) {
		// Update the tab title container properties - id - the parameter passed in the onclick - the text - the tab titles 
		$(this).attr("id","div-source-tab-"+(index+1));
		$(this).children().attr("onclick","showTab("+(index+1)+")");
		$(this).children().text((index+1));
	});

	// Empty the source textareas - replace content with values from array
	$(".txta-source").val("");
	$(".txta-tab").val("");

	// Set the value of the textarea to the correct text - based on tabs being removed
	$(".source-tab").each(function(index) {
		// If the loop index plus 1 is less than or equal to the sourceTextArrayLength
		if((index+1) <= sourceTextArray.length) {
			$("#txta-source-"+(index+1)).val(sourceTextArray[index]);
			$("#txta-tab-"+(index+1)).val(sourceTitleArray[index]);
		}
	});

	// Loop and update the tab titles after being reordered
	$(".txta-tab").each(function(index) {
		if($("#txta-tab-"+(index+1)).val() == "") {
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
	if($("#txta-tab-"+num).prop("readonly") && $("#txta-source-"+num).prop("readonly")) {
		$("#i-lock-tab").removeClass("fa-lock");
		$("#i-lock-tab").addClass("fa-unlock");
	} else {
		$("#i-lock-tab").removeClass("fa-unlock");
		$("#i-lock-tab").addClass("fa-lock");
	}

	// Remove the active tab css and add it to the new activeTab
	$(".source-tab").children().removeClass("active-tab");
	$("#div-source-tab-"+num).children().addClass("active-tab");

	activeTab = num;
	console.log("activeTab="+activeTab);
}

function copyNodeText() {
	console.log("copyNodeText!");
	if($("#txta-node-text").val() != "") {
		window.prompt("Copy to clipboard: Ctrl+C -> Enter", $("#txta-node-text").val());
	}
}

function saveSVGAsPNG() {
	// Remove active element from the visualisation when saving
	removeActive();

	// Use the library to get a PNG of the SVG
	saveSvgAsPng(document.getElementById("svg-vis"), $("#input-SVG-file-name").val());
}

function saveSVGAsSVG() {
	// Remove active element from the visualisation when saving
	removeActive();

	var SVGToWrite = $("#svg-vis")[0].outerHTML;
	var SVGFileAsBlob = new Blob([ SVGToWrite ], { type: "image/svg+xml;charset=utf-8" });
	var fileNameToSaveAs = $("#input-SVG-file-name").val();
	var fileExtension = ".svg";

	var downloadLink = document.createElement("a");
	downloadLink.download = fileNameToSaveAs+fileExtension;
	if(window.URL != null) {
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
		var JSONFileAsBlob = new Blob([JSONToWrite], {type: "octet/stream"});
		var fileNameToSaveAs = $("#input-download-JSON").val();
		var fileExtension = ".json";

		var downloadLink = document.createElement("a");
		downloadLink.download = fileNameToSaveAs+fileExtension;
		if(window.URL != null) {
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

//TODO: check uploaded JSON for correct format
function uploadJSON() {

}