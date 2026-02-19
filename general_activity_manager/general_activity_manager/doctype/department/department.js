frappe.query_reports["Student Activity Statement"] = {
    "filters": [
        {
            "fieldname": "participant",
            "label": __("Student Name"),
            "fieldtype": "Data",
            "reqd": 1
        }
    ],
    "onload": function(report) {
        // This adds the button to the report menu
        report.page.add_inner_button(__("Generate PDF"), function() {
            var filters = report.get_values();
            
            if (!filters || !filters.participant) {
                frappe.msgprint(__("Please enter a Student Name first."));
                return;
            }

            // Generate URL directly to the print format
            var baseUrl = frappe.utils.get_url_to_report("Student Activity Statement", "Report");
            var printUrl = baseUrl + "&format=Student Activity Statement&participant=" + encodeURIComponent(filters.participant);
            
            // Open in a new tab
            window.open(printUrl, '_blank');
        });
    }
};