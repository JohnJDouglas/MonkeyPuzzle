function showModal(name,id,error) {
	switch(name) {
		case 1:
			// Empty the textarea of the new node text
			$("#txta-missing").val("");
			$("#modal-no-selection").modal("show");
			break;
		case 2:
			$("#modal-already-source").modal("show");
			break;
		case 3:
			$("#modal-existing-link").modal("show");
			break;
		case 4:
			$("#modal-controls").modal("show");
			break;
		case 5:
			// Hide the settings modal
			$("#modal-settings").modal("hide");
			// Show the invalid JSON modal
			$("#modal-upload-JSON-invalid").modal("show");
			// Display the error message and location
			$("#p-upload-JSON-invalid-message").text("Error: "+error.message);
			$("#p-upload-JSON-invalid-location").text("Location: "+error.dataPath);
			break;
		case 6:
			$("#modal-clear-source").modal("show");
			break;
		case 7:
			$("#modal-remove-tab").modal("show");
			break;
		case 8:
			$("#modal-last-tab").modal("show");
			break;
		case 9:
			$("#modal-settings").modal("show");
			break;		
		case 10:
			$("#modal-maximum-tabs").modal("show");
			break;	
		case 11:
			// Empty the textarea of the new node text
			$("#txta-edit-text").val("");

			// Get the current node
			var node = data.nodes.filter(function(n) {
				if(n.id == id) {
					return n;
				}
			});
			// Based on node type set the displayText of the node into the displayed textarea
			if(node[0].type == "text") {
				$("#txta-current-node-text").val(node[0].displayText);
			} else {
				$("#txta-current-node-scheme").val(node[0].displayText);
			}

			// Hide both modal-body divs and buttons
			$(".modal-edit-text-node").hide();
			$(".modal-edit-scheme-node").hide();

			// Reset the dropdown to the top option
			$("#select-schemes").val("1");

			$("#modal-edit-node").modal("show");
			break;	
		default:
			console.log("showModal Error!");
	}
}