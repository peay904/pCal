const calendarEl = document.getElementById('calendar');
const calendar = new FullCalendar.Calendar(calendarEl, {
  initialView: 'dayGridMonth',
  events: info => {
    return fetch('/api/bills?start=' + info.startStr + '&end=' + info.endStr)
      .then(r => r.json())
      .then(bills => {
        return bills.flatMap(b => {
          const events = [];
          const start = new Date(info.start);
          const end = new Date(info.end);
          for(let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
            events.push({
              title: `${b.name} – $${b.amount}`,
              start: new Date(d.getFullYear(), d.getMonth(), b.due_day).toISOString().split('T')[0]
            });
          }
          return events;
        });
      });
  }
});
calendar.render();

// Form submission handler
document.getElementById('billForm').addEventListener('submit', e => {
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(e.target));
  fetch('/api/bills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fd)
  }).then(() => {
    calendar.refetchEvents(); // refresh calendar :contentReference[oaicite:13]{index=13}
    e.target.reset();
  });
});

function loadBills() {
  fetch('/api/bills')
    .then(res => res.json())
    .then(bills => {
      const billList = document.getElementById('billList');
      billList.innerHTML = '';
      bills.forEach(b => {
        const div = document.createElement('div');
        div.innerHTML = `
          ${b.name} - $${b.amount} due on day ${b.due_day}
          <button onclick="deleteBill('${b.id}')">Delete</button>
          <button onclick="editBill('${b.id}')">Edit</button>
        `;
        billList.appendChild(div);
      });
    });
}

function deleteBill(id) {
  fetch(`/api/bills/${id}`, { method: 'DELETE' })
    .then(() => {
      loadBills();
      calendar.refetchEvents();
    });
}

function editBill(id) {
  const newName = prompt("New bill name:");
  const newAmount = prompt("New amount:");
  const newDay = prompt("New due day (1–28):");
  fetch(`/api/bills/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName, amount: newAmount, due_day: newDay })
  })
    .then(() => {
      loadBills();
      calendar.refetchEvents();
    });
}

// Load bills when the page is ready
document.addEventListener('DOMContentLoaded', () => {
  loadBills();
});

function renderBills(bills) {
  const billList = document.getElementById('billList');
  billList.innerHTML = '';

  bills.forEach(bill => {
    const billDiv = document.createElement('div');
    billDiv.className = 'bill-item';
    
    billDiv.innerHTML = `
      <div class="bill-content">
        <div class="bill-details">
          <strong>${bill.name}</strong> - $${bill.amount} (Due: ${bill.due_day})
        </div>
        <div class="bill-actions">
          <button class="btn btn-edit" onclick="toggleEdit('${bill.id}')">Edit</button>
          <button class="btn btn-delete" onclick="deleteBill('${bill.id}')">Delete</button>
        </div>
      </div>
      <form class="edit-form" id="edit-${bill.id}">
        <input name="name" value="${bill.name}" placeholder="Bill Name" required/>
        <input name="due_day" type="number" value="${bill.due_day}" min="1" max="28" placeholder="Day" required/>
        <input name="amount" type="number" step="0.01" value="${bill.amount}" placeholder="Amount" required/>
        <div class="bill-actions">
          <button type="submit" class="btn btn-save">Save</button>
          <button type="button" class="btn btn-cancel" onclick="toggleEdit('${bill.id}')">Cancel</button>
        </div>
      </form>
    `;

    const editForm = billDiv.querySelector(`#edit-${bill.id}`);
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(editForm);
      const updatedBill = {
        id: bill.id,
        name: formData.get('name'),
        due_day: parseInt(formData.get('due_day')),
        amount: parseFloat(formData.get('amount'))
      };
      updateBill(updatedBill);
      toggleEdit(bill.id);
    });

    billList.appendChild(billDiv);
  });
}

function toggleEdit(billId) {
  const editForm = document.getElementById(`edit-${billId}`);
  editForm.classList.toggle('active');
}

function updateBill(updatedBill) {
  const bills = JSON.parse(localStorage.getItem('bills') || '[]');
  const index = bills.findIndex(b => b.id === updatedBill.id);
  if (index !== -1) {
    bills[index] = updatedBill;
    localStorage.setItem('bills', JSON.stringify(bills));
    renderBills(bills);
    calendar.refetchEvents();
  }
}

