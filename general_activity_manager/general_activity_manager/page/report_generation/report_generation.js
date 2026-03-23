frappe.pages["report_generation"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: "Activity Report Generation",
		single_column: true,
	});

	page.main.html(`
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      .ar-root {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #f8fafc;
        min-height: 100vh;
        padding: 32px 24px;
        color: #0f172a;
      }

      .ar-header { margin-bottom: 32px; }
      .ar-header h1 { font-size: 1.875rem; font-weight: 700; color: #0f172a; letter-spacing: -0.025em; }
      .ar-header p  { color: #64748b; font-size: 0.95rem; margin-top: 6px; }

      .ar-tabs {
        display: flex; gap: 12px; margin-bottom: 24px;
        border-bottom: 1px solid #e2e8f0; padding-bottom: 0;
      }
      .ar-tab {
        padding: 12px 24px; font-size: 0.9rem; font-weight: 500;
        border: none; background: none; cursor: pointer; color: #64748b;
        border-bottom: 2px solid transparent; margin-bottom: -1px;
        transition: all 0.2s ease;
      }
      .ar-tab:hover { color: #0f172a; }
      .ar-tab.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 600; }

      .ar-grid {
        display: grid; grid-template-columns: 1fr 1fr;
        grid-template-rows: auto 1fr; gap: 24px; align-items: start;
      }
      @media (max-width: 860px) { .ar-grid { grid-template-columns: 1fr; } }

      .ar-card {
        background: #ffffff; border: 1px solid #e2e8f0;
        border-radius: 12px; padding: 24px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      }
      .ar-card-title {
        display: flex; align-items: center; gap: 8px;
        font-size: 1.05rem; font-weight: 600; color: #0f172a; margin-bottom: 4px;
      }
      .ar-card-subtitle { font-size: 0.85rem; color: #64748b; margin-bottom: 24px; }

      #ar-search-card  { grid-column: 1; grid-row: 1; }
      #ar-results-card { grid-column: 1; grid-row: 2; }
      #ar-report-card  { grid-column: 2; grid-row: 1 / 3; }

      .ar-field { margin-bottom: 20px; }
      .ar-field label {
        display: flex; align-items: center; gap: 6px;
        font-size: 0.85rem; font-weight: 500; color: #475569; margin-bottom: 8px;
      }
      .ar-field input, .ar-field select {
        width: 100%; padding: 10px 14px;
        border: 1px solid #cbd5e1; border-radius: 8px;
        font-size: 0.9rem; color: #0f172a; background: #ffffff;
        outline: none; transition: all 0.2s ease;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02);
      }
      .ar-field input::placeholder { color: #94a3b8; }
      .ar-field input:focus, .ar-field select:focus {
        border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
      }

      .ar-btn-search {
        width: 100%; padding: 12px; background: #2563eb; color: #ffffff;
        border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 500;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        gap: 8px; margin-top: 8px; transition: all 0.2s ease;
        box-shadow: 0 1px 3px rgba(37, 99, 235, 0.3);
      }
      .ar-btn-search:hover    { background: #1d4ed8; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2); }
      .ar-btn-search:active   { transform: translateY(1px); box-shadow: none; }
      .ar-btn-search:disabled { background: #94a3b8; cursor: not-allowed; box-shadow: none; }

      .ar-empty {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; padding: 48px 16px; gap: 16px; text-align: center;
      }
      .ar-empty svg { opacity: .5; color: #94a3b8; }
      .ar-empty p   { font-size: 0.9rem; color: #64748b; font-weight: 400; }

      .ar-activity-list { display: flex; flex-direction: column; gap: 12px; }
      .ar-activity-item {
        border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px;
        cursor: pointer; transition: all 0.2s ease; background: #ffffff;
      }
      .ar-activity-item:hover { border-color: #cbd5e1; background: #f8fafc; transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
      .ar-activity-item.selected {
        border-color: #3b82f6;
        background: #eff6ff;
        box-shadow: 0 0 0 1px #3b82f6;
      }
      .ar-activity-item-name { font-weight: 600; font-size: 0.95rem; color: #0f172a; margin-bottom: 8px; }
      .ar-activity-item-meta { font-size: 0.8rem; color: #64748b; display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }

      .ar-badge {
        display: inline-block; padding: 4px 10px; border-radius: 999px;
        font-size: 0.75rem; font-weight: 600; letter-spacing: 0.025em;
      }
      .ar-badge-green  { background: #dcfce7; color: #166534; }
      .ar-badge-yellow { background: #fef9c3; color: #854d0e; }
      .ar-badge-gray   { background: #f1f5f9; color: #475569; }
      .ar-badge-red    { background: #fee2e2; color: #991b1b; }
      .ar-badge-blue   { background: #dbeafe; color: #1e40af; }
      .ar-badge-purple { background: #f3e8ff; color: #6b21a8; }

      .ar-report-section { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 16px; }
      .ar-report-section-header {
        background: #f8fafc; padding: 12px 16px;
        font-size: 0.8rem; font-weight: 600; color: #475569;
        text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0;
      }
      .ar-report-row { display: flex; padding: 12px 16px; font-size: 0.88rem; border-bottom: 1px solid #f1f5f9; }
      .ar-report-row:last-child { border-bottom: none; }
      .ar-report-row .key { width: 140px; flex-shrink: 0; color: #64748b; font-size: 0.85rem; font-weight: 500; }
      .ar-report-row .val { font-weight: 500; color: #0f172a; flex: 1; }

      .ar-spinner {
        display: inline-block; width: 16px; height: 16px;
        border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
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

        <div class="ar-card" id="ar-search-card">
          <div class="ar-card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span id="ar-search-title">Search Student Activity</span>
          </div>
          <div class="ar-card-subtitle" id="ar-search-subtitle">Enter university register number and start date</div>

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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Search Activities
          </button>
        </div>

        <div class="ar-card" id="ar-results-card">
          <div class="ar-card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Search Results
          </div>
          <div class="ar-card-subtitle">Your registered activities will appear here</div>
          <div id="ar-results-content">
            <div class="ar-empty">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p>Enter your details above to search for activities</p>
            </div>
          </div>
        </div>

        <div class="ar-card" id="ar-report-card">
          <div class="ar-card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Generated Report
          </div>
          <div class="ar-card-subtitle">Click an activity to generate its report</div>
          <div id="ar-report-content">
            <div class="ar-empty">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p>Search and select an activity to generate the report</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  `);

	// ── State ────────────────────────────────────────────────────────────────────
	let currentTab = "student";
	let currentActivitiesList = []; // NEW: Store current activities for batch printing

	// ── Helpers ──────────────────────────────────────────────────────────────────
	function badgeClass(status) {
		if (!status) return "ar-badge-gray";
		const s = status.toLowerCase();
		if (["completed", "approved", "active"].includes(s)) return "ar-badge-green";
		if (["pending", "in progress"].includes(s)) return "ar-badge-yellow";
		if (["cancelled", "rejected"].includes(s)) return "ar-badge-red";
		if (["submitted"].includes(s)) return "ar-badge-blue";
		return "ar-badge-gray";
	}

	function roleBadge(role) {
		if (!role) return "ar-badge-gray";
		const r = role.toLowerCase();
		if (r === "student") return "ar-badge-blue";
		if (r === "faculty") return "ar-badge-purple";
		if (r === "department head") return "ar-badge-green";
		return "ar-badge-gray";
	}

	function emptyState(msg) {
		return `<div class="ar-empty">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.3">
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

			wrapper.querySelector("#ar-form-student").style.display =
				currentTab === "student" ? "" : "none";
			wrapper.querySelector("#ar-form-staff").style.display =
				currentTab === "staff" ? "" : "none";
			wrapper.querySelector("#ar-form-department").style.display =
				currentTab === "department" ? "" : "none";

			const titles = {
				student: [
					"Search Student Activity",
					"Enter university register number and start date",
				],
				staff: ["Search Staff Activity", "Enter faculty register number and start date"],
				department: [
					"Search Department Activity",
					"Select a department to view all its activities",
				],
			};
			wrapper.querySelector("#ar-search-title").textContent = titles[currentTab][0];
			wrapper.querySelector("#ar-search-subtitle").textContent = titles[currentTab][1];

			wrapper.querySelector("#ar-results-content").innerHTML = emptyState(
				"Enter your details above to search for activities"
			);
			wrapper.querySelector("#ar-report-content").innerHTML = emptyState(
				"Search and select an activity to generate the report"
			);
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
					frappe.msgprint({
						message: __("Please enter Student ID and Start Date."),
						indicator: "orange",
					});
					return;
				}
				result = await frappe.call({
					method: "general_activity_manager.api.get_student_activities",
					args: { student_id: studentId, start_date: startDate },
				});

				if (result.message && result.message.student) {
					showStudentInfo(result.message.student);
				}
				activities = result.message ? result.message.activities || result.message : [];
			} else if (currentTab === "staff") {
				const staffId = wrapper.querySelector("#ar-staff-id").value.trim();
				const startDate = wrapper.querySelector("#ar-staff-start").value;
				if (!staffId || !startDate) {
					frappe.msgprint({
						message: __(
							"Please enter Faculty University Register No. and Start Date."
						),
						indicator: "orange",
					});
					return;
				}
				result = await frappe.call({
					method: "general_activity_manager.api.get_staff_activities",
					args: { staff_id: staffId, start_date: startDate },
				});
				wrapper.querySelector("#ar-results-content").innerHTML = "";
				activities = result.message ? result.message.activities || result.message : [];
			} else if (currentTab === "department") {
				const department = wrapper.querySelector("#ar-department").value;
				if (!department) {
					frappe.msgprint({
						message: __("Please select a Department."),
						indicator: "orange",
					});
					return;
				}
				result = await frappe.call({
					method: "general_activity_manager.api.get_department_activities",
					args: { department },
				});
				wrapper.querySelector("#ar-results-content").innerHTML = "";
				activities = result.message ? result.message.activities || result.message : [];
			}

			if (!Array.isArray(activities)) activities = [];

			// Store activities for batch printing
			currentActivitiesList = activities;
			renderResults(activities);
		} catch (err) {
			console.error(err);
			frappe.msgprint({
				message: __("An error occurred while searching."),
				indicator: "red",
			});
		} finally {
			btn.disabled = false;
			btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg> Search Activities`;
		}
	});

	// ── Show student info banner ────────────────────────────────────────────────
	function showStudentInfo(student) {
		const container = wrapper.querySelector("#ar-results-content");
		container.innerHTML = `
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;margin-bottom:16px;font-size:0.9rem;">
        <div style="font-weight:600;color:#1e3a8a;margin-bottom:6px;font-size:1rem;">👤 ${frappe.utils.escape_html(
			student.full_name
		)}</div>
        <div style="color:#3b82f6;display:flex;gap:16px;flex-wrap:wrap;font-weight:500;">
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
				listContainer.innerHTML = emptyState(
					"No activities found for the given criteria."
				);
			} else {
				container.innerHTML = emptyState("No activities found for the given criteria.");
			}
			return;
		}

		const listHtml = activities
			.map(
				(a) => `
      <div class="ar-activity-item" data-name="${frappe.utils.escape_html(a.name)}">
        <div class="ar-activity-item-name">${frappe.utils.escape_html(
			a.event_name || a.name
		)}</div>
        <div class="ar-activity-item-meta">
          <span>📅 ${a.event_date || "—"}</span>
          ${a.category ? `<span>🏷 ${frappe.utils.escape_html(a.category)}</span>` : ""}
          ${a.department ? `<span>🏢 ${frappe.utils.escape_html(a.department)}</span>` : ""}
          ${
				a.role
					? `<span class="ar-badge ${roleBadge(
							a.participant_type
					  )}">${frappe.utils.escape_html(a.participant_type)}</span>`
					: ""
			}
          ${
				a.status
					? `<span class="ar-badge ${badgeClass(a.status)}">${frappe.utils.escape_html(
							a.status
					  )}</span>`
					: ""
			}
        </div>
      </div>`
			)
			.join("");

		// Added "Print All" button next to results count
		container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div style="font-size: 0.85rem; color: #475569;">Found <strong>${
				activities.length
			}</strong> activit${activities.length === 1 ? "y" : "ies"}</div>
          <button id="ar-btn-print-all" style="padding: 6px 12px; background: #0f172a; color: #ffffff; border: none; border-radius: 6px; font-size: 0.85rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print All Results
          </button>
      </div>
      <div class="ar-activity-list">${listHtml}</div>`;

		container.querySelectorAll(".ar-activity-item").forEach((item) => {
			item.addEventListener("click", () => {
				container
					.querySelectorAll(".ar-activity-item")
					.forEach((i) => i.classList.remove("selected"));
				item.classList.add("selected");
				loadReport(item.dataset.name);
			});
		});

		// Attach event listener for Print All
		container.querySelector("#ar-btn-print-all").addEventListener("click", printAllReports);
	}

	// ── Fetch multiple reports for Print All ─────────────────────────────────────
	async function printAllReports() {
		if (!currentActivitiesList || currentActivitiesList.length === 0) return;

		const rc = wrapper.querySelector("#ar-report-content");
		const printAllBtn = wrapper.querySelector("#ar-btn-print-all");

		// Set button loading state
		printAllBtn.disabled = true;
		printAllBtn.innerHTML = `<span class="ar-spinner" style="border-color:rgba(255,255,255,0.3);border-top-color:#fff;width:14px;height:14px;"></span> Fetching...`;

		rc.innerHTML = `
      <div class="ar-empty">
        <span class="ar-spinner" style="border-color:rgba(37,99,235,0.2);border-top-color:#2563eb;width:32px;height:32px;"></span>
        <p id="ar-print-all-progress">Fetching reports (0/${currentActivitiesList.length})…</p>
      </div>`;

		try {
			let allHtmlParts = [];

			// Fetch each report sequentially to avoid overwhelming the backend
			for (let i = 0; i < currentActivitiesList.length; i++) {
				wrapper.querySelector("#ar-print-all-progress").textContent = `Fetching report ${
					i + 1
				} of ${currentActivitiesList.length}…`;

				const activityName = currentActivitiesList[i].name;
				const result = await frappe.call({
					method: "general_activity_manager.api.get_activity_report",
					args: { activity_name: activityName },
				});

				if (result.message) {
					// Wrap each report in a div that tells the printer to create a new page
					allHtmlParts.push(`
						<div class="ar-page-break">
							${getReportBodyHTML(result.message)}
						</div>
					`);
				}
			}

			// Render the combined payload into the report panel
			renderCombinedReports(allHtmlParts.join(""), currentActivitiesList.length);
		} catch (err) {
			console.error(err);
			rc.innerHTML = `<div class="ar-empty"><p style="color:#ef4444;">Failed to generate bulk reports. Please try again.</p></div>`;
		} finally {
			// Restore button state
			printAllBtn.disabled = false;
			printAllBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> Print All Results`;
		}
	}

	// ── Load single report ───────────────────────────────────────────────────────
	async function loadReport(activityName) {
		const rc = wrapper.querySelector("#ar-report-content");
		rc.innerHTML = `
      <div class="ar-empty">
        <span class="ar-spinner" style="border-color:rgba(37,99,235,0.2);border-top-color:#2563eb;width:32px;height:32px;"></span>
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

	// ── Render single report panel ───────────────────────────────────────────────
	function renderReport(data) {
		if (!data) return;

		wrapper.querySelector("#ar-report-content").innerHTML = `
      <div id="ar-print-area">
        ${getReportPrintStyles()}
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;" class="ar-no-print">
          <div style="font-size:0.85rem; font-weight:600; color:#64748b; background: #f1f5f9; padding: 4px 12px; border-radius: 999px;">📄 Document Preview</div>
          <button id="ar-btn-print" style="padding: 10px 18px; background: #2563eb; color: #ffffff; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(37,99,235,0.2); transition: all 0.2s;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Download PDF
          </button>
        </div>
        ${getReportBodyHTML(data)}
      </div>`;

		bindPrintButton();
	}

	// ── Render combined reports panel ────────────────────────────────────────────
	function renderCombinedReports(htmlContent, count) {
		wrapper.querySelector("#ar-report-content").innerHTML = `
      <div id="ar-print-area">
        ${getReportPrintStyles()}
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; background: #eff6ff; padding: 16px; border-radius: 12px; border: 1px solid #bfdbfe;" class="ar-no-print">
          <div>
              <div style="font-size:0.9rem; font-weight:700; color:#1e3a8a; margin-bottom:4px;">📄 Batch Preview Ready</div>
              <div style="font-size:0.8rem; color:#3b82f6;">Scroll down to preview all ${count} reports.</div>
          </div>
          <button id="ar-btn-print" style="padding: 10px 18px; background: #2563eb; color: #ffffff; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(37,99,235,0.2); transition: all 0.2s;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print All ${count} PDFs
          </button>
        </div>
        ${htmlContent}
      </div>`;

		bindPrintButton();
	}

	// ── Reusable Component: Print CSS Styles ─────────────────────────────────────
	function getReportPrintStyles() {
		return `
        <style>
          #ar-print-area { color: #0f172a; }

          @media print {
            @page { margin: 20mm; }

            /* 1. AGGRESSIVELY HIDE ALL FRAPPE SHELL UI & SEARCH PANELS */
            .navbar,
            .app-sidebar,
            .standard-sidebar,
            .sidebar-left,
            .layout-side-section,
            .page-head,
            header,
            .ar-no-print,
            .ar-header,
            .ar-tabs,
            #ar-search-card,
            #ar-results-card {
                display: none !important;
            }

            /* 2. FORCE FRAPPE MAIN CONTAINERS TO FULL WIDTH (NO PADDING/MARGINS) */
            body, html,
            .main-section,
            .page-body,
            .page-content-wrapper,
            .layout-main-section,
            .page-wrapper,
            .page-container,
            .content,
            .container,
            .ar-root,
            .ar-grid,
            .ar-card,
            #ar-report-card {
                display: block !important;
                position: static !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
                overflow: visible !important;
                height: auto !important;
                background: transparent !important;
                transform: none !important;
            }

            /* 3. STYLES FOR THE PRINTED CONTENT */
            #ar-print-area {
                visibility: visible;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                font-family: 'Inter', sans-serif;
                width: 100% !important;
            }

            .ar-print-header { display: block !important; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 32px; }
            .ar-report-section { border: 1px solid #cbd5e1 !important; margin-bottom: 24px !important; page-break-inside: avoid; break-inside: avoid; border-radius: 8px; }
            .ar-report-section-header { background-color: #f1f5f9 !important; color: #334155 !important; font-weight: bold !important; padding: 12px 16px !important; border-bottom: 1px solid #cbd5e1 !important; }
            .ar-report-row { border-bottom: 1px solid #e2e8f0 !important; }
            img { max-width: 100% !important; page-break-inside: avoid; break-inside: avoid; }

            /* 4. THE MAGIC PAGE BREAK FIX */
            .ar-page-break {
                page-break-after: always !important;
                break-after: page !important;
                display: block !important;
                clear: both !important;
            }
            .ar-page-break:last-child {
                page-break-after: auto !important;
                break-after: auto !important;
            }
          }
        </style>
		`;
	}

	// ── Reusable Component: HTML Generator for a Single Report ───────────────────
	function getReportBodyHTML(data) {
		const isImage =
			data.certificate &&
			(data.certificate.endsWith(".jpg") ||
				data.certificate.endsWith(".jpeg") ||
				data.certificate.endsWith(".png") ||
				data.certificate.endsWith(".webp"));

		return `
        <div class="ar-print-header" style="display:none;">
           <div style="display:flex; justify-content:space-between; align-items:flex-end;">
               <div>
                   <h1 style="margin:0; color:#0f172a; font-size:24px; font-weight:700;">Official Activity Report</h1>
                   <p style="margin:4px 0 0; font-size:14px; color:#475569;">${frappe.utils.escape_html(
						data.department || "General Department"
					)}</p>
               </div>
               <div style="text-align:right;">
                   <p style="margin:0; font-size:12px; color:#64748b; font-weight: 500;">GENERATED ON</p>
                   <p style="margin:2px 0 0; font-size:14px; color:#0f172a; font-weight: 600;">${new Date().toLocaleDateString(
						"en-GB",
						{ day: "numeric", month: "short", year: "numeric" }
					)}</p>
               </div>
           </div>
        </div>

        <div class="ar-report-section">
          <div class="ar-report-section-header">Participant Information</div>
          ${
				data.full_name
					? `<div class="ar-report-row"><span class="key">Full Name</span><span class="val">${frappe.utils.escape_html(
							data.full_name
					  )}</span></div>`
					: ""
			}
          ${
				data.university_reg_no
					? `<div class="ar-report-row"><span class="key">University Reg. No</span><span class="val">${frappe.utils.escape_html(
							data.university_reg_no
					  )}</span></div>`
					: `<div class="ar-report-row"><span class="key">Participant</span><span class="val">${frappe.utils.escape_html(
							data.participant || "—"
					  )}</span></div>`
			}
          <div class="ar-report-row"><span class="key">Department</span><span class="val">${frappe.utils.escape_html(
				data.department || "—"
			)}</span></div>
        </div>

        <div class="ar-report-section">
          <div class="ar-report-section-header">Activity Details</div>
          <div class="ar-report-row"><span class="key">Event Name</span><span class="val" style="font-weight:700; color:#2563eb;">${frappe.utils.escape_html(
				data.event_name || "—"
			)}</span></div>
          <div class="ar-report-row"><span class="key">Event Date</span><span class="val">${
				data.event_date || "—"
			}</span></div>
          <div class="ar-report-row"><span class="key">Category</span><span class="val">${frappe.utils.escape_html(
				data.category || "—"
			)}</span></div>
        </div>

        ${
			data.description
				? `
        <div class="ar-report-section">
          <div class="ar-report-section-header">Description</div>
          <div style="padding: 16px; font-size: 0.95rem; color: #334155; line-height: 1.7; white-space: pre-wrap;">${frappe.utils.escape_html(
				data.description
			)}</div>
        </div>`
				: ""
		}

        ${
			data.certificate
				? `
        <div class="ar-report-section" style="page-break-inside: avoid;">
          <div class="ar-report-section-header">Attached Certificate</div>
          <div class="ar-report-row ar-no-print">
            <span class="val">
              <a href="${frappe.utils.escape_html(
					data.certificate
				)}" target="_blank" style="color:#2563eb;font-weight:600;text-decoration:none; display:inline-flex; align-items:center; gap:8px; background: #eff6ff; padding: 6px 12px; border-radius: 6px;">
                📎 Open Original File in New Tab
              </a>
            </span>
          </div>
          ${
				isImage
					? `
          <div style="padding: 16px; text-align: center;">
            <img src="${frappe.utils.escape_html(
				data.certificate
			)}" style="max-width:100%; max-height: 600px; border-radius:8px; border:2px solid #e2e8f0; object-fit: contain;" alt="Certificate" />
          </div>`
					: `<div style="padding: 16px; color: #64748b; font-size: 0.9rem;"><em>Certificate attached as a document (cannot be previewed inline).</em></div>`
			}
        </div>`
				: ""
		}
		`;
	}

	function bindPrintButton() {
		const printBtn = wrapper.querySelector("#ar-btn-print");
		if (printBtn) {
			printBtn.addEventListener(
				"mouseover",
				() => (printBtn.style.transform = "translateY(-1px)")
			);
			printBtn.addEventListener("mouseout", () => (printBtn.style.transform = "none"));
			printBtn.addEventListener("click", () => window.print());
		}
	}
};
