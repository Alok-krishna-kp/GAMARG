import frappe

def get_user_roles(user=None):
    user = user or frappe.session.user
    return set(frappe.get_roles(user))

def is_dept_head(user=None):
    return "Dept.Head" in get_user_roles(user)

def is_faculty(user=None):
    return "Faculty" in get_user_roles(user)

def is_system_manager(user=None):
    user = user or frappe.session.user
    return "System Manager" in get_user_roles(user) or user == "Administrator"

def get_faculty_record(user=None):
    user = user or frappe.session.user
    return frappe.db.get_value("Faculty", {"user": user}, "name")

def get_faculty_department(user=None):
    faculty = get_faculty_record(user)
    if not faculty:
        return None
    return frappe.db.get_value("Faculty", faculty, "department")

def get_students_in_department(department):
    if not department:
        return []
    return frappe.db.get_all("Student", filters={"department": department}, pluck="name")
