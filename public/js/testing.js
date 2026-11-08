const table_data = `
    <table id="my-table">
          <tr>
            <td class="table-cell">Day</td>
            <td class="table-cell">9:00 to 9:45</td>
            <td class="table-cell" ">9:45 to 10:30</td>
            <td class="table-cell" rowspan="7" id="break">break</td>
            <td class="table-cell">10:45 to 11:30</td>
            <td class="table-cell">11:30 to 12:15</td>
            <td class="table-cell"rowspan="7" id="break">break</td>
            <td class="table-cell">1:00 to 1:45</td>
            <td class="table-cell">1:45 to 2:30</td>
            <td class="table-cell"rowspan="7" id="break">break</td>
            <td class="table-cell">2:45 to 3:30</td>
            <td class="table-cell">3:30 to 4:15</td>
          </tr>
          <tr>
            <td  class="table-cell">Monday</td>
            <td draggable="true" class="table-cell timetable-slot"></td>
            <td draggable="true" class="table-cell timetable-slot"></td>
            <td draggable="true" class="table-cell timetable-slot"></td>
            <td draggable="true" class="table-cell timetable-slot"></td>
            <td draggable="true" class="table-cell timetable-slot"></td>
            <td draggable="true" class="table-cell timetable-slot"></td>
            <td draggable="true" class="table-cell timetable-slot"></td>
            <td draggable="true" class="table-cell timetable-slot"></td>

          </tr>
            <tr>
                <td class="table-cell">Tuesday</td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
            </tr>
             <tr>
                <td  class="table-cell">Wednesday</td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
            </tr>
             <tr>
                <td class="table-cell">Thursday</td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
            </tr>
                <tr>
                    <td  class="table-cell">Friday</td>
                    <td draggable="true" class="table-cell timetable-slot"></td>
                    <td draggable="true" class="table-cell timetable-slot"></td>
                    <td draggable="true" class="table-cell timetable-slot"></td>
                    <td draggable="true" class="table-cell timetable-slot"></td>
                    <td draggable="true" class="table-cell timetable-slot"></td>
                    <td draggable="true" class="table-cell timetable-slot"></td>
                    <td draggable="true" class="table-cell timetable-slot"></td>
                    <td draggable="true" class="table-cell timetable-slot"></td>
                </tr>
                 <tr>
                <td class="table-cell">Saturday</td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
                <td draggable="true" class="table-cell timetable-slot"></td>
            </tr>
        </table>
`;

document.getElementById("table-container-1").innerHTML = table_data;
document.getElementById("table-container-2").innerHTML = table_data;

const sidebarButtons = document.querySelectorAll(".sidebar-button");
const tableCells = document.querySelectorAll(".timetable-slot");

// 2. Automatically assign unique IDs to the sidebar buttons
sidebarButtons.forEach((button, index) => {
  button.id = "sidebar-btn-" + index; // e.g., sidebar-btn-0, sidebar-btn-1
});

// 3. Automatically assign unique IDs to the table cells
tableCells.forEach((cell, index) => {
  cell.id = "table-cell-" + index; // e.g., table-cell-0, table-cell-1
});

let activeDraggedId = "";

let committedValues = {};

// Fill the database with the initial table layout text ("Emil", "Tobias", "16", etc.)
tableCells.forEach((cell) => {
  committedValues[cell.id] = cell.textContent;
});

tableCells.forEach((cell) => {
  cell.addEventListener("dragleave", () => {
    cell.style.backgroundColor = ""; // Reset the background to normal

    // Safely restore the original text from our master database shield
    cell.textContent = committedValues[cell.id];
  });
});

sidebarButtons.forEach((button) => {
  button.addEventListener("dragstart", (event) => {
    activeDraggedId = button.id; // Store its ID in our global memory box
    event.dataTransfer.setData("text/plain", button.id); // Package it for the browser engine
  });
});

// Loop through every table cell and listen for a drag action (moving text out of it)
tableCells.forEach((cell) => {
  cell.addEventListener("dragstart", (event) => {
    activeDraggedId = cell.id; // Store its ID in our global memory box
    event.dataTransfer.setData("text/plain", cell.id);
    event.dataTransfer.effectAllowed = "move"; // Signal that we are moving data, not copying
  });
});

tableCells.forEach((cell) => {
  cell.addEventListener("dragover", (event) => {
    event.preventDefault(); // REQUIRED: Tells the browser "Allow drops here!"

    // Change the background color to pale blue instantly
    cell.style.backgroundColor = "#e0e0ff";

    // Find out what element is currently being dragged using our memory box
    const draggedElement = document.getElementById(activeDraggedId);

    if (draggedElement) {
      // Show the preview text inside the cell in real-time
      cell.textContent = draggedElement.textContent;
    }
  });
});

tableCells.forEach((cell) => {
  cell.addEventListener("dragend", (event) => {
    // If it was dropped in an invalid area (outside the table), dropEffect will be "none"
    if (event.dataTransfer.dropEffect === "none") {
      cell.textContent = ""; // Clear the text inside the cell
    }
  });
});

tableCells.forEach((cell) => {
  cell.addEventListener("dragover", (event) => {
    event.preventDefault(); // REQUIRED: Tells the browser "Allow drops here!"

    // Find out what element is currently being dragged using our memory box
    const draggedElement = document.getElementById(activeDraggedId);

    if (draggedElement) {
      // FEATURE UPGRADE: Check if the SHIFT key is actively held down
      if (event.shiftKey) {
        // 1. Instantly turn the cell light green to show it locked in successfully
        cell.style.backgroundColor = "#c6f6d5";

        // 2. Permanently commit the value to memory right now, bypassing the drop event
        committedValues[cell.id] = draggedElement.textContent;
        cell.textContent = committedValues[cell.id];
      } else {
        // Standard Preview Behavior (Shift not pressed)
        cell.style.backgroundColor = "#e0e0ff"; // Pale blue preview color
        cell.textContent = draggedElement.textContent;
      }
    }
  });
});

tableCells.forEach((cell) => {
  cell.addEventListener("drop", (event) => {
    event.preventDefault(); // Stop standard browser anomalies
    cell.style.backgroundColor = ""; // Remove the blue preview background

    const draggedId = event.dataTransfer.getData("text/plain");
    const draggedElement = document.getElementById(draggedId);

    if (draggedElement) {
      // Update our master database with the new text value
      committedValues[cell.id] = draggedElement.textContent;
    } else {
      // If the element dragged was another cell that was just cleared out, copy its value
      const fallbackCell = document.getElementById(activeDraggedId);
      committedValues[cell.id] = fallbackCell ? fallbackCell.textContent : "";
    }

    // Hard-lock the text into the cell display
    cell.textContent = committedValues[cell.id];
  });
});

function downloadCSV() {
  const table = document.getElementById("my-table");
  let csvRows = [];

  // Loop through every physical row layout line
  for (let i = 0; i < table.rows.length; i++) {
    const row = table.rows[i];
    let rowData = [];

    // --- ROW 1: THE HEADERS AND INITIAL STRUCTURE ---
    if (i === 0) {
      for (let j = 0; j < row.cells.length; j++) {
        rowData.push('"' + row.cells[j].textContent.trim() + '"');
      }
    }
    // --- ROWS 2-7: THE DYNAMIC WEEKDAY CONTENT SLOTS ---
    else {
      const cells = row.cells;

      rowData.push('"' + cells[0].textContent.trim() + '"'); // Day Name (e.g., Monday)
      rowData.push('"' + cells[1].textContent.trim() + '"'); // Period 1
      rowData.push('"' + cells[2].textContent.trim() + '"'); // Period 2

      // FIX 1: Manually inject the first break column data value placeholder
      rowData.push('"break"');

      rowData.push('"' + cells[3].textContent.trim() + '"'); // Period 3
      rowData.push('"' + cells[4].textContent.trim() + '"'); // Period 4

      // FIX 2: Manually inject the second break column data value placeholder
      rowData.push('"break"');

      rowData.push('"' + cells[5].textContent.trim() + '"'); // Period 5
      rowData.push('"' + cells[6].textContent.trim() + '"'); // Period 6

      // FIX 3: Manually inject the third break column data value placeholder
      rowData.push('"break"');

      rowData.push('"' + cells[7].textContent.trim() + '"'); // Period 7
      rowData.push('"' + cells[8].textContent.trim() + '"'); // Period 8
    }

    // Merge row columns together with standard commas
    csvRows.push(rowData.join(","));
  }

  // Join all rows vertically with line breaks
  const csvContent = csvRows.join("\n");

  // Package with Excel-friendly UTF-8 Byte Order Mark to ensure proper character rendering
  const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  // Trigger download pipeline
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "timetable_matrix.csv";
  a.click();
  URL.revokeObjectURL(url);
}

window.onload = function () {
  // Ask the Express server for the teacher data list array
  fetch("/api/teachers")
    .then((response) => response.json())
    .then((data) => {
      const sidebarRoster = document.getElementById("sidebar-roaster");
      sidebarRoster.innerHTML = ""; // Clear out the "Loading..." text

      if (data.length === 0) {
        sidebarRoster.innerHTML =
          "<p style='color:#bdc3c7; font-style:italic;'>No teachers in database.</p>";
        return;
      }

      data.forEach((teacher, index) => {
        const button = document.createElement("button");

        // 1. Display the teacher name from your SQLite row schema
        button.textContent = teacher.nickname;

        // 2. MATCH INDEPENDENT STYLE: Uses your exact existing CSS class configuration!
        button.className = "sidebar-button";
        button.draggable = true;

        // 3. Assign unique system tracking IDs to keep drag interactions stable
        button.id = "roster-btn-" + index;

        // 4. Attach your exact existing drag behavior
        button.addEventListener("dragstart", (event) => {
          activeDraggedId = button.id;
          event.dataTransfer.setData("text/plain", button.id);
        });

        sidebarRoster.appendChild(button);
      });
    })
    .catch((error) => console.error("Error fetching teacher data:", error));
};
