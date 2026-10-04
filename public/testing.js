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
