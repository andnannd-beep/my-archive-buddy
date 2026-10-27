# 🗂️ My Archive Buddy

A beginner-friendly, pastel-themed mini archive management system built with plain HTML, CSS, and vanilla JavaScript — no frameworks, no build tools, no dependencies.

---

## ✨ Features

- **Dashboard** — Live counts of total, active, inactive, and transferred archives
- **Add records** — Form with archive number, document title, category, date, and status
- **Edit & delete** — Inline edit mode and a confirmation dialog before deletion
- **Search & filter** — Filter by keyword (archive number or title), status, and category simultaneously
- **Persistent storage** — All data is saved in `localStorage`; records survive page refreshes
- **Sample data** — Five fictional records are pre-loaded on the very first visit
- **Validation** — Required-field checks and duplicate archive number detection with clear error messages
- **Safe rendering** — User-supplied data is always set via `textContent`, never injected through `innerHTML`
- **Responsive design** — Works on mobile, tablet, and desktop
- **Pastel UI** — Soft pink, lavender, light blue, and white colour palette

---

## 🗂️ Project Structure

```
my-archive-buddy/
├── index.html   — Page structure and semantic markup
├── style.css    — All styles (CSS custom properties, responsive layout)
├── script.js    — App logic (CRUD, localStorage, validation, DOM rendering)
└── README.md    — This file
```

---

## 🚀 How to Run

No installation or build step is required.

**Option 1 — Just open the file**

1. Download or clone this repository.
2. Double-click `index.html` to open it in your browser.

**Option 2 — Live Server (VS Code)**

1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.
2. Right-click `index.html` → **Open with Live Server**.

**Option 3 — Python simple server**

```bash
# Python 3
python -m http.server 8080
# then open http://localhost:8080 in your browser
```

---

## 🧪 How to Test the App

| Action | How |
|---|---|
| View sample data | Open `index.html` — five records are pre-loaded |
| Add a record | Fill in the form and click **Save Archive** |
| Edit a record | Click **✏️ Edit** on any row; the form pre-fills |
| Delete a record | Click **🗑️ Del** and confirm in the dialog |
| Search | Type in the search box (matches archive number or title) |
| Filter by status | Use the **All Statuses** dropdown |
| Filter by category | Use the **All Categories** dropdown |
| Check persistence | Add a record, refresh the page — it stays |
| Test validation | Submit the form with empty fields or a duplicate archive number |
| Clear all data | Run `localStorage.removeItem('archiveBuddyRecords')` in DevTools console, then refresh |

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Semantic page structure, native `<dialog>` element |
| CSS3 | Custom properties, Grid, Flexbox, responsive design |
| Vanilla JavaScript (ES6+) | App logic, DOM manipulation, localStorage API |

---

## 📁 Data Model

Each archive record is stored as a plain JavaScript object:

```json
{
  "id": "rec-1700000000000-1234",
  "archiveNumber": "ARC-2024-001",
  "docTitle": "Annual Budget Report",
  "category": "Finance",
  "docDate": "2024-01-15",
  "status": "Active"
}
```

Records are stored as a JSON array under the `localStorage` key `archiveBuddyRecords`.

---

## 🎨 Colour Palette

| Name | Hex |
|---|---|
| Pink | `#f9c6d0` |
| Lavender | `#d9c8f5` |
| Light Blue | `#b8dcf8` |
| Mint | `#b8eede` |
| Background | `#fdf6fb` |

---

Made with 💖 — beginner-friendly and dependency-free.
