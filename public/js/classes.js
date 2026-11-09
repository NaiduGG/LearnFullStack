let editingClassId = null;
let allClasses = [];

document.addEventListener("DOMContentLoaded", () => {
  loadClasses();

  // Listen for changes on the new dropdowns
  document
    .getElementById("filter-year")
    .addEventListener("change", renderTable);
  document.getElementById("sort-by").addEventListener("change", renderTable);

  document
    .getElementById("class-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const classData = {
        year: document.getElementById("year").value,
        name: document.getElementById("name").value,
        group_name: document.getElementById("group_name").value,
        section: document.getElementById("section").value,
      };

      const url = editingClassId
        ? `/api/classes/update/${editingClassId}`
        : "/api/classes/add";
      const method = editingClassId ? "PUT" : "POST";

      try {
        const response = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(classData),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        document.getElementById("class-form").reset();
        editingClassId = null;
        document.querySelector(".btn-submit").textContent = "Add Class";

        loadClasses();
      } catch (error) {
        alert(error.message);
      }
    });
});

async function loadClasses() {
  try {
    const response = await fetch("/api/classes");
    allClasses = await response.json();
    renderTable(); // Call the new render function after fetching
  } catch (error) {
    console.error("Error loading classes:", error);
  }
}

// New function dedicated to filtering, sorting, and drawing the table
function renderTable() {
  const filterYear = document.getElementById("filter-year").value;
  const sortBy = document.getElementById("sort-by").value;
  const tbody = document.getElementById("class-table-body");

  // 1. Filter the data
  let processedClasses = allClasses.filter((cls) => {
    if (filterYear === "all") return true;
    return cls.year.toString() === filterYear;
  });

  // 2. Sort the data
  processedClasses.sort((a, b) => {
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);
    if (sortBy === "group-asc") return a.group_name.localeCompare(b.group_name);
    return 0; // Default keeps the original database order
  });

  // 3. Draw the table
  tbody.innerHTML = "";
  processedClasses.forEach((cls) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${cls.year}</td>
            <td>${cls.name}</td>
            <td>${cls.group_name}</td>
            <td>${cls.section}</td>
            <td>
                <button class="btn-edit" onclick="editClass(${cls.id})">Edit</button>
                <button class="btn-delete" onclick="deleteClass(${cls.id})">Delete</button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

function editClass(id) {
  const classToEdit = allClasses.find((cls) => cls.id === id);
  if (!classToEdit) return;

  document.getElementById("year").value = classToEdit.year;
  document.getElementById("name").value = classToEdit.name;
  document.getElementById("group_name").value = classToEdit.group_name;
  document.getElementById("section").value = classToEdit.section;

  editingClassId = id;
  document.querySelector(".btn-submit").textContent = "Update Class";
}

async function deleteClass(id) {
  if (
    !confirm(
      "Are you sure you want to delete this class? This will also remove any schedules tied to it!",
    )
  )
    return;

  try {
    const response = await fetch(`/api/classes/delete/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      loadClasses();
    } else {
      alert("Failed to delete class");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
