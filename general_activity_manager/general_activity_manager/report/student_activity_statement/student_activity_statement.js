frappe.query_reports["Student Activity Statement"] = {
	filters: [
		{
			fieldname: "participant_type",
			label: __("Participant Type"),
			fieldtype: "Select",
			options: "\nStudent\nFaculty",
		},
		{
			fieldname: "participant",
			label: __("Participant"),
			fieldtype: "Data",
		},
		{
			fieldname: "department",
			label: __("Department"),
			fieldtype: "Link",
			options: "Department",
		},
		{
			fieldname: "category",
			label: __("Category"),
			fieldtype: "Select",
			options:
				"\nWorkshop\nHackathon\nSeminar\nConference\nFDP\nInternship\nCertification\nOther",
		},
		{
			fieldname: "from_date",
			label: __("From Date"),
			fieldtype: "Date",
		},
		{
			fieldname: "to_date",
			label: __("To Date"),
			fieldtype: "Date",
		},
	],
};
