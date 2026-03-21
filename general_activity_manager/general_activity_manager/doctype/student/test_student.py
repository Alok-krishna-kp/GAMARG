# Copyright (c) 2026, gamarg and Contributors
# See license.txt

import frappe
from frappe.tests.utils import FrappeTestCase


class TestStudent(FrappeTestCase):
	def setUp(self):
		frappe.set_user("Administrator")
		frappe.db.delete("Student")
		# Set institute information
		frappe.db.set_single_value("Institute Information", "code", "WYD")
		frappe.db.set_single_value("Institute Information", "fname", "Test Institute")
		frappe.db.set_single_value("Institute Information", "sname", "TI")

		if not frappe.db.exists("Department", "Dept A"):
			frappe.get_doc({"doctype": "Department", "department_name": "Dept A"}).insert()

	def test_valid_uni_reg_no(self):
		student = frappe.get_doc(
			{
				"doctype": "Student",
				"uni_reg_no": "WYD22EC051",
				"fname": "Test",
				"lname": "Student",
				"department": "Dept A",
			}
		)
		student.insert()
		self.assertTrue(frappe.db.exists("Student", student.name))

	def test_invalid_uni_reg_no_wrong_prefix(self):
		student = frappe.get_doc(
			{
				"doctype": "Student",
				"uni_reg_no": "XYZ22EC051",
				"fname": "Test",
				"lname": "Student",
				"department": "Dept A",
			}
		)
		with self.assertRaises(frappe.ValidationError):
			student.insert()

	def test_invalid_uni_reg_no_wrong_format(self):
		invalid_nos = ["WYD22E051", "WYD22ECC51", "WYD22EC05", "WYD22EC0511"]
		for no in invalid_nos:
			student = frappe.get_doc(
				{
					"doctype": "Student",
					"uni_reg_no": no,
					"fname": "Test",
					"lname": "Student",
					"department": "Dept A",
				}
			)
			with self.assertRaises(frappe.ValidationError):
				student.insert()

	def test_lateral_entry_valid(self):
		student = frappe.get_doc(
			{
				"doctype": "Student",
				"let": 1,
				"uni_reg_no": "LWYD22EC051",
				"fname": "Test",
				"lname": "Student",
				"department": "Dept A",
			}
		)
		student.insert()
		self.assertTrue(frappe.db.exists("Student", student.name))

	def test_lateral_entry_invalid_without_l(self):
		student = frappe.get_doc(
			{
				"doctype": "Student",
				"let": 1,
				"uni_reg_no": "WYD22EC051",
				"fname": "Test",
				"lname": "Student",
				"department": "Dept A",
			}
		)
		with self.assertRaises(frappe.ValidationError):
			student.insert()

	def test_automatic_batch_calculation(self):
		# Test for WYD22 (2004 + 22 = 2026)
		student = frappe.get_doc(
			{
				"doctype": "Student",
				"uni_reg_no": "WYD22EC051",
				"fname": "Test",
				"lname": "Student",
				"department": "Dept A",
			}
		)
		student.insert()
		self.assertEqual(student.batch, 2026)

		# Test for WYD23 (2004 + 23 = 2027)
		student2 = frappe.get_doc(
			{
				"doctype": "Student",
				"uni_reg_no": "WYD23CS001",
				"fname": "Test",
				"lname": "Student",
				"department": "Dept A",
			}
		)
		student2.insert()
		self.assertEqual(student2.batch, 2027)

	def test_missing_uni_code_in_institute_info(self):
		# Temporarily clear uni_code
		frappe.db.set_single_value("Institute Information", "code", "")

		student = frappe.get_doc(
			{
				"doctype": "Student",
				"uni_reg_no": "WYD22EC051",
				"fname": "Test",
				"lname": "Student",
				"department": "Dept A",
			}
		)
		with self.assertRaises(frappe.ValidationError):
			student.insert()

		# Reset uni_code for other tests
		frappe.db.set_single_value("Institute Information", "code", "WYD")
