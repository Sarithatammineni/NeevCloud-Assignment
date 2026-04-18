export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);


export const fmt = (n) =>
  (Math.round((n || 0) * 100) / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const capitalize = (s) =>
  String(s).charAt(0).toUpperCase() + String(s).slice(1);

export const CATEGORIES = [
  { value: 'food',          label: 'Food',          icon: '🍔', color: '#ffc44d' },
  { value: 'travel',        label: 'Travel',        icon: '✈️', color: '#4d99ff' },
  { value: 'rent',          label: 'Rent',          icon: '🏠', color: '#c47cff' },
  { value: 'utilities',     label: 'Utilities',     icon: '⚡', color: '#7cffd4' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#ff7c5c' },
  { value: 'shopping',      label: 'Shopping',      icon: '🛍️', color: '#ff9f4d' },
  { value: 'health',        label: 'Health',        icon: '💊', color: '#4dffb0' },
  { value: 'other',         label: 'Other',         icon: '📦', color: '#6b7591' },
];

export const getCategoryMeta = (value) =>
  CATEGORIES.find((c) => c.value === value) || CATEGORIES[CATEGORIES.length - 1];

export const computeBalances = (group, expenses) => {
  const balances = {};
  group.members.forEach((m) => (balances[m] = 0));

  expenses
    .filter((e) => e.groupId === group.id)
    .forEach((e) => {
      balances[e.paidBy] = (balances[e.paidBy] || 0) + e.amount;
      Object.entries(e.splits).forEach(([person, share]) => {
        balances[person] = (balances[person] || 0) - share;
      });
    });

  return balances;
};
export const minimizeTransactions = (balances) => {
  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([person, bal]) => {
    if (bal < -0.01) debtors.push({ person, amount: -bal });
    else if (bal > 0.01) creditors.push({ person, amount: bal });
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0,
    j = 0;

  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    transactions.push({
      from: debtors[i].person,
      to: creditors[j].person,
      amount: pay,
    });
    debtors[i].amount -= pay;
    creditors[j].amount -= pay;
    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return transactions;
};
export const todayISO = () => new Date().toISOString().split('T')[0];
export const validateSplits = (splits, total, splitType) => {
  const values = Object.values(splits).map(Number);
  const sum = values.reduce((a, b) => a + b, 0);
  if (splitType === 'exact') {
    return Math.abs(sum - total) < 0.01
      ? null
      : `Splits (₹${fmt(sum)}) must equal total (₹${fmt(total)})`;
  }
  if (splitType === 'percent') {
    return Math.abs(sum - 100) < 0.01
      ? null
      : `Percentages must sum to 100% (currently ${sum.toFixed(1)}%)`;
  }
  return null;
};
