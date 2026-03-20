# Copyright (c) 2026, gamarg and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _


def get_permission_query_conditions(user=None):
	"""
	Filters the Activity Management list view based on role.

	Dept.Head : sees all activities in their department
	Faculty   : sees their own activities + their department's students' activities
	Student   : handled by if_owner=1 in Custom DocPerm
	"""
	user = user or frappe.session.user
	roles = set(frappe.get_roles(user))

	if "System Manager" in roles or user == "Administrator":
		return ""

	if "Dept.Head" in roles:
		dept = frappe.db.get_value("Faculty", {"user": user}, "department")
		if not dept:
			return "1=0"
		return "`tabActivity Management`.`department` = {}".format(frappe.db.escape(dept))

	if "Faculty" in roles:
		faculty_name = frappe.db.get_value("Faculty", {"user": user}, "name")
		if not faculty_name:
			return "1=0"

		dept = frappe.db.get_value("Faculty", faculty_name, "department")
		students = frappe.db.get_all("Student", filters={"department": dept}, pluck="name") if dept else []

		faculty_escaped = frappe.db.escape(faculty_name)

		if students:
			student_list = ", ".join(frappe.db.escape(s) for s in students)
			return (
				"((`tabActivity Management`.`participant_type` = 'Faculty'"
				" AND `tabActivity Management`.`participant` = {faculty})"
				" OR (`tabActivity Management`.`participant_type` = 'Student'"
				" AND `tabActivity Management`.`participant` IN ({students})))"
			).format(faculty=faculty_escaped, students=student_list)
		else:
			return (
				"`tabActivity Management`.`participant_type` = 'Faculty'"
				" AND `tabActivity Management`.`participant` = {}"
			).format(faculty_escaped)

	# Student role — if_owner in Custom DocPerm handles this
	return ""


def has_permission(doc, ptype="read", user=None):
	"""
	Controls access when opening a single Activity Management document.
	"""
	user = user or frappe.session.user
	roles = set(frappe.get_roles(user))

	if "System Manager" in roles or user == "Administrator":
		return True

	if "Dept.Head" in roles:
		dept = frappe.db.get_value("Faculty", {"user": user}, "department")
		return bool(dept and doc.department == dept)

	if "Faculty" in roles:
		faculty_name = frappe.db.get_value("Faculty", {"user": user}, "name")
		if not faculty_name:
			return False

		# Faculty's own activity
		if doc.participant_type == "Faculty" and doc.participant == faculty_name:
			return True

		# Student activity in same department
		if doc.participant_type == "Student":
			dept = frappe.db.get_value("Faculty", faculty_name, "department")
			students = frappe.db.get_all("Student", filters={"department": dept}, pluck="name") if dept else []
			return doc.participant in students

		return False

	# Student role — fall back to Frappe's if_owner check
	return None


class ActivityManagement(Document):
	def validate(self):
		self.validate_participant_user()
		self.validate_date()

	def validate_date(self):
		if self.event_date and frappe.utils.getdate(self.event_date) > frappe.utils.getdate(frappe.utils.today()):
			frappe.throw(_("Event Date cannot be in the future."))

	def validate_participant_user(self):
		# If user is System Manager, they can do anything
		roles = frappe.get_roles(frappe.session.user)
		if "System Manager" in roles:
			return

		# Check if the participant is linked to the current user
		participant_user = None
		if self.participant and self.participant_type:
			participant_user = frappe.db.get_value(
				self.participant_type,
				self.participant,
				'user'
			)

		# If the current user is NOT the participant, we need to check their and their department's access
		if participant_user != frappe.session.user:
			if "Student" in roles:
				frappe.throw(_("You can only create or edit activities for yourself."))

			user_dept = frappe.db.get_value("Faculty", {"user": frappe.session.user}, "department")
			participant_dept = frappe.db.get_value(self.participant_type, self.participant, "department")

			if "Faculty" in roles:
				# Faculty editing another faculty member's activity
				if self.participant_type == "Faculty" and "Dept.Head" not in roles:
					frappe.throw(_("You cannot edit other faculty member's activities."))

				# Faculty/Dept.Head managing activities outside their department
				if not user_dept or user_dept != self.department or \
					not participant_dept or user_dept != participant_dept:
					frappe.throw(_("Access denied. You can only manage activities within your own department ({0}).").format(user_dept or "Not Assigned"))
		else:
			# If the user IS the participant, ensure department matches their profile
			profile_dept = None
			if self.participant_type == "Student":
				profile_dept = frappe.db.get_value("Student", self.participant, "department")
			elif self.participant_type == "Faculty":
				profile_dept = frappe.db.get_value("Faculty", self.participant, "department")

			if profile_dept and profile_dept != self.department:
				frappe.throw(_("The selected department does not match your profile department ({0}).").format(profile_dept))