import frappe
from general_activity_manager.permissions.utils import (
    is_dept_head, is_faculty, is_system_manager,
    get_faculty_record, get_faculty_department,
)

def get_permission_query_conditions(user=None):
    user = user or frappe.session.user
    if is_system_manager(user):
        return ""
    if is_dept_head(user):
        dept = get_faculty_department(user)
        if not dept:
            return "1=0"
        return "`tabFaculty`.`department` = {}".format(frappe.db.escape(dept))
    if is_faculty(user):
        faculty_name = get_faculty_record(user)
        if not faculty_name:
            return "1=0"
        return "`tabFaculty`.`name` = {}".format(frappe.db.escape(faculty_name))
    return "1=0"

def has_permission(doc, ptype="read", user=None):
    user = user or frappe.session.user
    if is_system_manager(user):
        return True
    if is_dept_head(user):
        dept = get_faculty_department(user)
        return bool(dept and doc.department == dept)
    if is_faculty(user):
        faculty_name = get_faculty_record(user)
        return doc.name == faculty_name
    return False
