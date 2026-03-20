# Copyright (c) 2026, gamarg and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


def get_permission_query_conditions(user=None):
	"""
	Dept.Head : sees all Students in their department
	Faculty   : sees all Students in their department
	Student   : sees only their own record (if_owner in Custom DocPerm handles this)
	"""
	user = user or frappe.session.user
	roles = set(frappe.get_roles(user))

	if "System Manager" in roles or user == "Administrator":
		return ""

	if "Dept.Head" in roles or "Faculty" in roles:
		dept = frappe.db.get_value("Faculty", {"user": user}, "department")
		if not dept:
			return "1=0"
		return "`tabStudent`.`department` = {}".format(frappe.db.escape(dept))

	# Student role — rely on if_owner from Custom DocPerm
	return ""


def has_permission(doc, ptype="read", user=None):
	user = user or frappe.session.user
	roles = set(frappe.get_roles(user))

	if "System Manager" in roles or user == "Administrator":
		return True

	if "Dept.Head" in roles or "Faculty" in roles:
		dept = frappe.db.get_value("Faculty", {"user": user}, "department")
		return bool(dept and doc.department == dept)

	# Student role — fall back to Frappe's if_owner check
	return None


class Student(Document):
	pass