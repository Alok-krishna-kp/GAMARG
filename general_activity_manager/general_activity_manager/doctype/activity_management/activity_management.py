# Copyright (c) 2026, gamarg and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _


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
			is_workflow_action = not self.is_new() and self.has_value_changed('workflow_state')
			
			if "Faculty" in roles:
				user_dept = frappe.db.get_value("Faculty", {"user": frappe.session.user}, "department")

				# Faculty editing another faculty member's activity
				if self.participant_type == "Faculty" and "Dept.Head" not in roles:
					frappe.throw(_("You cannot edit other faculty member's activities."))
				
				# Faculty/Dept.Head managing activities outside their department
				if not user_dept or user_dept != self.department:
					frappe.throw(_("Access denied. You can only manage activities within your own department ({0}).").format(user_dept or "Not Assigned"))
			else:
				# Student trying to edit someone else's activity
				frappe.throw(_("You can only create or edit activities for yourself."))
		else:
			# If the user IS the participant, we should still ensure the department matches their profile
			profile_dept = None
			if self.participant_type == "Student":
				profile_dept = frappe.db.get_value("Student", self.participant, "department")
			elif self.participant_type == "Faculty":
				profile_dept = frappe.db.get_value("Faculty", self.participant, "department")
			
			if profile_dept and profile_dept != self.department:
				frappe.throw(_("The selected department does not match your profile department ({0}).").format(profile_dept))
