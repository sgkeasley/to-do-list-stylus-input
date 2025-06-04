# 📝 TodoNotes — To-Do List with Handwritten Notes

**TodoNotes** is a modern to-do list app built for both keyboard warriors and stylus lovers. It supports both traditional text input and stylus/drawing input for adding tasks — and yes, it works offline too, thanks to full Progressive Web App (PWA) support.

---

## 🚀 Features

- ✅ Add tasks with **typed text** or **handwritten notes**
- ✍️ Touch/stylus-friendly canvas for drawing tasks
- 📦 Saves tasks using `localStorage`
- 🌐 **Offline support** via Service Worker
- 📱 PWA installable on mobile and desktop
- 🌓 Sleek, minimalist UI with responsive layout

---

## 🛠️ Tech Stack

- HTML5, CSS3, JavaScript (Vanilla)
- Service Workers (for offline support)
- Canvas API (for drawing input)
- Manifest & Icons (PWA compliance)

---

## 🧠 How It Works

- Typed tasks are stored and rendered as text.
- Handwritten tasks are drawn on a canvas, saved as PNG images, and displayed in your list.
- Tasks persist using `localStorage` so they survive refreshes.
- When offline, all functionality still works — thanks to Service Worker caching.

---

## 📲 Installation

### Option 1: Clone and Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/TodoNotes.git
cd TodoNotes
open index.html  # or use Live Server in VS Code
