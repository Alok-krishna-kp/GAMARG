frappe.pages['report_generation'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'report generation',
		single_column: true
	});
}