let editingTeacherId = null;
let allTeachers = [];

document.addEventListener("DOMContentLoaded", () => {
  loadTeachers();
  loadSubjects();

  // 1. Add / Update Teacher
  document
    .getElementById("teacher-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById("name").value,
        department: document.getElementById("department").value,
        nickname: document.getElementById("nickname").value,
      };

      const url = editingTeacherId
        ? `/api/teachers/update/${editingTeacherId}`
        : "/api/teachers/add";
      const method = editingTeacherId ? "PUT" : "POST";

      try {
        const res = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);

        resetForm();
        loadTeachers();
      } catch (error) {
        alert(error.message);
      }
    });

  // Cancel Edit Button
  document
    .getElementById("cancel-edit-btn")
    .addEventListener("click", resetForm);

  // 2. Select Teacher Dropdown for Assignment
  document
    .getElementById("teacher-select")
    .addEventListener("change", async (e) => {
      const teacherId = e.target.value;
      const assignForm = document.getElementById("assign-form");

      if (!teacherId) {
        assignForm.style.display = "none";
        return;
      }

      assignForm.style.display = "block";
      document
        .querySelectorAll(".subject-checkbox")
        .forEach((cb) => (cb.checked = false));

      try {
        const res = await fetch(`/api/teachers/assigned/${teacherId}`);
        const assignedIds = await res.json();

        assignedIds.forEach((id) => {
          const checkbox = document.getElementById(`sub-${id}`);
          if (checkbox) checkbox.checked = true;
        });
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    });

  // 3. Save Qualifications
  document
    .getElementById("assign-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const teacherId = document.getElementById("teacher-select").value;
      const checkedBoxes = document.querySelectorAll(
        ".subject-checkbox:checked",
      );
      const subjectIds = Array.from(checkedBoxes).map((cb) => cb.value);

      try {
        const res = await fetch(`/api/teachers/assign/${teacherId}`, {
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

// Load teachers into both the table and the dropdown
async function loadTeachers() {
  try {
    const res = await fetch("/api/teachers");
    allTeachers = await res.json();

    const tableBody = document.getElementById("teacher-table-body");
    const dropdown = document.getElementById("teacher-select");

    tableBody.innerHTML = "";
    dropdown.innerHTML = '<option value="">-- Choose a Teacher --</option>';

    allTeachers.forEach((teacher) => {
      // Table row
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${teacher.name}</td>
                <td>${teacher.department}</td>
                <td>${teacher.nickname}</td>
                <td>
                    <button class="btn-edit" onclick="editTeacher(${teacher.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteTeacher(${teacher.id})">Delete</button>
                </td>
            `;
      tableBody.appendChild(tr);

      // Dropdown option
      const option = document.createElement("option");
      option.value = teacher.id;
      option.textContent = `${teacher.name} (${teacher.nickname})`;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading teachers:", error);
  }
}

// Load all available subjects into the checkbox grid
async function loadSubjects() {
  try {
    const res = await fetch("/api/subjects");
    const subjects = await res.json();
    const container = document.getElementById("subjects-container");
    container.innerHTML = "";

    // Sort by semester, then by name for cleaner display
    subjects.sort(
      (a, b) =>
        a.semester - b.semester || a.subject_name.localeCompare(b.subject_name),
    );

    subjects.forEach((sub) => {
      const div = document.createElement("div");
      div.className = "checkbox-item";
      div.innerHTML = `
                <input type="checkbox" class="subject-checkbox" id="sub-${sub.id}" value="${sub.id}">
                <label for="sub-${sub.id}">
                    <strong>${sub.subject_name}</strong> (Sem ${sub.semester})
                </label>
            `;
      container.appendChild(div);
    });
  } catch (error) {
    console.error("Error loading subjects:", error);
  }
}

function editTeacher(id) {
  const teacher = allTeachers.find((t) => t.id === id);
  if (!teacher) return;

  document.getElementById("name").value = teacher.name;
  document.getElementById("department").value = teacher.department;
  document.getElementById("nickname").value = teacher.nickname;

  editingTeacherId = id;
  document.getElementById("form-submit-btn").textContent = "Update Teacher";
  document.getElementById("cancel-edit-btn").style.display = "inline-block";
}

function resetForm() {
  document.getElementById("teacher-form").reset();
  editingTeacherId = null;
  document.getElementById("form-submit-btn").textContent = "Add Teacher";
  document.getElementById("cancel-edit-btn").style.display = "none";
}

async function deleteTeacher(id) {
  if (
    !confirm(
      "Are you sure? This will remove all their subject qualifications and schedule assignments!",
    )
  )
    return;
  try {
    const res = await fetch(`/api/teachers/delete/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadTeachers();
      document.getElementById("assign-form").style.display = "none";
    } else {
      alert("Failed to delete teacher");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
