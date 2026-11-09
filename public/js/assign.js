let selectedClasses = [];
let activeAssignment = null; // Stores { teacher_id, subject_name, label }

// Mapping days to your database day_index format
const days = [
  { name: "Monday", index: 1 },
  { name: "Tuesday", index: 2 },
  { name: "Wednesday", index: 3 },
  { name: "Thursday", index: 4 },
  { name: "Friday", index: 5 },
  { name: "Saturday", index: 6 },
];
const periods = [1, 2, 3, 4, 5, 6, 7, 8]; // slot_index

document.addEventListener("DOMContentLoaded", () => {
  loadClassesToDropdown();
});

// --- Navigation & UI Toggles ---
function toggleNavMenu() {
  document.getElementById("nav-menu").classList.toggle("show");
}
function toggleClassDropdown() {
  document.getElementById("class-checkboxes").classList.toggle("show");
}

window.onclick = function (e) {
  if (!e.target.matches(".hamburger-btn")) {
    document
      .querySelectorAll(".nav-dropdown.show")
      .forEach((m) => m.classList.remove("show"));
  }
  if (
    !e.target.matches(".multi-select-btn") &&
    !e.target.closest(".multi-select-dropdown")
  ) {
    document
      .querySelectorAll(".multi-select-dropdown.show")
      .forEach((m) => m.classList.remove("show"));
  }
};

// --- Load & Track Classes ---
// --- Load & Track Classes ---
async function loadClassesToDropdown() {
  const res = await fetch("/api/classes");
  const classes = await res.json();
  const container = document.getElementById("class-checkboxes");
  container.innerHTML = ""; // Clear existing

  // Sort classes by Year first, then by Name for a clean UI
  classes.sort((a, b) => a.year - b.year || a.name.localeCompare(b.name));

  classes.forEach((cls) => {
    const label = document.createElement("label");
    label.className = "checkbox-item";

    // Beautifully formatted display string with the Year included
    const displayName = `Year ${cls.year} • ${cls.name} (${cls.group_name}) • Sec ${cls.section}`;

    label.innerHTML = `
            <input type="checkbox" class="class-cb" value="${cls.id}" data-name="${displayName}"> 
            <span style="margin-left: 10px; font-weight: 500;">${displayName}</span>
        `;

    label.querySelector("input").addEventListener("change", (e) => {
      if (e.target.checked) {
        // Ensure ID is stored as an integer
        selectedClasses.push({
          id: parseInt(cls.id, 10),
          name: e.target.dataset.name,
        });
      } else {
        selectedClasses = selectedClasses.filter(
          (c) => c.id !== parseInt(cls.id, 10),
        );
      }
      updateWorkspace();
    });
    container.appendChild(label);
  });
}

// --- Rebuild the Workspace ---
function updateWorkspace() {
  const container = document.getElementById("grids-container");
  container.innerHTML = "";
  activeAssignment = null;

  if (selectedClasses.length === 0) {
    container.innerHTML = `<div class="empty-state">Please select one or more classes to begin.</div>`;
    document.getElementById("sidebar-roaster").innerHTML = "";
    return;
  }

  selectedClasses.forEach((cls) => {
    buildGridForClass(cls, container);
    loadExistingSchedule(cls.id);
  });

  loadValidFaculty(selectedClasses.map((c) => c.id));
}

function buildGridForClass(cls, container) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `<h3 class="class-header">${cls.name}</h3>`;

  const table = document.createElement("table");
  table.className = "my-table";
  table.dataset.classId = cls.id;

  let thead = `<thead><tr><th>Day</th><th>9:00-9:45</th><th>9:45-10:30</th><th class="break-col">BRK</th><th>10:45-11:30</th><th>11:30-12:15</th><th class="break-col">BRK</th><th>1:00-1:45</th><th>1:45-2:30</th><th class="break-col">BRK</th><th>2:45-3:30</th><th>3:30-4:15</th></tr></thead>`;
  table.innerHTML = thead;

  const tbody = document.createElement("tbody");
  days.forEach((day) => {
    const tr = document.createElement("tr");
    let rowHtml = `<td><strong>${day.name}</strong></td>`;
    periods.forEach((period) => {
      // Uses your database schema indices
      rowHtml += `<td class="timetable-slot" data-day-index="${day.index}" data-slot-index="${period}"></td>`;
      if (period === 2 || period === 4 || period === 6)
        rowHtml += `<td class="break-col"></td>`;
    });
    tr.innerHTML = rowHtml;
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);
  container.appendChild(wrapper);

  table.querySelectorAll(".timetable-slot").forEach((cell) => {
    cell.addEventListener("click", () => handleCellClick(cell, cls.id));
    cell.addEventListener("contextmenu", (e) =>
      handleCellRightClick(e, cell, cls.id),
    );
  });
}

// --- Fetch valid combinations ---
async function loadValidFaculty(classIds) {
  const res = await fetch("/api/schedule/faculty-options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ classIds }),
  });
  const combos = await res.json();

  const roster = document.getElementById("sidebar-roaster");
  roster.innerHTML = "";

  if (combos.length === 0) {
    roster.innerHTML =
      "<span style='font-size:12px; color:red;'>No faculty mapped to these classes yet.</span>";
    return;
  }

  combos.forEach((combo) => {
    const btn = document.createElement("button");
    btn.className = "sidebar-button";
    btn.innerHTML = `${combo.nickname}<br><span style="font-weight:normal;">${combo.subject_name}</span>`;

    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".sidebar-button")
        .forEach((b) => b.classList.remove("active-faculty"));
      btn.classList.add("active-faculty");
      activeAssignment = {
        teacher_id: combo.teacher_id,
        subject_name: combo.subject_name,
        label: `${combo.nickname}<br><span style="font-size:10px; font-weight:normal;">${combo.subject_name}</span>`,
      };
    });
    roster.appendChild(btn);
  });
}

// --- Master CSV Export ---
async function downloadCSV() {
  try {
    // Change the export button text to show it's working
    const exportBtn = document.querySelector(".export-btn");
    exportBtn.textContent = "Exporting...";

    // 1. Fetch ALL classes in the system
    const classRes = await fetch("/api/classes");
    const classes = await classRes.json();

    // 2. Fetch the ENTIRE saved schedule from the database
    const schedRes = await fetch("/api/schedule/all");
    const masterSchedule = await schedRes.json();

    let csvContent = "";
    const dayNames = {
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
    };

    // Sort classes beautifully (Year first, then Name)
    classes.sort((a, b) => a.year - b.year || a.name.localeCompare(b.name));

    // 3. Build a grid for every single class
    classes.forEach((cls) => {
      const className = `Year ${cls.year} - ${cls.name} (${cls.group_name}) Sec ${cls.section}`;

      // Print the Class Name as a header
      csvContent += `"${className}"\n`;

      // Print the column headers
      csvContent += `"Day","9:00 to 9:45","9:45 to 10:30","BREAK","10:45 to 11:30","11:30 to 12:15","BREAK","1:00 to 1:45","1:45 to 2:30","BREAK","2:45 to 3:30","3:30 to 4:15"\n`;

      // Filter the master schedule just for this class
      const classSchedule = masterSchedule.filter((s) => s.class_id === cls.id);

      // Loop through all 6 days
      for (let d = 1; d <= 6; d++) {
        let rowArr = [`"${dayNames[d]}"`];

        // Loop through all 8 periods
        for (let p = 1; p <= 8; p++) {
          const lesson = classSchedule.find(
            (s) => s.day_index == d && s.slot_index == p,
          );

          if (lesson) {
            // If there is a lesson, print Teacher and Subject
            rowArr.push(`"${lesson.teacher_name} (${lesson.subject_name})"`);
          } else {
            // Empty slot
            rowArr.push(`""`);
          }

          // Manually inject the Break columns
          if (p === 2 || p === 4 || p === 6) {
            rowArr.push(`"BREAK"`);
          }
        }
        csvContent += rowArr.join(",") + "\n";
      }
      csvContent += "\n\n"; // Add two blank rows between different classes
    });

    // 4. Trigger the download pipeline
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "master_timetable.csv";
    a.click();
    URL.revokeObjectURL(url);

    // Reset button
    exportBtn.textContent = "Export CSV";
  } catch (error) {
    console.error("Failed to download CSV", error);
    alert("Error generating the master CSV.");
    document.querySelector(".export-btn").textContent = "Export CSV";
  }
}

// --- Clear All Selected Classes ---
async function clearSelectedClasses() {
  if (selectedClasses.length === 0) {
    alert("Please select at least one class from the dropdown to clear.");
    return;
  }

  // The safety alert!
  const confirmClear = confirm(
    "Are you sure? This will permanently remove ALL faculty assigned to the currently selected classes!",
  );

  if (!confirmClear) return; // If they click 'Cancel', stop here.

  const classIds = selectedClasses.map((c) => c.id);

  try {
    const res = await fetch("/api/schedule/clear-classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classIds }),
    });

    if (res.ok) {
      // Instantly refresh the grids to show them empty
      updateWorkspace();
    } else {
      alert("Failed to clear schedules. Please check the server.");
    }
  } catch (error) {
    console.error("Error clearing classes:", error);
  }
}

// --- Cell Interactions ---
async function handleCellClick(cell, classId) {
  if (!activeAssignment) {
    alert("Please select a Faculty (Subject) from the sidebar first.");
    return;
  }

  const dayIndex = cell.dataset.dayIndex;
  const slotIndex = cell.dataset.slotIndex;

  try {
    const res = await fetch("/api/schedule/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class_id: classId,
        teacher_id: activeAssignment.teacher_id,
        subject_name: activeAssignment.subject_name,
        day_index: dayIndex,
        slot_index: slotIndex,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      alert(result.error);
    } else {
      cell.innerHTML = activeAssignment.label;
      cell.classList.add("filled");
      cell.style.backgroundColor = "#c6f6d5";
      setTimeout(() => (cell.style.backgroundColor = ""), 200);
    }
  } catch (e) {
    console.error(e);
  }
}

async function handleCellRightClick(e, cell, classId) {
  e.preventDefault();
  const dayIndex = cell.dataset.dayIndex;
  const slotIndex = cell.dataset.slotIndex;

  await fetch("/api/schedule/clear", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      class_id: classId,
      day_index: dayIndex,
      slot_index: slotIndex,
    }),
  });
  cell.innerHTML = "";
  cell.classList.remove("filled");
}

async function loadExistingSchedule(classId) {
  const res = await fetch(`/api/schedule/grid/${classId}`);
  const schedule = await res.json();

  const table = document.querySelector(`table[data-class-id="${classId}"]`);
  if (!table) return;

  schedule.forEach((slot) => {
    const cell = table.querySelector(
      `.timetable-slot[data-day-index="${slot.day_index}"][data-slot-index="${slot.slot_index}"]`,
    );
    if (cell) {
      cell.innerHTML = `${slot.nickname}<br><span style="font-size:10px; font-weight:normal;">${slot.subject_name}</span>`;
      cell.classList.add("filled");
    }
  });
}
