<<<<<<< HEAD
=======
"""
general_activity_manager/permissions/utils.py

Shared helpers for role-based filtering.
Roles in use:
  - Dept.Head  → department-level read + approve access
  - Faculty    → own activities + their students' activities
  - Student    → own activities only (handled via if_owner in DocPerm)
"""
import frappe


def get_user_roles(user=None):
    user = user or frappe.session.user
    return set(frappe.get_roles(user))


def is_dept_head(user=None):
    """Check if user has the Dept.Head role."""
    return "Dept.Head" in get_user_roles(user)


def is_faculty(user=None):
    """Check if user has the Faculty role."""
    return "Faculty" in get_user_roles(user)


def is_system_manager(user=None):
    user = user or frappe.session.user
    return "System Manager" in get_user_roles(user) or user == "Administrator"


def get_faculty_record(user=None):
    """
    Return the Faculty docname linked to this Frappe user.
    Both Dept.Head and Faculty users must have a Faculty record
    with their 'user' field set to their Frappe login email.
    """
    user = user or frappe.session.user
    return frappe.db.get_value("Faculty", {"user": user}, "name")


def get_faculty_department(user=None):
    """Return the department of the Faculty record linked to this user."""
    faculty = get_faculty_record(user)
    if not faculty:
        return None
    return frappe.db.get_value("Faculty", faculty, "department")


def get_students_in_department(department):
    """Return list of Student names belonging to the given department."""
    if not department:
        return []
    return frappe.db.get_all(
        "Student",
        filters={"department": department},
        pluck="name"
    )
>>>>>>> e933ef4 (feat:Add advanced filtering.fix:modify workspace(WIP))
