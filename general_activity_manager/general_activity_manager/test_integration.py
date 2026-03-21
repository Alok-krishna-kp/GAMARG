import frappe
from frappe.tests.utils import FrappeTestCase
from frappe.model.workflow import apply_workflow

class TestPermissionIntegration(FrappeTestCase):
	def setUp(self):
		frappe.set_user("Administrator")
		# Clear existing
		frappe.db.delete("Activity Management")
		frappe.db.delete("Student")
		frappe.db.delete("Faculty")

		frappe.db.set_single_value("Institute Information", "code", "WYD")
		frappe.db.set_single_value("Institute Information", "fname", "Test Institute")
		frappe.db.set_single_value("Institute Information", "sname", "TI")

		# Ensure Departments exist
		if not frappe.db.exists("Department", "Dept A"):
			frappe.get_doc({"doctype": "Department", "department_name": "Dept A"}).insert()
		if not frappe.db.exists("Department", "Dept B"):
			frappe.get_doc({"doctype": "Department", "department_name": "Dept B"}).insert()

		# Setup Users
		self.setup_user("student_a@example.com", "Student", "WYD22EC001", "Dept A")
		self.setup_user("student_b@example.com", "Student", "WYD22ME001", "Dept B")
		self.setup_user("faculty_a@example.com", "Faculty", "FAC-001", "Dept A")

		# Create Activities
		self.activity_a = self.create_activity("student_a@example.com", "WYD22EC001", "Dept A", "Activity A")
		self.activity_b = self.create_activity("student_b@example.com", "WYD22ME001", "Dept B", "Activity B")

	def setup_user(self, email, role, profile_id, department):
		if not frappe.db.exists("User", email):
			user = frappe.get_doc({
				"doctype": "User",
				"email": email,
				"first_name": profile_id,
				"last_name": "Test",
				"send_welcome_email": 0
			}).insert(ignore_permissions=True)
			user.add_roles(role)
		
		# Create Profile
		p_type = role
		if p_type == "Student":
			if not frappe.db.exists("Student", profile_id):
				frappe.get_doc({
					"doctype": "Student",
					"uni_reg_no": profile_id,
					"fname": profile_id,
					"department": department,
					"user": email
				}).insert()
		elif p_type == "Faculty":
			if not frappe.db.exists("Faculty", profile_id):
				frappe.get_doc({
					"doctype": "Faculty",
					"id": profile_id,
					"name1": profile_id,
					"department": department,
					"user": email
				}).insert()

	def create_activity(self, user, participant, department, event_name):
		frappe.set_user(user)
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Student" if "student" in user else "Faculty",
			"participant": participant,
			"department": department,
			"event_name": event_name,
			"category": "Seminar",
			"event_date": frappe.utils.today()
		}).insert()
		return doc.name

	def test_student_list_isolation(self):
		# Student A should only see Activity A
		frappe.set_user("student_a@example.com")
		activities = frappe.get_list("Activity Management")
		self.assertEqual(len(activities), 1)
		self.assertEqual(activities[0].name, self.activity_a)

	def test_faculty_list_isolation(self):
		# Faculty A should only see Activity A (same dept) and not Activity B (other dept)
		frappe.set_user("faculty_a@example.com")
		activities = frappe.get_list("Activity Management")
		self.assertEqual(len(activities), 1)
		self.assertEqual(activities[0].name, self.activity_a)

	def test_direct_access_lockdown(self):
		# Student A should not have read access to Activity B (different student)
		self.assertFalse(frappe.has_permission("Activity Management", doc=self.activity_b, ptype="read", user="student_a@example.com"))

	def test_api_integration(self):
		# Test the get_student_activities API
		from general_activity_manager.api import get_student_activities
		
		# Admin call
		frappe.set_user("Administrator")
		res = get_student_activities(student_id="WYD22EC001")
		self.assertEqual(len(res["activities"]), 1)
		self.assertEqual(res["student"]["name"], "WYD22EC001")
