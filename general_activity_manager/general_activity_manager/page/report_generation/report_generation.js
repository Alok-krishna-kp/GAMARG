frappe.pages["report_generation"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: "Activity Report Generation",
		single_column: true,
	});

	page.main.html(`
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      .ar-root {
        font-family: 'Segoe UI', system-ui, sans-serif;
        background: #f5f6f8; min-height: 100vh; padding: 32px 24px; color: #1a1a2e;
      }
      .ar-header { margin-bottom: 28px; }
      .ar-header h1 { font-size: 1.75rem; font-weight: 700; color: #1a1a2e; letter-spacing: -0.3px; }
      .ar-header p  { color: #6b7280; font-size: 0.9rem; margin-top: 4px; }

      .ar-tabs {
        display: flex; gap: 8px; margin-bottom: 24px;
        border-bottom: 2px solid #e5e7eb; padding-bottom: 0;
      }
      .ar-tab {
        padding: 10px 20px; font-size: 0.88rem; font-weight: 600;
        border: none; background: none; cursor: pointer; color: #6b7280;
        border-bottom: 2px solid transparent; margin-bottom: -2px;
        transition: color .2s, border-color .2s;
      }
      .ar-tab:hover { color: #1a1a2e; }
      .ar-tab.active { color: #1a1a2e; border-bottom-color: #1a1a2e; }

      .ar-grid {
        display: grid; grid-template-columns: 1fr 1fr;
        grid-template-rows: auto 1fr; gap: 20px; align-items: start;
      }
      @media (max-width: 860px) { .ar-grid { grid-template-columns: 1fr; } }

      .ar-card {
        background: #fff; border: 1px solid #e5e7eb;
        border-radius: 14px; padding: 24px;
        box-shadow: 0 1px 4px rgba(0,0,0,.05);
      }
      .ar-card-title {
        display: flex; align-items: center; gap: 8px;
        font-size: 1rem; font-weight: 600; color: #1a1a2e; margin-bottom: 6px;
      }
      .ar-card-subtitle { font-size: 0.82rem; color: #9ca3af; margin-bottom: 20px; }

      #ar-search-card  { grid-column: 1; grid-row: 1; }
      #ar-results-card { grid-column: 1; grid-row: 2; }
      #ar-report-card  { grid-column: 2; grid-row: 1 / 3; }

      .ar-field { margin-bottom: 16px; }
      .ar-field label {
        display: flex; align-items: center; gap: 6px;
        font-size: 0.8rem; font-weight: 500; color: #374151; margin-bottom: 6px;
      }
      .ar-field input, .ar-field select {
        width: 100%; padding: 9px 12px;
        border: 1px solid #d1d5db; border-radius: 8px;
        font-size: 0.88rem; color: #1a1a2e; background: #f9fafb;
        outline: none; transition: border-color .2s, box-shadow .2s;
      }
      .ar-field input:focus, .ar-field select:focus {
        border-color: #1a1a2e; box-shadow: 0 0 0 3px rgba(26,26,46,.08); background: #fff;
      }

      .ar-btn-search {
        width: 100%; padding: 11px; background: #1a1a2e; color: #fff;
        border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        gap: 8px; margin-top: 4px; transition: background .2s, transform .1s;
      }
      .ar-btn-search:hover    { background: #2d2d4e; }
      .ar-btn-search:active   { transform: scale(.98); }
      .ar-btn-search:disabled { background: #9ca3af; cursor: not-allowed; }

      .ar-empty {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; padding: 40px 16px; gap: 12px; text-align: center;
      }
      .ar-empty svg { opacity: .45; }
      .ar-empty p   { font-size: 0.84rem; color: #b0b8c4; }

      .ar-activity-list { display: flex; flex-direction: column; gap: 10px; }
      .ar-activity-item {
        border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px;
        cursor: pointer; transition: border-color .18s, background .18s, box-shadow .18s;
      }
      .ar-activity-item:hover { border-color: #1a1a2e; background: #f8f8fc; box-shadow: 0 2px 8px rgba(26,26,46,.07); }
      .ar-activity-item.selected { border-color: #1a1a2e; background: #f0f0f8; }
      .ar-activity-item-name { font-weight: 600; font-size: 0.9rem; color: #1a1a2e; margin-bottom: 6px; }
      .ar-activity-item-meta { font-size: 0.78rem; color: #6b7280; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }

      .ar-badge {
        display: inline-block; padding: 2px 9px; border-radius: 999px;
        font-size: 0.72rem; font-weight: 600; letter-spacing: .3px;
      }
      .ar-badge-green  { background: #d1fae5; color: #065f46; }
      .ar-badge-yellow { background: #fef9c3; color: #713f12; }
      .ar-badge-gray   { background: #f3f4f6; color: #6b7280; }
      .ar-badge-red    { background: #fee2e2; color: #991b1b; }
      .ar-badge-blue   { background: #dbeafe; color: #1e40af; }
      .ar-badge-purple { background: #ede9fe; color: #5b21b6; }

      .ar-report-section { border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; margin-bottom: 14px; }
      .ar-report-section-header {
        background: #f9fafb; padding: 10px 14px;
        font-size: 0.78rem; font-weight: 600; color: #6b7280;
        text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid #e5e7eb;
      }
      .ar-report-row { display: flex; padding: 10px 14px; font-size: 0.85rem; border-bottom: 1px solid #f3f4f6; }
      .ar-report-row:last-child { border-bottom: none; }
      .ar-report-row .key { width: 140px; flex-shrink: 0; color: #9ca3af; font-size: 0.8rem; }
      .ar-report-row .val { font-weight: 500; color: #1a1a2e; flex: 1; }

      .ar-results-count {
        font-size: 0.78rem; color: #6b7280; margin-bottom: 12px;
        padding: 6px 10px; background: #f9fafb; border-radius: 6px;
      }

      .ar-spinner {
        display: inline-block; width: 16px; height: 16px;
        border: 2px solid #ffffff55; border-top-color: #fff;
        border-radius: 50%; animation: spin .6s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>

    <div class="ar-root">
      <div class="ar-header">
        <h1>Activity Report Generation</h1>
        <p>Search and generate reports by Student, Staff, or Department</p>
      </div>

      <div class="ar-tabs">
        <button class="ar-tab active" data-tab="student">🎓 Student Report</button>
        <button class="ar-tab" data-tab="staff">👨‍🏫 Staff Report</button>
        <button class="ar-tab" data-tab="department">🏢 Department Report</button>
      </div>

      <div class="ar-grid">

        <!-- Search Card -->
        <div class="ar-card" id="ar-search-card">
          <div class="ar-card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span id="ar-search-title">Search Student Activity</span>
          </div>
          <div class="ar-card-subtitle" id="ar-search-subtitle">Enter university register number and start date</div>

          <!-- Student Form -->
          <div id="ar-form-student">
            <div class="ar-field">
              <label>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                University Register No.
              </label>
              <input type="text" id="ar-student-id" placeholder="e.g., 1234" />
            </div>
            <div class="ar-field">
              <label>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Activity Start Date
              </label>
              <input type="date" id="ar-student-start" />
            </div>
          </div>

          <!-- Staff Form -->
          <div id="ar-form-staff" style="display:none">
            <div class="ar-field">
              <label>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                Faculty University Register No.
              </label>
              <input type="text" id="ar-staff-id" placeholder="e.g., fac001" />
            </div>
            <div class="ar-field">
              <label>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Activity Start Date
              </label>
              <input type="date" id="ar-staff-start" />
            </div>
          </div>

          <!-- Department Form -->
          <div id="ar-form-department" style="display:none">
            <div class="ar-field">
              <label>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                Department
              </label>
              <select id="ar-department">
                <option value="">-- Select Department --</option>
              </select>
            </div>
          </div>

          <button class="ar-btn-search" id="ar-search-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Search Activities
          </button>
        </div>

        <!-- Search Results Card -->
        <div class="ar-card" id="ar-results-card">
          <div class="ar-card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Search Results
          </div>
          <div class="ar-card-subtitle">Your registered activities will appear here</div>
          <div id="ar-results-content">
            <div class="ar-empty">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" stroke-width="1.3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p>Enter your details above to search for activities</p>
            </div>
          </div>
        </div>

        <!-- Generated Report Card -->
        <div class="ar-card" id="ar-report-card">
          <div class="ar-card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Generated Report
          </div>
          <div class="ar-card-subtitle">Click an activity to generate its report</div>
          <div id="ar-report-content">
            <div class="ar-empty">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" stroke-width="1.3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p>Search and select an activity to generate the report</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  `);

	// ── State ────────────────────────────────────────────────────────────────────
	let currentTab = "student";

	// ── Helpers ──────────────────────────────────────────────────────────────────
	function badgeClass(status) {
		if (!status) return "ar-badge-gray";
		const s = status.toLowerCase();
		if (["completed", "approved", "active"].includes(s)) return "ar-badge-green";
		if (["pending", "in progress"].includes(s))          return "ar-badge-yellow";
		if (["cancelled", "rejected"].includes(s))           return "ar-badge-red";
		if (["submitted"].includes(s))                       return "ar-badge-blue";
		return "ar-badge-gray";
	}

	function roleBadge(role) {
		if (!role) return "ar-badge-gray";
		const r = role.toLowerCase();
		if (r === "student")         return "ar-badge-blue";
		if (r === "faculty")         return "ar-badge-purple";
		if (r === "department head") return "ar-badge-green";
		return "ar-badge-gray";
	}

	function emptyState(msg) {
		return `<div class="ar-empty">
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" stroke-width="1.3">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      <p>${msg}</p>
    </div>`;
	}

	// ── Load departments ─────────────────────────────────────────────────────────
	async function loadDepartments() {
		try {
			const result = await frappe.call({
				method: "general_activity_manager.api.get_departments",
			});
			const select = wrapper.querySelector("#ar-department");
			(result.message || []).forEach((dept) => {
				const opt = document.createElement("option");
				opt.value = dept;
				opt.textContent = dept;
				select.appendChild(opt);
			});
		} catch (e) {
			console.error("Failed to load departments", e);
		}
	}
	loadDepartments();

	// ── Tab switching ────────────────────────────────────────────────────────────
	wrapper.querySelectorAll(".ar-tab").forEach((tab) => {
		tab.addEventListener("click", () => {
			wrapper.querySelectorAll(".ar-tab").forEach((t) => t.classList.remove("active"));
			tab.classList.add("active");
			currentTab = tab.dataset.tab;

			wrapper.querySelector("#ar-form-student").style.display    = currentTab === "student"     ? "" : "none";
			wrapper.querySelector("#ar-form-staff").style.display      = currentTab === "staff"       ? "" : "none";
			wrapper.querySelector("#ar-form-department").style.display = currentTab === "department"  ? "" : "none";

			const titles = {
				student:    ["Search Student Activity",    "Enter university register number and start date"],
				staff:      ["Search Staff Activity",      "Enter faculty register number and start date"],
				department: ["Search Department Activity", "Select a department to view all its activities"],
			};
			wrapper.querySelector("#ar-search-title").textContent    = titles[currentTab][0];
			wrapper.querySelector("#ar-search-subtitle").textContent = titles[currentTab][1];

			wrapper.querySelector("#ar-results-content").innerHTML = emptyState("Enter your details above to search for activities");
			wrapper.querySelector("#ar-report-content").innerHTML   = emptyState("Search and select an activity to generate the report");
		});
	});

	// ── Search button ────────────────────────────────────────────────────────────
	wrapper.querySelector("#ar-search-btn").addEventListener("click", async () => {
		const btn = wrapper.querySelector("#ar-search-btn");
		btn.disabled = true;
		btn.innerHTML = `<span class="ar-spinner"></span> Searching…`;

		try {
			let result;
			let activities = [];

			if (currentTab === "student") {
				const studentId = wrapper.querySelector("#ar-student-id").value.trim();
				const startDate = wrapper.querySelector("#ar-student-start").value;
				if (!studentId || !startDate) {
					frappe.msgprint({ message: __("Please enter Student ID and Start Date."), indicator: "orange" });
					return;
				}
				result = await frappe.call({
					method: "general_activity_manager.api.get_student_activities",
					args: { student_id: studentId, start_date: startDate },
				});
				
				if (result.message && result.message.student) {
					showStudentInfo(result.message.student);
				}
				activities = result.message ? (result.message.activities || result.message) : [];

			} else if (currentTab === "staff") {
				const staffId   = wrapper.querySelector("#ar-staff-id").value.trim();
				const startDate = wrapper.querySelector("#ar-staff-start").value;
				if (!staffId || !startDate) {
					frappe.msgprint({ message: __("Please enter Faculty University Register No. and Start Date."), indicator: "orange" });
					return;
				}
				result = await frappe.call({
					method: "general_activity_manager.api.get_staff_activities",
					args: { staff_id: staffId, start_date: startDate },
				});
				wrapper.querySelector("#ar-results-content").innerHTML = "";
				activities = result.message ? (result.message.activities || result.message) : [];

			} else if (currentTab === "department") {
				const department = wrapper.querySelector("#ar-department").value;
				if (!department) {
					frappe.msgprint({ message: __("Please select a Department."), indicator: "orange" });
					return;
				}
				result = await frappe.call({
					method: "general_activity_manager.api.get_department_activities",
					args: { department },
				});
				wrapper.querySelector("#ar-results-content").innerHTML = "";
				activities = result.message ? (result.message.activities || result.message) : [];
			}

			if (!Array.isArray(activities)) activities = [];
			renderResults(activities);

		} catch (err) {
			console.error(err);
			frappe.msgprint({ message: __("An error occurred while searching."), indicator: "red" });
		} finally {
			btn.disabled = false;
			btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg> Search Activities`;
		}
	});

	// ── Show student info banner ────────────────────────────────────────────────
	function showStudentInfo(student) {
		const container = wrapper.querySelector("#ar-results-content");
		container.innerHTML = `
      <div style="background:#f0f4ff;border:1px solid #c7d7fc;border-radius:8px;padding:12px 14px;margin-bottom:12px;font-size:0.85rem;">
        <div style="font-weight:600;color:#1a1a2e;margin-bottom:4px;">👤 ${frappe.utils.escape_html(student.full_name)}</div>
        <div style="color:#6b7280;display:flex;gap:16px;flex-wrap:wrap;">
          <span>🆔 ${frappe.utils.escape_html(student.university_reg_no)}</span>
          <span>🏢 ${frappe.utils.escape_html(student.department || "—")}</span>
        </div>
      </div>
      <div id="ar-activity-list-container"></div>`;
	}

	// ── Render results ───────────────────────────────────────────────────────────
	function renderResults(activities) {
		const listContainer = wrapper.querySelector("#ar-activity-list-container");
		const container = listContainer || wrapper.querySelector("#ar-results-content");

		if (!activities.length) {
			if (listContainer) {
				listContainer.innerHTML = emptyState("No activities found for the given criteria.");
			} else {
				container.innerHTML = emptyState("No activities found for the given criteria.");
			}
			return;
		}

		const listHtml = activities.map((a) => `
      <div class="ar-activity-item" data-name="${frappe.utils.escape_html(a.name)}">
        <div class="ar-activity-item-name">${frappe.utils.escape_html(a.event_name || a.name)}</div>
        <div class="ar-activity-item-meta">
          <span>📅 ${a.event_date || "—"}</span>
          ${a.category   ? `<span>🏷 ${frappe.utils.escape_html(a.category)}</span>`   : ""}
          ${a.department ? `<span>🏢 ${frappe.utils.escape_html(a.department)}</span>` : ""}
          ${a.role       ? `<span class="ar-badge ${roleBadge(a.participant_type)}">${frappe.utils.escape_html(a.participant_type)}</span>` : ""}
          ${a.status     ? `<span class="ar-badge ${badgeClass(a.status)}">${frappe.utils.escape_html(a.status)}</span>` : ""}
        </div>
      </div>`).join("");

		container.innerHTML = `
      <div class="ar-results-count">Found <strong>${activities.length}</strong> activit${activities.length === 1 ? "y" : "ies"}</div>
      <div class="ar-activity-list">${listHtml}</div>`;

		container.querySelectorAll(".ar-activity-item").forEach((item) => {
			item.addEventListener("click", () => {
				container.querySelectorAll(".ar-activity-item").forEach((i) => i.classList.remove("selected"));
				item.classList.add("selected");
				loadReport(item.dataset.name);
			});
		});
	}

	// ── Load report ──────────────────────────────────────────────────────────────
	async function loadReport(activityName) {
		const rc = wrapper.querySelector("#ar-report-content");
		rc.innerHTML = `
      <div class="ar-empty">
        <span class="ar-spinner" style="border-color:#1a1a2e33;border-top-color:#1a1a2e;width:28px;height:28px;"></span>
        <p>Generating report…</p>
      </div>`;
		try {
			const result = await frappe.call({
				method: "general_activity_manager.api.get_activity_report",
				args: { activity_name: activityName },
			});
			renderReport(result.message);
		} catch (err) {
			console.error(err);
			rc.innerHTML = `<div class="ar-empty"><p style="color:#ef4444;">Failed to load report. Please try again.</p></div>`;
		}
	}

	// ── Render report panel ──────────────────────────────────────────────────────
	function renderReport(data) {
		if (!data) return;

		const isImage = data.certificate && (data.certificate.endsWith(".jpg") || data.certificate.endsWith(".jpeg") || data.certificate.endsWith(".png") || data.certificate.endsWith(".webp"));

		wrapper.querySelector("#ar-report-content").innerHTML = `
      <div id="ar-print-area">
        <style>
          @media print {
            body * { visibility: hidden; }
            #ar-print-area, #ar-print-area * { visibility: visible; }
            #ar-print-area { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; }
            .ar-no-print { display: none !important; }
            .ar-report-section { border: 1px solid #eee !important; break-inside: avoid; }
            .ar-report-section-header { background: #f0f0f0 !important; -webkit-print-color-adjust: exact; }
          }
        </style>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;" class="ar-no-print">
          <div style="font-size:0.75rem; color:#9ca3af;">Preview Mode</div>
          <button id="ar-btn-print" style="padding: 6px 12px; background: #1a1a2e; color: #fff; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print Report (PDF)
          </button>
        </div>

        <div style="text-align:center; margin-bottom:24px; display:none" class="ar-print-only">
           <h2 style="margin:0; color:#1a1a2e;">Activity Report</h2>
           <p style="margin:4px 0 0; font-size:0.9rem; color:#6b7280;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="ar-report-section">
          <div class="ar-report-section-header">Activity Details</div>
          <div class="ar-report-row"><span class="key">Activity ID</span><span class="val">${frappe.utils.escape_html(data.name)}</span></div>
          <div class="ar-report-row"><span class="key">Event Name</span><span class="val" style="font-weight:700;">${frappe.utils.escape_html(data.event_name || "—")}</span></div>
          <div class="ar-report-row"><span class="key">Event Date</span><span class="val">${data.event_date || "—"}</span></div>
          <div class="ar-report-row"><span class="key">Category</span><span class="val">${frappe.utils.escape_html(data.category || "—")}</span></div>
          <div class="ar-report-row">
            <span class="key">Status</span>
            <span class="val"><span class="ar-badge ${badgeClass(data.status)}">${frappe.utils.escape_html(data.status || "—")}</span></span>
          </div>
        </div>

        ${data.description ? `
        <div class="ar-report-section">
          <div class="ar-report-section-header">Description</div>
          <div style="padding: 12px 14px; font-size: 0.85rem; color: #4b5563; line-height: 1.5; white-space: pre-wrap;">${frappe.utils.escape_html(data.description)}</div>
        </div>` : ""}

        <div class="ar-report-section">
          <div class="ar-report-section-header">Participant Info</div>
          ${data.full_name ? `<div class="ar-report-row"><span class="key">Full Name</span><span class="val">${frappe.utils.escape_html(data.full_name)}</span></div>` : ""}
          ${data.university_reg_no ? `<div class="ar-report-row"><span class="key">University Reg. No</span><span class="val">${frappe.utils.escape_html(data.university_reg_no)}</span></div>` : `<div class="ar-report-row"><span class="key">Participant</span><span class="val">${frappe.utils.escape_html(data.participant || "—")}</span></div>`}
          <div class="ar-report-row">
            <span class="key">Role</span>
            <span class="val"><span class="ar-badge ${roleBadge(data.participant_type)}">${frappe.utils.escape_html(data.participant_type || "—")}</span></span>
          </div>
          <div class="ar-report-row"><span class="key">Department</span><span class="val">${frappe.utils.escape_html(data.department || "—")}</span></div>
        </div>

        ${data.certificate ? `
        <div class="ar-report-section">
          <div class="ar-report-section-header">Certificate</div>
          <div class="ar-report-row">
            <span class="val">
              <a href="${frappe.utils.escape_html(data.certificate)}" target="_blank" style="color:#1a1a2e;font-weight:600;text-decoration:none; display:flex; align-items:center; gap:8px;">
                📎 View Original Certificate →
              </a>
            </span>
          </div>
          ${isImage ? `
          <div style="padding: 0 14px 14px;">
            <img src="${frappe.utils.escape_html(data.certificate)}" style="max-width:100%; border-radius:6px; border:1px solid #eee;" />
          </div>` : ""}
        </div>` : ""}
      </div>`;

		wrapper.querySelector("#ar-btn-print").addEventListener("click", () => {
			window.print();
		});
	}
};