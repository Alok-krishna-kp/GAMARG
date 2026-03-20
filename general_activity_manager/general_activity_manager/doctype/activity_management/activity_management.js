// Copyright (c) 2026, gamarg and contributors
// For license information, please see license.txt

frappe.ui.form.on("Activity Management", {
	participant: function(frm) {
		if (frm.doc.participant && frm.doc.participant_type) {
			// Fetch the department from the selected participant (Student or Faculty)
			frappe.db.get_value(frm.doc.participant_type, frm.doc.participant, 'department')
				.then(r => {
					if (r && r.message) {
						frm.set_value('department', r.message.department);
					}
				});
		} else {
			frm.set_value('department', '');
		}
	},
	participant_type: function(frm) {
		// Clear participant and department when type changes
		frm.set_value('participant', '');
		frm.set_value('department', '');
	}
});
