frappe.ui.form.on("Student", {
    onload: function (frm) {
        if (frm.is_new()) {
            frm.call("get_prefix_info").then(r => {
                if (r.message) {
                    frm.uni_prefix_data = r.message;
                    frm.doc.department = ""
                    set_uni_reg_no_prefix(frm);
                    set_clg_reg_no(frm);
                }
            });
        }
    },

    department: function (frm) {
        set_uni_reg_no_prefix(frm);
    },

    "let": function (frm) {
        set_uni_reg_no_prefix(frm);
    },

    roll_no: function (frm) {
        set_uni_reg_no_prefix(frm);
    },
});

function set_uni_reg_no_prefix(frm) {
    let data = frm.uni_prefix_data;
    if (!data || !data.uni_code || !data.year_code) return;

    let uni_reg_no = (frm.doc.let ? "L" : "") + data.uni_code + data.year_code + frm.doc.department.slice(0, 2) + "0" + frm.doc.roll_no;
    if (frm.is_new()) {
        frm.set_value("uni_reg_no", uni_reg_no);
    }
};

function set_clg_reg_no(frm) {
    frm.set_value("clg_reg_no", frm.uni_prefix_data.year_code + "b");
};
