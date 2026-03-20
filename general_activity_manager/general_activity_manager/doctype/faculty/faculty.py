# Copyright (c) 2026, gamarg and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


def get_permission_query_conditions(user=None):
	"""
	Dept.Head : sees all Faculty records in their department
	Faculty   : sees only their own Faculty record
	"""
	user = user or frappe.session.user
	roles = set(frappe.get_roles(user))

	if "System Manager" in roles or user == "Administrator":
		return ""

	if "Dept.Head" in roles:
		dept = frappe.db.get_value("Faculty", {"user": user}, "department")
		if not dept:
			return "1=0"
		return "`tabFaculty`.`department` = {}".format(frappe.db.escape(dept))

	if "Faculty" in roles:
		faculty_name = frappe.db.get_value("Faculty", {"user": user}, "name")
		if not faculty_name:
			return "1=0"
		return "`tabFaculty`.`name` = {}".format(frappe.db.escape(faculty_name))

	return "1=0"


def has_permission(doc, ptype="read", user=None):
	user = user or frappe.session.user
	roles = set(frappe.get_roles(user))

	if "System Manager" in roles or user == "Administrator":
		return True

	if "Dept.Head" in roles:
		dept = frappe.db.get_value("Faculty", {"user": user}, "department")
		return bool(dept and doc.department == dept)

	if "Faculty" in roles:
		faculty_name = frappe.db.get_value("Faculty", {"user": user}, "name")
		return doc.name == faculty_name

	return False


class Faculty(Document):
	pass