import frappe


def execute(filters=None):
	columns = get_columns()
	data = get_data(filters)
	return columns, data


def get_columns():
	return [
		{"label": "Participant Type", "fieldname": "participant_type", "fieldtype": "Data", "width": 120},
		{"label": "Participant", "fieldname": "participant", "fieldtype": "Data", "width": 160},
		{"label": "Department", "fieldname": "department", "fieldtype": "Data", "width": 150},
		{"label": "Event Name", "fieldname": "event_name", "fieldtype": "Data", "width": 200},
		{"label": "Category", "fieldname": "category", "fieldtype": "Data", "width": 120},
		{"label": "Event Date", "fieldname": "event_date", "fieldtype": "Date", "width": 110},
		{"label": "Certificate", "fieldname": "certificate", "fieldtype": "Data", "width": 100},
	]


def get_data(filters):
	if not filters:
		filters = {}
	conditions = "WHERE docstatus < 2"
	user_roles = frappe.get_roles(frappe.session.user)
	if "Department Head" in user_roles or "System Manager" in user_roles:
		pass
	elif "Faculty" in user_roles:
		faculty_dept = frappe.db.get_value("Faculty", {"user": frappe.session.user}, "department")
		if faculty_dept:
			conditions += " AND department = " + repr(faculty_dept)
	elif "Student" in user_roles:
		student_name = frappe.db.get_value("Student", {"user": frappe.session.user}, "name")
		if student_name:
			conditions += " AND participant = " + repr(student_name)
	if filters.get("participant_type"):
		conditions += " AND participant_type = " + repr(filters.get("participant_type"))
	if filters.get("participant"):
		conditions += " AND participant LIKE " + repr("%" + filters.get("participant") + "%")
	if filters.get("department"):
		conditions += " AND department = " + repr(filters.get("department"))
	if filters.get("category"):
		conditions += " AND category = " + repr(filters.get("category"))
	if filters.get("from_date"):
		conditions += " AND event_date >= " + repr(filters.get("from_date"))
	if filters.get("to_date"):
		conditions += " AND event_date <= " + repr(filters.get("to_date"))
	query = (
		"SELECT participant_type, participant, department, event_name, category, event_date, certificate FROM `tabActivity Management` "
		+ conditions
		+ " ORDER BY participant, event_date DESC"
	)
	return frappe.db.sql(query, as_dict=True)
