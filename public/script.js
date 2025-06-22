let calendar;
const billForm = document.getElementById("billForm");
const selectedDayBills = document.getElementById("selectedDayBills");
let bills = JSON.parse(localStorage.getItem("bills") || "[]");

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth', // Always start in month view
    selectable: true,
    events: generateRecurringEvents(),
    dateClick: function(info) {
      calendar.changeView('dayGridDay', info.dateStr); // Switch to day view
      showBillsForDay(parseInt(info.dateStr.split("-")[2])); // Show bills for clicked day
    }
  });

  calendar.render();
  showBillsForDay(new Date().getDate());
});

billForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(billForm);
  const name = formData.get("name");
  const due_day = parseInt(formData.get("due_day"));
  const amount = parseFloat(formData.get("amount")).toFixed(2);

  const id = Date.now().toString();
  const bill = { id, name, due_day, amount };
  bills.push(bill);
  localStorage.setItem("bills", JSON.stringify(bills));

  calendar.removeAllEvents();
  calendar.addEventSource(generateRecurringEvents());

  billForm.reset();
  showBillsForDay(due_day);
});

function generateRecurringEvents() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  return bills.map(bill => {
    const date = new Date(year, month, bill.due_day);
    return {
      title: bill.name + " - $" + bill.amount,
      start: date.toISOString().split("T")[0],
      allDay: true
    };
  });
}

function showBillsForDay(day) {
  selectedDayBills.innerHTML = "";
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const dateStr = new Date(year, month, day).toISOString().split("T")[0];

  const filtered = bills.filter(b => parseInt(b.due_day) === day);
  if (filtered.length === 0) {
    selectedDayBills.innerHTML = `<div class="bill-item">No bills for this day.</div>`;
    return;
  }

  filtered.forEach(bill => {
    const div = document.createElement("div");
    div.className = "bill-item";

    const content = document.createElement("div");
    content.innerHTML = `<strong>${bill.name}</strong> – $${bill.amount}`;

    const actions = document.createElement("div");
    actions.style.marginTop = "10px";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn btn-edit";
    editBtn.onclick = () => startEditBill(bill);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "btn btn-delete";
    delBtn.onclick = () => deleteBill(bill.id);

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    div.appendChild(content);
    div.appendChild(actions);
    selectedDayBills.appendChild(div);
  });
}

function showBackToMonthButton() {
  let btn = document.getElementById("backToMonthBtn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "backToMonthBtn";
    btn.textContent = "Back to Month";
    btn.style.margin = "10px 0";
    btn.onclick = () => {
      calendar.changeView('dayGridMonth');
      btn.remove();
      selectedDayBills.innerHTML = "";
    };
    calendar.el.parentNode.insertBefore(btn, calendar.el);
  }
}


function startEditBill(bill) {
  const name = prompt("Edit bill name:", bill.name);
  if (name === null) return;

  const amount = prompt("Edit amount:", bill.amount);
  if (amount === null) return;

  const due_day = prompt("Edit due day (1–28):", bill.due_day);
  if (due_day === null || isNaN(due_day) || due_day < 1 || due_day > 28) return;

  bill.name = name;
  bill.amount = parseFloat(amount).toFixed(2);
  bill.due_day = parseInt(due_day);

  localStorage.setItem("bills", JSON.stringify(bills));
  calendar.removeAllEvents();
  calendar.addEventSource(generateRecurringEvents());
  showBillsForDay(bill.due_day);
}

function deleteBill(id) {
  bills = bills.filter(b => b.id !== id);
  localStorage.setItem("bills", JSON.stringify(bills));
  calendar.removeAllEvents();
  calendar.addEventSource(generateRecurringEvents());
  selectedDayBills.innerHTML = "";
}
