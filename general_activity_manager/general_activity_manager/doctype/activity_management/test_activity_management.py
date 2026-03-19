import frappe
from frappe.tests.utils import FrappeTestCase
from frappe import _
from frappe.model.workflow import apply_workflow

class TestActivityManagement(FrappeTestCase):
	def setUp(self):
		frappe.set_user("Administrator")
		# Cleanup any previous test data
		frappe.db.delete("Activity Management")
		frappe.db.delete("Student")
		frappe.db.delete("Faculty")

		# Create test department
		if not frappe.db.exists("Department", "Test Dept"):
			frappe.get_doc({
				"doctype": "Department",
				"department_name": "Test Dept"
			}).insert()
		
		# Create test users and linked profiles
		self.student_user = "test_student@example.com"
		self.faculty_user = "test_faculty@example.com"
		self.dept_head_user = "test_dept_head@example.com"

		self.create_test_user(self.student_user, "Student")
		self.create_test_user(self.faculty_user, "Faculty")
		self.create_test_user(self.dept_head_user, "Dept.Head")

		# Create Student record linked to user
		self.student_name = "STUD-001"
		if not frappe.db.exists("Student", self.student_name):
			frappe.get_doc({
				"doctype": "Student",
				"uni_reg_no": self.student_name,
				"fname": "Test",
				"lname": "Student",
				"department": "Test Dept",
				"user": self.student_user
			}).insert()

		# Create another Student for negative testing
		self.other_student_name = "STUD-002"
		self.other_student_user = "other_student@example.com"
		self.create_test_user(self.other_student_user, "Student")
		if not frappe.db.exists("Student", self.other_student_name):
			frappe.get_doc({
				"doctype": "Student",
				"uni_reg_no": self.other_student_name,
				"fname": "Other",
				"lname": "Student",
				"department": "Test Dept",
				"user": self.other_student_user
			}).insert()

		# Create Faculty record
		self.faculty_name = "FAC-001"
		if not frappe.db.exists("Faculty", self.faculty_name):
			frappe.get_doc({
				"doctype": "Faculty",
				"id": self.faculty_name,
				"name1": "Prof. X",
				"department": "Test Dept",
				"user": self.faculty_user
			}).insert()

	def create_test_user(self, email, role):
		if not frappe.db.exists("User", email):
			user = frappe.get_doc({
				"doctype": "User",
				"email": email,
				"first_name": role,
				"last_name": "User",
				"send_welcome_email": 0
			})
			user.insert(ignore_permissions=True)
			user.add_roles(role)
		else:
			user = frappe.get_doc("User", email)
			if role not in [r.role for r in user.roles]:
				user.add_roles(role)

	def test_student_can_create_own_activity(self):
		frappe.set_user(self.student_user)
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Student",
			"participant": self.student_name,
			"department": "Test Dept",
			"event_name": "My Great Event",
			"category": "Seminar",
			"event_date": frappe.utils.today()
		})
		doc.insert()
		self.assertTrue(doc.name)

	def test_student_cannot_create_others_activity(self):
		frappe.set_user(self.student_user)
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Student",
			"participant": self.other_student_name,
			"department": "Test Dept",
			"event_name": "Impersonation Attempt",
			"category": "Seminar",
			"event_date": frappe.utils.today()
		})
		# This should raise ValidationError due to our participant validation logic
		with self.assertRaises(frappe.ValidationError):
			doc.insert()

	def test_faculty_approval_workflow(self):
		# 1. Student creates and submits activity for review
		frappe.set_user(self.student_user)
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Student",
			"participant": self.student_name,
			"department": "Test Dept",
			"event_name": "Workflow Run",
			"category": "Hackathon",
			"event_date": frappe.utils.today()
		}).insert()

		# Student transitions it using the workflow
		apply_workflow(doc, "Submit for Review")
		self.assertEqual(doc.workflow_state, "Pending Approval")

		# 2. Faculty approves it
		frappe.set_user(self.faculty_user)
		apply_workflow(doc, "Approve")
		self.assertEqual(doc.workflow_state, "Approved")

	def test_dept_head_approval_of_faculty_activity(self):
		# 1. Faculty creates and submits activity for review
		frappe.set_user(self.faculty_user)
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Faculty",
			"participant": self.faculty_name,
			"department": "Test Dept",
			"event_name": "Faculty Research Event",
			"category": "Workshop",
			"event_date": frappe.utils.today()
		}).insert()

		# Faculty transitions it using the workflow
		apply_workflow(doc, "Submit for Review")
		self.assertEqual(doc.workflow_state, "Pending Approval")

		# 2. Dept.Head approves it
		frappe.set_user(self.dept_head_user)
		apply_workflow(doc, "Approve")
		self.assertEqual(doc.workflow_state, "Approved")

	def test_dept_head_can_submit_for_all(self):
		frappe.set_user(self.dept_head_user)
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Student",
			"participant": self.other_student_name,
			"department": "Test Dept",
			"event_name": "DH Entry",
			"category": "Workshop",
			"event_date": frappe.utils.today()
		})
		doc.insert() # Should pass as per Dept.Head role in python code
		self.assertTrue(doc.name)
