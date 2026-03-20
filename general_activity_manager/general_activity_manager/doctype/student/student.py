# Copyright (c) 2026, gamarg and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _
import re


class Student(Document):
	def validate(self):
		self.validate_uni_reg_no()

	def validate_uni_reg_no(self):
		if not self.uni_reg_no:
			return

		# Fetch university code from Institute Information
		uni_code = frappe.db.get_single_value("Institute Information", "code")
		if not uni_code:
			frappe.throw(_("Please set the University Code in Institute Information"))

		# If let is set, prefix with L
		prefix = "L" + uni_code if self.let else uni_code
		
		# Format: prefix + 2 digits + 2 letters + 3 digits
		pattern = rf"^{re.escape(prefix)}\d{{2}}[A-Z]{{2}}\d{{3}}$"
		
		if not re.match(pattern, self.uni_reg_no):
			frappe.throw(
				_("University Register Number {0} is invalid. It should be in the format [L]{1}YYDDXXX (e.g., {1}22EC051).").format(
					frappe.bold(self.uni_reg_no),
					frappe.bold(prefix)
				)
			)

		# Automatically fill batch
		# Extract the two digits after the prefix
		match = re.search(rf"{re.escape(uni_code)}(\d{{2}})", self.uni_reg_no)
		if match:
			year_code = int(match.group(1))
			self.batch = 2004 + year_code

	@frappe.whitelist()
	def get_prefix_info(self):
		uni_code = frappe.db.get_single_value("Institute Information", "code")
		faculty_batch = frappe.db.get_value("Faculty", {"user": frappe.session.user}, "batch")

		year_code = ""
		if faculty_batch:
			year_code = str(faculty_batch - 2004).zfill(2)

		return {
			"uni_code": uni_code,
			"year_code": year_code
		}
