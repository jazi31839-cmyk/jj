const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/eventSchedulerDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Define Event Schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: String, required: true },
  time: { type: String, required: true },
  datetime: { type: Date, required: true }
});

const Event = mongoose.model('Event', eventSchema);

// ✅ Get all events
app.get('/api/events', async (req, res) => {
  const events = await Event.find().sort({ datetime: 1 });
  res.json(events);
});

// ✅ Add a new event
app.post('/api/events', async (req, res) => {
  const { title, date, time, description } = req.body;
  if (!title || !date || !time) {
    return res.status(400).json({ error: 'title, date and time are required' });
  }

  const datetime = new Date(`${date}T${time}`);
  const newEvent = new Event({ title, description, date, time, datetime });

  try {
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save event' });
  }
});

// ✅ Delete an event
app.delete('/api/events/:id', async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ error: 'Event not found' });
    res.json(deletedEvent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
