function showModal(name) {
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
			$("#modal-link-text").modal("show");
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