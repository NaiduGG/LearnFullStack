let selectedTeachers = [];
let activeAssignment = null; // Stores { class_id, subject_name, label }

const days = [
  { name: "Monday", index: 1 },
  { name: "Tuesday", index: 2 },
  { name: "Wednesday", index: 3 },
  { name: "Thursday", index: 4 },
  { name: "Friday", index: 5 },
  { name: "Saturday", index: 6 },
];
const periods = [1, 2, 3, 4, 5, 6, 7, 8];

document.addEventListener("DOMContentLoaded", () => {
  loadTeachersToDropdown();
});

// --- Safely format text ---
function formatClassName(year, className, groupName, section) {
  const safeSec = section ? section.toUpperCase() : "";
  return `${year} - ${className} - ${groupName} - ${safeSec}`;
}

function toggleNavMenu() {
  document.getElementById("nav-menu").classList.toggle("show");
}
function toggleTeacherDropdown() {
  document.getElementById("teacher-checkboxes").classList.toggle("show");
}

window.onclick = function (e) {
  if (!e.target.matches(".hamburger-btn"))
    document
      .querySelectorAll(".nav-dropdown.show")
      .forEach((m) => m.classList.remove("show"));
  if (
    !e.target.matches(".multi-select-btn") &&
    !e.target.closest(".multi-select-dropdown")
  )
    document
      .querySelectorAll(".multi-select-dropdown.show")
      .forEach((m) => m.classList.remove("show"));
};

function condenseClassName(year, className, groupName, section) {
  const cleanGroup = groupName
    .replace(/[^\w\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
  return `${year} ${className} ${cleanGroup} ${section.toUpperCase()}`;
}

async function loadTeacherSchedule(teacherId) {
  const res = await fetch(`/api/schedule/faculty-grid/${teacherId}`);
  if (!res.ok) throw new Error("Route 7 is failing!");

  const schedule = await res.json();
  const table = document.querySelector(`table[data-teacher-id="${teacherId}"]`);
  let workloadCount = 0;

  if (table) {
    schedule.forEach((slot) => {
      const cell = table.querySelector(
        `.timetable-slot[data-day-index="${slot.day_index}"][data-slot-index="${slot.slot_index}"]`,
      );
      if (cell) {
        const condensedName = formatClassName(
          slot.year,
          slot.class_name,
          slot.group_name,
          slot.section,
        );
        cell.innerHTML = `<strong>${condensedName}</strong><br><span style="font-size:11px; color:#555;">${slot.subject_name}</span>`;
        cell.classList.add("filled");
        cell.dataset.classId = slot.class_id;
        workloadCount++;
      }
    });
    const tag = document.getElementById(`workload-${teacherId}`);
    if (tag) tag.textContent = `${workloadCount} periods/week`;
  }
}

async function loadTeachersToDropdown() {
  const res = await fetch("/api/teachers");
  const teachers = await res.json();
  const container = document.getElementById("teacher-checkboxes");
  container.innerHTML = "";

  teachers.sort((a, b) => a.nickname.localeCompare(b.nickname));

  teachers.forEach((t) => {
    const label = document.createElement("label");
    label.className = "checkbox-item";
    label.innerHTML = `<input type="checkbox" class="teacher-cb" value="${t.id}" data-name="${t.nickname}"> <span style="margin-left: 10px; font-weight: 500;">${t.nickname} (${t.name})</span>`;

    label.querySelector("input").addEventListener("change", (e) => {
      if (e.target.checked) {
        selectedTeachers.push({
          id: parseInt(t.id, 10),
          name: e.target.dataset.name,
        });
      } else {
        selectedTeachers = selectedTeachers.filter(
          (c) => c.id !== parseInt(t.id, 10),
        );
      }
      updateWorkspace();
    });
    container.appendChild(label);
  });
}

async function updateWorkspace() {
  const container = document.getElementById("grids-container");
  container.innerHTML = "";
  activeAssignment = null;

  if (selectedTeachers.length === 0) {
    container.innerHTML = `<div class="empty-state">Please select one or more faculty members to view their timetables.</div>`;
    document.getElementById("sidebar-roster").innerHTML = "";
    return;
  }

  // Safely build all tables first
  for (const teacher of selectedTeachers) {
    buildGridForTeacher(teacher, container);
  }

  // Then safely load the data into them
  for (const teacher of selectedTeachers) {
    try {
      await loadTeacherSchedule(teacher.id);
    } catch (err) {
      console.error(`Error loading schedule for teacher ${teacher.id}:`, err);
    }
  }

  // Finally, safely load the sidebar
  try {
    await loadValidClasses(selectedTeachers.map((t) => t.id));
  } catch (err) {
    console.error("Error loading sidebar classes:", err);
    document.getElementById("sidebar-roster").innerHTML =
      "<span style='color:red;'>Error loading classes. Server route missing?</span>";
  }
}

function buildGridForTeacher(teacher, container) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `<h3 class="class-header">${teacher.name} <span class="workload-tag" id="workload-${teacher.id}">0 periods/week</span></h3>`;

  const table = document.createElement("table");
  table.className = "my-table";
  table.dataset.teacherId = teacher.id;

  let thead = `<thead><tr><th>Day</th><th>9:00-9:45</th><th>9:45-10:30</th><th class="break-col">BRK</th><th>10:45-11:30</th><th>11:30-12:15</th><th class="break-col">BRK</th><th>1:00-1:45</th><th>1:45-2:30</th><th class="break-col">BRK</th><th>2:45-3:30</th><th>3:30-4:15</th></tr></thead>`;
  table.innerHTML = thead;

  const tbody = document.createElement("tbody");
  days.forEach((day) => {
    const tr = document.createElement("tr");
    let rowHtml = `<td><strong>${day.name}</strong></td>`;
    periods.forEach((period) => {
      // Notice: The "read-only" class is gone so hover effects work!
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

  // Attach Interactive Click Events
  table.querySelectorAll(".timetable-slot").forEach((cell) => {
    cell.addEventListener("click", () => handleCellClick(cell, teacher.id));
    cell.addEventListener("contextmenu", (e) =>
      handleCellRightClick(e, cell, teacher.id),
    );
  });
}

// --- NEW: Fetch Eligible Classes for Sidebar ---
async function loadValidClasses(teacherIds) {
  const res = await fetch("/api/schedule/class-options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teacherIds }),
  });

  if (!res.ok)
    throw new Error("Sidebar Route 8 is missing or broken in backend!");

  const combos = await res.json();
  const roster = document.getElementById("sidebar-roster");
  roster.innerHTML = "";

  if (combos.length === 0) {
    roster.innerHTML =
      "<span style='font-size:12px; color:#888;'>No eligible classes found for these teachers.</span>";
    return;
  }

  combos.forEach((combo) => {
    const btn = document.createElement("button");
    btn.className = "sidebar-button";

    // Ensure combo.name is passed here!
    const condensedName = formatClassName(
      combo.year,
      combo.name,
      combo.group_name,
      combo.section,
    );
    btn.innerHTML = `<strong>${condensedName}</strong><br><span style="font-weight:normal;">${combo.subject_name}</span>`;

    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".sidebar-button")
        .forEach((b) => b.classList.remove("active-faculty"));
      btn.classList.add("active-faculty");
      activeAssignment = {
        class_id: combo.class_id,
        subject_name: combo.subject_name,
        label: `<strong>${condensedName}</strong><br><span style="font-size:11px; color:#555;">${combo.subject_name}</span>`,
      };
    });
    roster.appendChild(btn);
  });
}

// --- Interactive Grid Logic ---
async function handleCellClick(cell, teacherId) {
  if (!activeAssignment) {
    alert("Please select an Eligible Class from the sidebar first.");
    return;
  }

  const dayIndex = cell.dataset.dayIndex;
  const slotIndex = cell.dataset.slotIndex;

  try {
    const res = await fetch("/api/schedule/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class_id: activeAssignment.class_id,
        teacher_id: teacherId,
        subject_name: activeAssignment.subject_name,
        day_index: dayIndex,
        slot_index: slotIndex,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      alert(result.error);
    } else {
      // Update the UI
      cell.innerHTML = activeAssignment.label;
      cell.classList.add("filled");
      cell.dataset.classId = activeAssignment.class_id; // Store for deletion

      cell.style.backgroundColor = "#c6f6d5";
      setTimeout(() => (cell.style.backgroundColor = ""), 200);
      updateWorkloadCount(teacherId, 1);
    }
  } catch (e) {
    console.error(e);
  }
}

// --- Master Faculty CSV Export (With Debugging) ---
async function downloadFacultyCSV() {
  console.log("1. Export button clicked!");
  try {
    const exportBtn = document.querySelector(".export-btn");
    exportBtn.textContent = "Exporting...";

    console.log("2. Fetching teachers...");
    const techRes = await fetch("/api/teachers");
    const teachers = await techRes.json();
    console.log(`Found ${teachers.length} teachers.`);

    console.log("3. Fetching master schedule...");
    const schedRes = await fetch("/api/schedule/all-faculty");

    // If you forgot to restart the server, it will fail right here
    if (!schedRes.ok) {
      throw new Error(`Server returned status: ${schedRes.status}`);
    }

    const masterSchedule = await schedRes.json();
    console.log(`Found ${masterSchedule.length} scheduled slots.`);

    let csvContent = "";
    const dayNames = {
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
    };

    console.log("4. Sorting teachers...");
    // Added a fallback just in case a teacher has no nickname
    teachers.sort((a, b) => (a.nickname || "").localeCompare(b.nickname || ""));

    console.log("5. Building CSV grids...");
    teachers.forEach((teacher) => {
      const teacherSchedule = masterSchedule.filter(
        (s) => s.teacher_id === teacher.id,
      );
      const workloadCount = teacherSchedule.length;

      csvContent += `"${teacher.name} (${teacher.nickname || ""}) - Workload: ${workloadCount} periods/week"\n`;
      csvContent += `"Day","9:00 to 9:45","9:45 to 10:30","BREAK","10:45 to 11:30","11:30 to 12:15","BREAK","1:00 to 1:45","1:45 to 2:30","BREAK","2:45 to 3:30","3:30 to 4:15"\n`;

      for (let d = 1; d <= 6; d++) {
        let rowArr = [`"${dayNames[d]}"`];

        for (let p = 1; p <= 8; p++) {
          const lesson = teacherSchedule.find(
            (s) => s.day_index == d && s.slot_index == p,
          );

          if (lesson) {
            const className = formatClassName(
              lesson.year,
              lesson.class_name,
              lesson.group_name,
              lesson.section,
            );
            rowArr.push(`"${className} - ${lesson.subject_name}"`);
          } else {
            rowArr.push(`""`);
          }

          if (p === 2 || p === 4 || p === 6) {
            rowArr.push(`"BREAK"`);
          }
        }
        csvContent += rowArr.join(",") + "\n";
      }
      csvContent += "\n\n";
    });

    console.log("6. Triggering browser download...");
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "master_faculty_timetable.csv";
    a.click();
    URL.revokeObjectURL(url);

    exportBtn.textContent = "Export CSV";
    console.log("7. Success!");
  } catch (error) {
    console.error("FAILED TO EXPORT:", error);
    alert(`Export failed! Check your browser console. Error: ${error.message}`);
    document.querySelector(".export-btn").textContent = "Export CSV";
  }
}
