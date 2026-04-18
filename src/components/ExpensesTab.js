import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getCategoryMeta, fmt, fmtDate } from '../utils/helpers';
import AddExpenseModal from './AddExpenseModal';
import styles from './ExpensesTab.module.css';

export default function ExpensesTab({ toast }) {
  const { state, selectedGroup, groupExpenses, dispatch } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [filterCat, setFilterCat] = useState('all');

  if (!state.selectedGroupId || !selectedGroup) {
    return (
      <div className={styles.panel}>
        <div className={styles.noGroup}>
          <div className={styles.bigIcon}>👥</div>
          <h3>Select a Group First</h3>
          <p>Go to the Groups tab and click a group to view its expenses.</p>
        </div>
      </div>
    );
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this expense?')) return;
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
    toast('Expense deleted', 'success');
  };

  const sorted = [...groupExpenses].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const usedCats = [...new Set(groupExpenses.map((e) => e.category))];
  const filtered =
    filterCat === 'all' ? sorted : sorted.filter((e) => e.category === filterCat);

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.panelTitle}>Expenses</span>
            <span className={styles.groupName}>{selectedGroup.name}</span>
          </div>
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            + Add Expense
          </button>
        </div>

        {/* Filter bar */}
        {groupExpenses.length > 0 && (
          <div className={styles.filterBar}>
            <button
              className={filterCat === 'all' ? styles.filterActive : styles.filterBtn}
              onClick={() => setFilterCat('all')}
            >
              All ({groupExpenses.length})
            </button>
            {usedCats.map((cat) => {
              const meta = getCategoryMeta(cat);
              const count = groupExpenses.filter((e) => e.category === cat).length;
              return (
                <button
                  key={cat}
                  className={filterCat === cat ? styles.filterActive : styles.filterBtn}
                  onClick={() => setFilterCat(cat)}
                >
                  {meta.icon} {meta.label} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Summary row */}
        {filtered.length > 0 && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryText}>
              {filtered.length} expense{filtered.length !== 1 ? 's' : ''}
            </span>
            <span className={styles.summaryTotal}>₹{fmt(totalFiltered)}</span>
          </div>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🧾</div>
            <p>{groupExpenses.length === 0 ? 'No expenses yet. Add one!' : 'No expenses in this category.'}</p>
          </div>
        ) : (
          <div className={styles.list}>
            {filtered.map((e) => (
              <ExpenseItem key={e.id} expense={e} onDelete={() => handleDelete(e.id)} />
            ))}
          </div>
        )}
      </div>

      <AddExpenseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        toast={toast}
      />
    </div>
  );
}

function ExpenseItem({ expense, onDelete }) {
  const meta = getCategoryMeta(expense.category);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.item}>
      <div
        className={styles.catIcon}
        style={{ background: meta.color + '22' }}
      >
        {meta.icon}
      </div>

      <div className={styles.info} onClick={() => setExpanded((p) => !p)}>
        <div className={styles.desc}>{expense.description}</div>
        <div className={styles.meta}>
          Paid by <strong>{expense.paidBy}</strong> · {fmtDate(expense.date)} ·{' '}
          <span className={styles.splitBadge}>{expense.splitType}</span> ·{' '}
          {expense.participants.length} people
        </div>
        {expanded && (
          <div className={styles.splitDetail}>
            {Object.entries(expense.splits)
              .filter(([, v]) => v > 0)
              .map(([person, share]) => (
                <span key={person} className={styles.splitChip}>
                  {person}: ₹{fmt(share)}
                </span>
              ))}
          </div>
        )}
      </div>

      <div className={styles.right}>
        <div className={styles.amount}>₹{fmt(expense.amount)}</div>
        <div className={styles.actions}>
          <button
            className={styles.expandBtn}
            onClick={() => setExpanded((p) => !p)}
            title={expanded ? 'Collapse' : 'Show split details'}
          >
            {expanded ? '▲' : '▼'}
          </button>
          <button className={styles.deleteBtn} onClick={onDelete} title="Delete">
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}
