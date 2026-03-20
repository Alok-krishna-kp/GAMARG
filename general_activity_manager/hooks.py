app_name = "general_activity_manager"
app_title = "General Activity Manager"
app_publisher = "gamarg"
app_description = "an app fortracking verifying your college achievements in one place"
app_email = "alokkrishnakp524741@gmail.com"
app_license = "mit"

fixtures = [
    "Role",
    "Custom DocPerm",
    "Custom Role",
    "Web Form",
    "Workflow",
    "Workflow State",
    "Workflow Action Master",
    "Web Page",
]

<<<<<<< HEAD
# on_login = "general_activity_manager.utils.redirect_gamarg_user"
=======
# Permissions
# -----------
permission_query_conditions = {
    "Activity Management": "general_activity_manager.permissions.activity_management.get_permission_query_conditions",
    "Faculty":             "general_activity_manager.permissions.faculty.get_permission_query_conditions",
    "Student":             "general_activity_manager.permissions.student.get_permission_query_conditions",
}

has_permission = {
    "Activity Management": "general_activity_manager.permissions.activity_management.has_permission",
    "Faculty":             "general_activity_manager.permissions.faculty.has_permission",
    "Student":             "general_activity_manager.permissions.student.has_permission",
}

#on_login = "general_activity_manager.utils.redirect_gamarg_user"
>>>>>>> e933ef4 (feat:Add advanced filtering.fix:modify workspace(WIP))

# website_redirects = [
#     {"source": "/", "target": "/"},
# ]

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "general_activity_manager",
# 		"logo": "/assets/general_activity_manager/logo.png",
# 		"title": "General Activity Manager",
# 		"route": "/general_activity_manager",
# 		"has_permission": "general_activity_manager.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/general_activity_manager/css/general_activity_manager.css"
app_include_js = "/assets/general_activity_manager/js/general_activity_manager.js"

# include js, css files in header of web template
# web_include_css = "/assets/general_activity_manager/css/general_activity_manager.css"
# web_include_js = "/assets/general_activity_manager/js/general_activity_manager.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "general_activity_manager/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "general_activity_manager/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "general_activity_manager.utils.jinja_methods",
# 	"filters": "general_activity_manager.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "general_activity_manager.install.before_install"
# after_install = "general_activity_manager.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "general_activity_manager.uninstall.before_uninstall"
# after_uninstall = "general_activity_manager.uninstall.after_uninstall"

# Integration Setup
# ------------------
# before_app_install = "general_activity_manager.utils.before_app_install"
# after_app_install = "general_activity_manager.utils.after_app_install"

# Integration Cleanup
# -------------------
# before_app_uninstall = "general_activity_manager.utils.before_app_uninstall"
# after_app_uninstall = "general_activity_manager.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# notification_config = "general_activity_manager.notifications.get_notification_config"

# DocType Class
# ---------------
# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------
# scheduler_events = {
# 	"all": [
# 		"general_activity_manager.tasks.all"
# 	],
# 	"daily": [
# 		"general_activity_manager.tasks.daily"
# 	],
# 	"hourly": [
# 		"general_activity_manager.tasks.hourly"
# 	],
# 	"weekly": [
# 		"general_activity_manager.tasks.weekly"
# 	],
# 	"monthly": [
# 		"general_activity_manager.tasks.monthly"
# 	],
# }

# Testing
# -------
# before_tests = "general_activity_manager.install.before_tests"

# Overriding Methods
# ------------------------------
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "general_activity_manager.event.get_events"
# }

# override_doctype_dashboards = {
# 	"Task": "general_activity_manager.task.get_dashboard_data"
# }

# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["general_activity_manager.utils.before_request"]
# after_request = ["general_activity_manager.utils.after_request"]

# Job Events
# ----------
# before_job = ["general_activity_manager.utils.before_job"]
# after_job = ["general_activity_manager.utils.after_job"]

# User Data Protection
# --------------------
# user_data_fields = [...]

# Authentication and authorization
# --------------------------------
# auth_hooks = [
# 	"general_activity_manager.auth.validate"
# ]

# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30
# }
