document.addEventListener("DOMContentLoaded", () => {
  loadSubjects();
  loadClassesDropdown();

  // Toggle Subject List
  document.getElementById("toggle-list-btn").addEventListener("click", () => {
    const container = document.getElementById("subject-list-container");
    const btn = document.getElementById("toggle-list-btn");
    if (container.style.display === "none") {
      container.style.display = "block";
      btn.textContent = "Hide Existing Subjects";
    } else {
      container.style.display = "none";
      btn.textContent = "Show Existing Subjects";
    }
  });

  // Add new subject
  document
    .getElementById("subject-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {
        subject_name: document.getElementById("subject_name").value,
        semester: document.getElementById("semester").value,
      };

      try {
        const res = await fetch("/api/subjects/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);

        document.getElementById("subject-form").reset();
        loadSubjects(); // Refresh lists
      } catch (error) {
        alert(error.message);
      }
    });

  // Smart Filter: When class is selected, show only relevant semesters
  document
    .getElementById("class-select")
    .addEventListener("change", async (e) => {
      const classId = e.target.value;
      const assignForm = document.getElementById("assign-form");

      if (!classId) {
        assignForm.style.display = "none";
        return;
      }

      assignForm.style.display = "block";

      // Find out which year was selected to calculate allowed semesters
      const selectedOption = e.target.options[e.target.selectedIndex];
      const classYear = parseInt(selectedOption.dataset.year);

      // Year 1 = Sems 1,2 | Year 2 = Sems 3,4 | Year 3 = Sems 5,6
      const validSemesters = [classYear * 2 - 1, classYear * 2];

      // Hide irrelevant subjects
      document.querySelectorAll(".checkbox-item").forEach((item) => {
        const itemSem = parseInt(item.dataset.semester);
        if (validSemesters.includes(itemSem)) {
          item.style.display = "flex"; // Show
        } else {
          item.style.display = "none"; // Hide
        }
        item.querySelector("input").checked = false; // Uncheck all first
      });

      // Fetch subjects currently assigned to this class
      try {
        const res = await fetch(`/api/subjects/assigned/${classId}`);
        const assignedIds = await res.json();

        assignedIds.forEach((id) => {
          const checkbox = document.getElementById(`sub-${id}`);
          if (checkbox) checkbox.checked = true;
        });
      } catch (error) {
        console.error("Error fetching assigned subjects:", error);
      }
    });

  // Save assignments
  document
    .getElementById("assign-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const classId = document.getElementById("class-select").value;
      const checkedBoxes = document.querySelectorAll(
        ".subject-checkbox:checked",
      );
      const subjectIds = Array.from(checkedBoxes).map((cb) => cb.value);

      try {
        const res = await fetch(`/api/subjects/assign/${classId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subjectIds }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        alert(result.message);
      } catch (error) {
        alert(error.message);
      }
    });
});

// Load classes and embed the 'year' into the dropdown options
async function loadClassesDropdown() {
  try {
    const res = await fetch("/api/classes");
    const classes = await res.json();
    const select = document.getElementById("class-select");
    select.innerHTML = '<option value="">-- Choose a Class --</option>'; // reset

    classes.forEach((cls) => {
      const option = document.createElement("option");
      option.value = cls.id;
      option.dataset.year = cls.year; // Save year for smart filtering
      option.textContent = `Year ${cls.year} - ${cls.name} (${cls.group_name}) Sec ${cls.section}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading classes:", error);
  }
}

// Load subjects into BOTH the checkboxes and the management table
async function loadSubjects() {
  try {
    const res = await fetch("/api/subjects");
    const subjects = await res.json();

    const container = document.getElementById("subjects-container");
    const tableBody = document.getElementById("subject-table-body");

    container.innerHTML = "";
    tableBody.innerHTML = "";

    subjects.forEach((sub) => {
      // 1. Build Checkbox (Embed dataset.semester for smart filtering)
      const div = document.createElement("div");
      div.className = "checkbox-item";
      div.dataset.semester = sub.semester;
      div.innerHTML = `
                <input type="checkbox" class="subject-checkbox" id="sub-${sub.id}" value="${sub.id}">
                <label for="sub-${sub.id}"><strong>${sub.subject_name}</strong> (Sem ${sub.semester})</label>
            `;
      container.appendChild(div);

      // 2. Build Table Row
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${sub.subject_name}</td>
                <td>${sub.semester}</td>
                <td><button class="btn-delete" onclick="deleteSubject(${sub.id})">Delete</button></td>
            `;
      tableBody.appendChild(tr);
    });

    // Re-trigger class selection to re-apply filters if a class is currently selected
    const classSelect = document.getElementById("class-select");
    if (classSelect.value) {
      classSelect.dispatchEvent(new Event("change"));
    }
  } catch (error) {
    console.error("Error loading subjects:", error);
  }
}

// Handle Subject Deletion
async function deleteSubject(id) {
  if (
    !confirm(
      "Are you sure? This will remove the subject from any assigned classes!",
    )
  )
    return;
  try {
    const response = await fetch(`/api/subjects/delete/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      loadSubjects();
    } else {
      alert("Failed to delete subject");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
