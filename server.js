const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3223;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET all bills
app.get('/api/bills', (req, res) => {
  const bills = JSON.parse(fs.readFileSync('bills.json', 'utf-8'));
  res.json(bills);
});

// POST new bill
app.post('/api/bills', (req, res) => {
  const bills = JSON.parse(fs.readFileSync('bills.json', 'utf-8'));
const newBill = { id: Date.now().toString(), ...req.body };
bills.push(newBill);
  fs.writeFileSync('bills.json', JSON.stringify(bills, null, 2));
  res.status(201).json(req.body);
});

// PUT (Edit a bill)
app.put('/api/bills/:id', (req, res) => {
  let bills = JSON.parse(fs.readFileSync('bills.json', 'utf-8'));
  const index = bills.findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Bill not found' });

  bills[index] = { ...bills[index], ...req.body };
  fs.writeFileSync('bills.json', JSON.stringify(bills, null, 2));
  res.json(bills[index]);
});

// DELETE (Remove a bill)
app.delete('/api/bills/:id', (req, res) => {
  let bills = JSON.parse(fs.readFileSync('bills.json', 'utf-8'));
  const index = bills.findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Bill not found' });

  const deleted = bills.splice(index, 1)[0];
  fs.writeFileSync('bills.json', JSON.stringify(bills, null, 2));
  res.json(deleted);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
