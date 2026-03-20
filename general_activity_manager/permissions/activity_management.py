import frappe
from general_activity_manager.permissions.utils import (
    is_dept_head, is_faculty, is_system_manager,
    get_faculty_record, get_faculty_department, get_students_in_department,
)

def get_permission_query_conditions(user=None):
    user = user or frappe.session.user
    if is_system_manager(user):
        return ""
    if is_dept_head(user):
        dept = get_faculty_department(user)
        if not dept:
            return "1=0"
        return "`tabActivity Management`.`department` = {}".format(frappe.db.escape(dept))
    if is_faculty(user):
        faculty_name = get_faculty_record(user)
        if not faculty_name:
            return "1=0"
        dept = get_faculty_department(user)
        students = get_students_in_department(dept)
        faculty_escaped = frappe.db.escape(faculty_name)
        if students:
            student_list = ", ".join(frappe.db.escape(s) for s in students)
            return (
                "(`tabActivity Management`.`participant_type` = 'Faculty'"
                " AND `tabActivity Management`.`participant` = {0})"
                " OR (`tabActivity Management`.`participant_type` = 'Student'"
                " AND `tabActivity Management`.`participant` IN ({1}))".format(faculty_escaped, student_list)
            )
        return ("`tabActivity Management`.`participant_type` = 'Faculty'"
                " AND `tabActivity Management`.`participant` = {}".format(faculty_escaped))
    return ""

def has_permission(doc, ptype="read", user=None):
    user = user or frappe.session.user
    if is_system_manager(user):
        return True
    if is_dept_head(user):
        dept = get_faculty_department(user)
        return bool(dept and doc.department == dept)
    if is_faculty(user):
        faculty_name = get_faculty_record(user)
        if not faculty_name:
            return False
        if doc.participant_type == "Faculty" and doc.participant == faculty_name:
            return True
        if doc.participant_type == "Student":
            dept = get_faculty_department(user)
            students = get_students_in_department(dept)
            return doc.participant in students
        return False
    return None
