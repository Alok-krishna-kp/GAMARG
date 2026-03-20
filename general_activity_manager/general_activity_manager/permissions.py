import frappe

def get_student_query_conditions(user=None):
    if not user:
        user = frappe.session.user

    roles = frappe.get_roles(user)

    if "System Manager" in roles:
        return ""

    conditions = []

    if "Student" in roles:
        conditions.append(f"`tabStudent`.user = {frappe.db.escape(user)}")

    if "Faculty" in roles or "Department Head" in roles:
        # Get faculty's department
        faculty_dept = frappe.db.get_value("Faculty", {"user": user}, "department")
        if faculty_dept:
            conditions.append(f"`tabStudent`.department = {frappe.db.escape(faculty_dept)}")
        else:
            # If they have the role but no Faculty record/department, they see nothing
            conditions.append("1=0")

    if not conditions:
        # If user has none of the specified roles and is not System Manager
        return "1=0"

    return " OR ".join(conditions)

def has_student_permission(doc, ptype=None, user=None):
    if not user:
        user = frappe.session.user

    roles = frappe.get_roles(user)

    if "System Manager" in roles:
        return True

    allowed = False

    if "Student" in roles:
        if doc.user == user:
            allowed = True

    if not allowed and ("Faculty" in roles or "Department Head" in roles):
        faculty_dept = frappe.db.get_value("Faculty", {"user": user}, "department")
        if faculty_dept and doc.department == faculty_dept:
            allowed = True

    return allowed

def get_faculty_query_conditions(user=None):
    if not user:
        user = frappe.session.user

    roles = frappe.get_roles(user)

    if "System Manager" in roles:
        return ""

    conditions = []

    if "Faculty" in roles or "Department Head" in roles:
        # Faculty sees themselves and others in their department
        faculty_dept = frappe.db.get_value("Faculty", {"user": user}, "department")
        if faculty_dept:
            conditions.append(f"`tabFaculty`.department = {frappe.db.escape(faculty_dept)}")
        else:
            # If no department, at least see yourself
            conditions.append(f"`tabFaculty`.user = {frappe.db.escape(user)}")

    if "Student" in roles:
        # Students shouldn't see Faculty records as per "nothing else" logic
        # but let's allow them to see the record associated with them if any (unlikely)
        # or just restrict.
        conditions.append("1=0")

    if not conditions:
        return "1=0"

    return " OR ".join(conditions)

def has_faculty_permission(doc, ptype=None, user=None):
    if not user:
        user = frappe.session.user

    roles = frappe.get_roles(user)

    if "System Manager" in roles:
        return True

    allowed = False

    if "Faculty" in roles or "Department Head" in roles:
        faculty_dept = frappe.db.get_value("Faculty", {"user": user}, "department")
        if faculty_dept and doc.department == faculty_dept:
            allowed = True
        elif doc.user == user:
            allowed = True

    # Student shouldn't see Faculty
    
    return allowed
