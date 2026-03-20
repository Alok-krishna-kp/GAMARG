import frappe
from general_activity_manager.permissions.utils import (
    is_dept_head, is_faculty, is_system_manager,
    get_faculty_record, get_faculty_department, get_students_in_department,
)

def apply_role_filters(filters=None):
    filters = filters or {}
    user = frappe.session.user

    if is_system_manager(user):
        return filters

    if is_dept_head(user):
        dept = get_faculty_department(user)
        if dept:
            filters["department"] = dept
        else:
            filters["name"] = "__no_access__"
        return filters

    if is_faculty(user):
        faculty_name = get_faculty_record(user)
        if not faculty_name:
            filters["name"] = "__no_access__"
            return filters
        dept = get_faculty_department(user)
        students = get_students_in_department(dept)
        allowed = [faculty_name] + students
        filters["participant"] = ["in", allowed]
        return filters

    student_name = frappe.db.get_value("Student", {"user": user}, "name")
    if student_name:
        filters["participant"] = student_name
    else:
        filters["name"] = "__no_access__"
    return filters
