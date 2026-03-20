import frappe
from general_activity_manager.permissions.utils import (
    is_dept_head, is_faculty, is_system_manager,
    get_faculty_department,
)

def get_permission_query_conditions(user=None):
    user = user or frappe.session.user
    if is_system_manager(user):
        return ""
    if is_dept_head(user) or is_faculty(user):
        dept = get_faculty_department(user)
        if not dept:
            return "1=0"
        return "`tabStudent`.`department` = {}".format(frappe.db.escape(dept))
    return ""

def has_permission(doc, ptype="read", user=None):
    user = user or frappe.session.user
    if is_system_manager(user):
        return True
    if is_dept_head(user) or is_faculty(user):
        dept = get_faculty_department(user)
        return bool(dept and doc.department == dept)
    return None
