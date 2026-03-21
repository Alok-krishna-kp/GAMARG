import frappe
from frappe.utils import getdate


@frappe.whitelist()
def get_student_activities(university_reg_no=None, student_id=None, start_date=None):
	"""Search activities by student register number."""
	reg_no = university_reg_no or student_id

	if not reg_no:
		frappe.throw("Please provide a Register Number.")

	# Verify student exists
	student = frappe.get_all(
		"Student",
		filters={"name": reg_no},
		fields=["name", "fname", "lname", "department", "uni_reg_no"],
		limit=1,
		ignore_permissions=True,
	)

	if not student:
		frappe.throw(f"No student found with Register No: {reg_no}")

	s = student[0]
	full_name = f"{s.get('fname', '')} {s.get('lname', '')}".strip() or reg_no

	# Build filters
	filters = {
		"participant": reg_no,
		"participant_type": "Student",
	}
	if start_date:
		filters["event_date"] = [">=", getdate(start_date)]

	activities = frappe.get_all(
		"Activity Management",
		filters=filters,
		fields=[
			"name",
			"event_name",
			"event_date",
			"category",
			"department",
			"participant_type",
			"workflow_state",
			"certificate",
		],
		order_by="event_date asc",
		ignore_permissions=True,
	)

	for a in activities:
		if a.get("event_date"):
			a["event_date"] = a["event_date"].strftime("%Y-%m-%d")
		# normalize status field
		a["status"] = a.get("workflow_state") or "—"

	return {
		"student": {
			"name": reg_no,
			"full_name": full_name,
			"department": s.get("department", ""),
			"university_reg_no": s.get("uni_reg_no", reg_no),
		},
		"activities": activities,
	}


@frappe.whitelist()
def get_staff_activities(staff_id=None, start_date=None):
	"""Fetch activities for a specific faculty member."""
	if not staff_id:
		frappe.throw("Please provide a Faculty ID.")

	filters = {
		"participant": staff_id,
		"participant_type": "Faculty",
	}
	if start_date:
		filters["event_date"] = [">=", getdate(start_date)]

	activities = frappe.get_all(
		"Activity Management",
		filters=filters,
		fields=[
			"name",
			"event_name",
			"event_date",
			"category",
			"department",
			"participant_type",
			"workflow_state",
			"certificate",
		],
		order_by="event_date asc",
		ignore_permissions=True,
	)

	for a in activities:
		if a.get("event_date"):
			a["event_date"] = a["event_date"].strftime("%Y-%m-%d")
		a["status"] = a.get("workflow_state") or "—"

	return {"activities": activities}


@frappe.whitelist()
def get_department_activities(department):
	"""Fetch all activities for a department."""
	activities = frappe.get_all(
		"Activity Management",
		filters={"department": department},
		fields=[
			"name",
			"event_name",
			"event_date",
			"category",
			"department",
			"participant",
			"participant_type",
			"workflow_state",
			"certificate",
		],
		order_by="event_date asc",
		ignore_permissions=True,
	)
	for a in activities:
		if a.get("event_date"):
			a["event_date"] = a["event_date"].strftime("%Y-%m-%d")
		a["status"] = a.get("workflow_state") or "—"

	return {"activities": activities}


@frappe.whitelist()
def get_departments():
	"""Return all department names for the dropdown."""
	departments = frappe.get_all("Department", fields=["name"], order_by="name asc")
	return [d["name"] for d in departments]


@frappe.whitelist()
def get_activity_report(activity_name):
	"""Fetch full details of a specific activity."""
	if not activity_name:
		frappe.throw("Activity name is required.")

	doc = frappe.get_doc("Activity Management", activity_name)

	full_name = None
	uni_reg_no = None

	participant_type = getattr(doc, "participant_type", None)
	if participant_type == "Student" and doc.participant:
		try:
			s = frappe.get_doc("Student", doc.participant)
			full_name = f"{getattr(s, 'fname', '')} {getattr(s, 'lname', '')}".strip()
			uni_reg_no = getattr(s, "uni_reg_no", None) or doc.participant
		except Exception:
			uni_reg_no = doc.participant
	elif participant_type == "Faculty" and doc.participant:
		try:
			f = frappe.get_doc("Faculty", doc.participant)
			full_name = getattr(f, "name1", None)
			uni_reg_no = getattr(f, "id", None) or doc.participant
		except Exception:
			uni_reg_no = doc.participant

	return {
		"name": doc.name,
		"event_name": doc.event_name,
		"event_date": doc.event_date.strftime("%Y-%m-%d") if doc.event_date else None,
		"participant": doc.participant,
		"full_name": full_name,
		"university_reg_no": uni_reg_no,
		"participant_type": getattr(doc, "participant_type", None),
		"department": doc.department,
		"category": getattr(doc, "category", None),
		"status": getattr(doc, "workflow_state", None) or "—",
		"description": getattr(doc, "description", None),
		"certificate": getattr(doc, "certificate", None),
	}
