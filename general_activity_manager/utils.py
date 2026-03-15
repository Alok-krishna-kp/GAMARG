import frappe

def redirect_gamarg_user():
    # Get all roles assigned to the current user
    roles = frappe.get_roles()
    
    # Priority-based redirection
    if "Dept.Head" in roles:
        frappe.local.response.type = "redirect"
        frappe.local.response.location = "/desk/hod_workspace"
        
    elif "Faculty" in roles:
        frappe.local.response.type = "redirect"
        # Ensure your Workspace name matches exactly
        frappe.local.response.location = "/desk/faculty_workspace"
        
    elif "Student" in roles:
        frappe.local.response.type = "redirect"
        frappe.local.response.location = "/desk/student_workspace"
