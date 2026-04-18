# 💸 SplitWise — Smart Expense Splitter

A lightweight, production-ready expense splitting web app built with React. Split bills effortlessly among friends, roommates, or teams.

---

## ✨ Features

- **Group Management** — Create groups, add members, delete groups
- **Expense Tracking** — Add expenses with description, amount, payer, category, and date
- **3 Split Modes** — Equal, Exact amount, or Percentage split
- **Real-time Balances** — See who owes whom at a glance
- **Minimum Settlements** — Greedy algorithm computes fewest payments to settle all debts
- **Category Breakdown** — Spending by Food, Travel, Rent, Utilities, Entertainment, etc.
- **Who Paid What** — Bar chart showing each member's payment contribution
- **Detailed Balance Sheet** — Full table of paid / owes / net per member
- **Persistent Storage** — All data saved to `localStorage` (survives page refresh)
- **Filter by Category** — Filter expense list by category
- **Expandable Expense Details** — Click to reveal split breakdown per person
- **Responsive UI** — Works on mobile and desktop

---

## 🗂 Project Structure

```
splitwise/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.js / .module.css       # Top nav with stats
│   │   ├── Tabs.js / .module.css         # Tab navigation
│   │   ├── GroupsTab.js / .module.css    # Groups list + create modal
│   │   ├── ExpensesTab.js / .module.css  # Expenses list + filter
│   │   ├── BalancesTab.js / .module.css  # Member balances + category chart
│   │   ├── SettleTab.js / .module.css    # Settlement suggestions + balance sheet
│   │   ├── AddExpenseModal.js / .module.css  # Add expense form
│   │   ├── Modal.js / .module.css        # Reusable modal wrapper
│   │   └── Toast.js / .module.css        # Toast notifications
│   ├── context/
│   │   └── AppContext.js                 # Global state (useReducer + Context API)
│   ├── hooks/
│   │   └── useToast.js                   # Toast hook
│   ├── utils/
│   │   └── helpers.js                    # Formatting, balance math, settlement algo
│   ├── App.js                            # Root component
│   ├── App.module.css
│   ├── index.js                          # Entry point
│   └── index.css                         # Global styles + CSS variables
├── package.json
└── README.md
```

---

## 🏗 Architecture

### State Management
Uses React's built-in `useReducer` + `Context API` — no Redux needed.

- **`AppContext`** holds all state: `groups`, `expenses`, `selectedGroupId`, `activeTab`
- Actions: `ADD_GROUP`, `DELETE_GROUP`, `ADD_EXPENSE`, `DELETE_EXPENSE`, `SELECT_GROUP`, `SET_TAB`, `LOAD_STATE`
- State is persisted to `localStorage` on every change and loaded on mount

### Balance Algorithm
1. For each expense, the payer's balance is **credited** the full amount
2. Each participant's balance is **debited** their share
3. Net balance = `total paid − total owed`

### Settlement Algorithm (Minimum Transactions)
Greedy approach:
1. Split members into **debtors** (negative balance) and **creditors** (positive balance)
2. Sort both by amount descending
3. Greedily match largest debtor to largest creditor, settling the minimum of the two
4. Results in ≤ N−1 transactions for N members

### Styling
- CSS Modules for component-scoped styles
- CSS Variables (`:root`) for consistent theming
- `Syne` (display) + `DM Mono` (monospace) fonts from Google Fonts
- Dark theme with a subtle grid background

---

## 🚀 Setup & Running Locally

### Prerequisites
- Node.js ≥ 16
- npm ≥ 8

### Install & Start

```bash
# Clone or unzip the project
cd splitwise

# Install dependencies
npm install

# Start development server
npm start
```

The app runs at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

Output is in the `build/` folder — ready to deploy.

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) for automatic deploys.

### Netlify

```bash
npm run build
# Drag the build/ folder to netlify.com/drop
```

Or via CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

---

## 🧪 Example Usage

1. **Create a group** → "Goa Trip" with members: Alice, Bob, Charlie
2. **Add an expense** → "Hotel" ₹6000, paid by Alice, split equally → each owes ₹2000
3. **Add another** → "Dinner" ₹1500, paid by Bob, split equally → each owes ₹500
4. **View Balances** → Alice gets back ₹4000, Bob gets back ₹500, Charlie owes ₹4500
5. **Settle Up** → Charlie pays Alice ₹4000, Charlie pays Bob ₹500

---

## 📄 License

MIT — free to use and modify.
