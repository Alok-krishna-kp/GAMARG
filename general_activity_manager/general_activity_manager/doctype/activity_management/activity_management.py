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
		if "System Manager" in frappe.get_roles(frappe.session.user):
			return

		# Bypass this check if the document is moving through a workflow approval process
		# We know it's a workflow action if it's an existing doc and the 'workflow_state' is changing
		if not self.is_new() and self.has_value_changed('workflow_state'):
			return

		# Check if the participant is linked to the current user
		if self.participant and self.participant_type:
			participant_user = frappe.db.get_value(
				self.participant_type, 
				self.participant, 
				'user'
			)
			if participant_user and participant_user != frappe.session.user:
				# If the participant has a linked user and it's not the current user
				# Check if the current user is a Dept.Head for that department
				if "Dept.Head" in frappe.get_roles(frappe.session.user):
					pass # Dept.Heads can submit for others (this logic can be tightened to check department match if needed)
				else:
					frappe.throw(_("You can only create or edit activities for yourself."))
