document.addEventListener("DOMContentLoaded", () => {
    loadClassesToDropdown();
});

function toggleNavMenu() { document.getElementById("nav-menu").classList.toggle("show"); }
window.onclick = function(e) {
    if (!e.target.matches('.hamburger-btn')) {
        document.querySelectorAll(".nav-dropdown.show").forEach(m => m.classList.remove('show'));
    }
};

async function loadClassesToDropdown() {
    const res = await fetch("/api/classes");
    const classes = await res.json();
    const select = document.getElementById("class-select");
    
    classes.sort((a, b) => a.year - b.year || a.name.localeCompare(b.name));

    classes.forEach(c => {
        const option = document.createElement("option");
        option.value = c.id;
        option.textContent = `Year ${c.year} - ${c.name} (${c.group_name}) Sec ${c.section}`;
        select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
        if (e.target.value) {
            buildAllocationTable(e.target.value);
        } else {
            document.getElementById("allocation-workspace").innerHTML = `<div class="empty-state">Select a class above to lock in their faculty.</div>`;
        }
    });
}

async function buildAllocationTable(classId) {
    const res = await fetch(`/api/allocate/data/${classId}`);
    const { subjects, teachers } = await res.json();
    
    const workspace = document.getElementById("allocation-workspace");
    
    if (subjects.length === 0) {
        workspace.innerHTML = `<div class="empty-state">This class has no subjects assigned yet. Go to Manage Subjects first.</div>`;
        return;
    }

    let html = `
        <table class="allocation-table">
            <thead>
                <tr>
                    <th style="width: 30%">Subject</th>
                    <th style="width: 50%">Assigned Faculty</th>
                    <th style="width: 20%">Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    subjects.forEach(sub => {
        // Filter the eligible teachers just for this specific subject
        const eligibleTeachers = teachers.filter(t => t.subject_id === sub.subject_id);
        
        // Build the dropdown options
        let optionsHtml = `<option value="">-- Unassigned --</option>`;
        eligibleTeachers.forEach(t => {
            const isSelected = sub.assigned_teacher_id === t.teacher_id ? "selected" : "";
            optionsHtml += `<option value="${t.teacher_id}" ${isSelected}>${t.nickname} (${t.name})</option>`;
        });

        const isAssigned = !!sub.assigned_teacher_id;
        const selectClass = isAssigned ? "alloc-select assigned" : "alloc-select";
        const badgeHtml = isAssigned 
            ? `<span class="status-badge status-ok" id="badge-${sub.subject_id}">Locked</span>` 
            : `<span class="status-badge status-warn" id="badge-${sub.subject_id}">Pending</span>`;

        html += `
            <tr>
                <td><strong>${sub.subject_name}</strong></td>
                <td>
                    <select class="${selectClass}" 
                            data-class-id="${classId}" 
                            data-subject-id="${sub.subject_id}" 
                            onchange="saveAllocation(this)">
                        ${optionsHtml}
                    </select>
                </td>
                <td id="status-cell-${sub.subject_id}">${badgeHtml}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    workspace.innerHTML = html;
}

async function saveAllocation(selectElement) {
    const classId = selectElement.dataset.classId;
    const subjectId = selectElement.dataset.subjectId;
    const teacherId = selectElement.value;

    const res = await fetch("/api/allocate/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_id: classId, subject_id: subjectId, teacher_id: teacherId })
    });

    const badgeCell = document.getElementById(`status-cell-${subjectId}`);
    
    if (res.ok) {
        if (teacherId) {
            selectElement.classList.add("assigned");
            badgeCell.innerHTML = `<span class="status-badge status-ok">Locked</span>`;
        } else {
            selectElement.classList.remove("assigned");
            badgeCell.innerHTML = `<span class="status-badge status-warn">Pending</span>`;
        }
    } else {
        alert("Failed to save allocation.");
    }
}