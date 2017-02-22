function showModal(name) {
	switch(name) {
		case 1:
			$("#div-add-missing-text").hide();
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
			$("#txta-edit-text").val("");
			$("#modal-edit-node-text").modal("show");
			break;	
		default:
			console.log("showModal Error!");
	}
}