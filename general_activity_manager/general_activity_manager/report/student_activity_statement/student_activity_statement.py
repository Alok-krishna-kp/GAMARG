import frappe

def execute(filters=None):
    columns = get_columns()
    data = get_data(filters) # Filters are passed here
    return columns, data

def get_columns():
    return [
        {"label": "Participant", "fieldname": "participant", "fieldtype": "Data", "width": 150},
        {"label": "Event Name", "fieldname": "event_name", "fieldtype": "Data", "width": 200},
        {"label": "Category", "fieldname": "category", "fieldtype": "Select", "width": 120},
        {"label": "Event Date", "fieldname": "event_date", "fieldtype": "Date", "width": 100},
        {"label": "Status", "fieldname": "status", "fieldtype": "Select", "width": 100}
    ]

def get_data(filters):
    conditions = {}
    
    # Check if the user typed something in the "participant" filter
    if filters.get("participant"):
        # Use "like" for partial matching (e.g., typing 'ak' finds 'akhil')
        conditions["participant"] = ["like", f"%{filters.get('participant')}%"]
    
    # Add more filters here if needed (e.g., date or status)
    if filters.get("status"):
        conditions["status"] = filters.get("status")

    return frappe.get_all("Activity Management", 
        fields=["participant", "event_name", "category", "event_date", "status"],
        filters=conditions # Apply the conditions to the query
    )