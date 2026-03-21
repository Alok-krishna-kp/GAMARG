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

		# Create test departments
		if not frappe.db.exists("Department", "Dept A"):
			frappe.get_doc({"doctype": "Department", "department_name": "Dept A"}).insert()
		if not frappe.db.exists("Department", "Dept B"):
			frappe.get_doc({"doctype": "Department", "department_name": "Dept B"}).insert()
		
		# Set institute information
		frappe.db.set_single_value("Institute Information", "code", "WYD")
		frappe.db.set_single_value("Institute Information", "fname", "Test Institute")
		frappe.db.set_single_value("Institute Information", "sname", "TI")
		
		# Create test users and linked profiles
		self.student_user = "test_student@example.com"
		self.faculty_user = "test_faculty@example.com"
		self.dept_head_user = "test_dept_head@example.com"
		self.dept_b_faculty_user = "other_dept_faculty@example.com"
		self.dept_b_student_user = "other_dept_student@example.com"

		self.create_test_user(self.student_user, "Student")
		self.create_test_user(self.faculty_user, "Faculty")
		self.create_test_user(self.dept_head_user, "Faculty", "Dept.Head")
		self.create_test_user(self.dept_b_faculty_user, "Faculty")
		self.create_test_user(self.dept_b_student_user, "Student")

		# Create Student record linked to user (Dept A)
		self.student_name = "WYD22EC001"
		if not frappe.db.exists("Student", self.student_name):
			frappe.get_doc({
				"doctype": "Student",
				"uni_reg_no": self.student_name,
				"fname": "Test",
				"lname": "Student",
				"department": "Dept A",
				"user": self.student_user
			}).insert()

		# Create another Student for negative testing (Dept A)
		self.other_student_name = "WYD22EC002"
		self.other_student_user = "other_student@example.com"
		self.create_test_user(self.other_student_user, "Student")
		if not frappe.db.exists("Student", self.other_student_name):
			frappe.get_doc({
				"doctype": "Student",
				"uni_reg_no": self.other_student_name,
				"fname": "Other",
				"lname": "Student",
				"department": "Dept A",
				"user": self.other_student_user
			}).insert()

		# Create Student in Dept B for cross-department tests
		self.dept_b_student_name = "WYD22ME001"
		if not frappe.db.exists("Student", self.dept_b_student_name):
			frappe.get_doc({
				"doctype": "Student",
				"uni_reg_no": self.dept_b_student_name,
				"fname": "Other",
				"lname": "Student",
				"department": "Dept B",
				"user": self.dept_b_student_user
			}).insert()

		# Create Faculty record (Dept A)
		self.faculty_name = "FAC-001"
		if not frappe.db.exists("Faculty", self.faculty_name):
			frappe.get_doc({
				"doctype": "Faculty",
				"id": self.faculty_name,
				"name1": "Prof. X",
				"department": "Dept A",
				"user": self.faculty_user
			}).insert()

		# Create another Faculty for negative testing (Dept A)
		self.other_faculty_name = "FAC-002"
		self.other_faculty_user = "other_faculty@example.com"
		self.create_test_user(self.other_faculty_user, "Faculty")
		if not frappe.db.exists("Faculty", self.other_faculty_name):
			frappe.get_doc({
				"doctype": "Faculty",
				"id": self.other_faculty_name,
				"name1": "Prof. Y",
				"department": "Dept A",
				"user": self.other_faculty_user
			}).insert()

		# Create Faculty profile for Dept Head (Dept A)
		if not frappe.db.exists("Faculty", "FAC-DH"):
			frappe.get_doc({
				"doctype": "Faculty",
				"id": "FAC-DH",
				"name1": "Head A",
				"department": "Dept A",
				"user": self.dept_head_user
			}).insert()

		# Create Faculty in Dept B for cross-department tests
		self.dept_b_faculty_name = "FAC-B"
		if not frappe.db.exists("Faculty", self.dept_b_faculty_name):
			frappe.get_doc({
				"doctype": "Faculty",
				"id": self.dept_b_faculty_name,
				"name1": "Prof. B",
				"department": "Dept B",
				"user": self.dept_b_faculty_user
			}).insert()

	def create_test_user(self, email, role, role2=None):
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
			if role2:
				user.add_roles(role2)
		else:
			user = frappe.get_doc("User", email)
			if role not in [r.role for r in user.roles]:
				user.add_roles(role)
			if role2 not in [r.role for r in user.roles]:
				user.add_roles(role2)

	def test_student_can_create_own_activity(self):
		frappe.set_user(self.student_user)
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Student",
			"participant": self.student_name,
			"department": "Dept A",
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
			"department": "Dept A",
			"event_name": "Impersonation Attempt",
			"category": "Seminar",
			"event_date": frappe.utils.today()
		})
		with self.assertRaises(frappe.PermissionError):
			doc.insert()

	def test_faculty_can_create_own_activity(self):
		frappe.set_user(self.faculty_user)
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Faculty",
			"participant": self.faculty_name,
			"department": "Dept A",
			"event_name": "My Great Faculty Event",
			"category": "Seminar",
			"event_date": frappe.utils.today()
		})
		doc.insert()
		self.assertTrue(doc.name)

	def test_faculty_cannot_create_others_activity(self):
		frappe.set_user(self.faculty_user)
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Faculty",
			"participant": self.other_faculty_name,
			"department": "Dept A",
			"event_name": "My Great Faculty Event",
			"category": "Seminar",
			"event_date": frappe.utils.today()
		})
		with self.assertRaises(frappe.ValidationError):
			doc.insert()

	def test_faculty_approval_workflow_same_dept(self):
		# 1. Student creates and submits activity for review
		frappe.set_user(self.student_user)
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Student",
			"participant": self.student_name,
			"department": "Dept A",
			"event_name": "Workflow Run",
			"category": "Hackathon",
			"event_date": frappe.utils.today()
		}).insert()

		# Student transitions it using the workflow
		apply_workflow(doc, "Submit for Review")
		self.assertEqual(doc.workflow_state, "Pending Approval")

		# 2. Faculty from Dept A approves it
		frappe.set_user(self.faculty_user)
		apply_workflow(doc, "Approve")
		self.assertEqual(doc.workflow_state, "Approved")

	def test_cross_department_access_denied(self):
		# Activity in Dept A
		frappe.set_user(self.student_user)
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Student",
			"participant": self.student_name,
			"department": "Dept A",
			"event_name": "Security Test",
			"category": "Seminar",
			"event_date": frappe.utils.today()
		}).insert()
		apply_workflow(doc, "Submit for Review")

		# Faculty from Dept B tries to approve it
		frappe.set_user(self.dept_b_faculty_user)
		with self.assertRaises(frappe.PermissionError):
			apply_workflow(doc, "Approve")

	def test_dept_head_approval_of_faculty_activity(self):
		# 1. Faculty creates and submits activity for review
		frappe.set_user(self.faculty_user)
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Faculty",
			"participant": self.faculty_name,
			"department": "Dept A",
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

	def test_dept_head_can_submit_for_all_in_same_dept(self):
		frappe.set_user(self.dept_head_user)
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Student",
			"participant": self.other_student_name,
			"department": "Dept A",
			"event_name": "DH Entry 1",
			"category": "Workshop",
			"event_date": frappe.utils.today()
		})
		doc.insert() 
		self.assertTrue(doc.name)
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Faculty",
			"participant": self.other_faculty_name,
			"department": "Dept A",
			"event_name": "DH Entry 2",
			"category": "Workshop",
			"event_date": frappe.utils.today()
		})
		doc.insert() 
		self.assertTrue(doc.name)

	def test_dept_head_cannot_submit_for_other_dept_student(self):
		frappe.set_user(self.dept_head_user)
		# B student for dept B
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Student",
			"participant": self.dept_b_student_name,
			"department": "Dept B",
			"event_name": "DH Entry 1",
			"category": "Workshop",
			"event_date": frappe.utils.today()
		})
		with self.assertRaises(frappe.PermissionError):
			doc.insert()

		# B student for dept A
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Student",
			"participant": self.dept_b_student_name,
			"department": "Dept A",
			"event_name": "DH Entry 1",
			"category": "Workshop",
			"event_date": frappe.utils.today()
		})
		with self.assertRaises(frappe.ValidationError):
			doc.insert()

		# A student for dept B
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Student",
			"participant": self.student_name,
			"department": "Dept B",
			"event_name": "DH Entry 1",
			"category": "Workshop",
			"event_date": frappe.utils.today()
		})
		with self.assertRaises(frappe.PermissionError):
			doc.insert()

	def test_dept_head_cannot_submit_for_other_dept_faculty(self):
		frappe.set_user(self.dept_head_user)
		# B faculty for dept B
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Faculty",
			"participant": self.dept_b_faculty_name,
			"department": "Dept B",
			"event_name": "DH Entry 2",
			"category": "Workshop",
			"event_date": frappe.utils.today()
		})
		with self.assertRaises(frappe.PermissionError):
			doc.insert()

		# B faculty for dept A
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Faculty",
			"participant": self.dept_b_faculty_name,
			"department": "Dept A",
			"event_name": "DH Entry 2",
			"category": "Workshop",
			"event_date": frappe.utils.today()
		})
		with self.assertRaises(frappe.ValidationError):
			doc.insert()
		
		# A faculty for dept B
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Faculty",
			"participant": self.faculty_name,
			"department": "Dept B",
			"event_name": "DH Entry 2",
			"category": "Workshop",
			"event_date": frappe.utils.today()
		})
		with self.assertRaises(frappe.PermissionError):
			doc.insert()

	def test_date_validation(self):
		frappe.set_user(self.student_user)
		doc = frappe.get_doc({
			"doctype": "Activity Management",
			"participant_type": "Student",
			"participant": self.student_name,
			"department": "Dept A",
			"event_name": "Future Event",
			"category": "Seminar",
			"event_date": frappe.utils.add_days(frappe.utils.today(), 1)
		})
		with self.assertRaises(frappe.ValidationError):
			doc.insert()
