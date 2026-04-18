import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, todayISO, validateSplits, fmt } from '../utils/helpers';
import Modal from './Modal';
import styles from './AddExpenseModal.module.css';

const SPLIT_TYPES = [
  { id: 'equal',   label: 'Equal' },
  { id: 'exact',   label: 'Exact' },
  { id: 'percent', label: 'Percent' },
];

export default function AddExpenseModal({ open, onClose, toast }) {
  const { state, selectedGroup, dispatch } = useApp();

  const [desc, setDesc]         = useState('');
  const [amount, setAmount]     = useState('');
  const [paidBy, setPaidBy]     = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate]         = useState(todayISO());
  const [splitType, setSplitType] = useState('equal');
  const [splits, setSplits]     = useState({});
  const [checkedMembers, setCheckedMembers] = useState({});
  const [splitError, setSplitError] = useState('');


  useEffect(() => {
    if (open && selectedGroup) {
      setDesc('');
      setAmount('');
      setCategory('food');
      setDate(todayISO());
      setSplitType('equal');
      setSplitError('');
      const initial = {};
      const checked = {};
      selectedGroup.members.forEach((m) => {
        initial[m] = '';
        checked[m] = true;
      });
      setSplits(initial);
      setCheckedMembers(checked);
      setPaidBy(selectedGroup.members[0] || '');
    }
  }, [open, selectedGroup]);

  useEffect(() => {
    if (splitType === 'equal') {
      recalcEqual();
    }
  }, [amount, checkedMembers, splitType]); 

  const recalcEqual = () => {
    if (!selectedGroup) return;
    const checked = selectedGroup.members.filter((m) => checkedMembers[m]);
    const share = checked.length > 0 ? parseFloat(amount) / checked.length : 0;
    const newSplits = {};
    selectedGroup.members.forEach((m) => {
      newSplits[m] = checkedMembers[m] ? share : 0;
    });
    setSplits(newSplits);
  };

  const handleSplitChange = (member, value) => {
    const updated = { ...splits, [member]: value };
    setSplits(updated);
    const numericSplits = {};
    Object.entries(updated).forEach(([k, v]) => (numericSplits[k] = parseFloat(v) || 0));
    const err = validateSplits(numericSplits, parseFloat(amount) || 0, splitType);
    setSplitError(err || '');
  };

  const handleSubmit = () => {
    if (!desc.trim()) { toast('Enter a description', 'error'); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast('Enter a valid amount', 'error'); return; }
    if (!date) { toast('Pick a date', 'error'); return; }
    if (!paidBy) { toast('Select who paid', 'error'); return; }

    let finalSplits = {};

    if (splitType === 'equal') {
      const checked = selectedGroup.members.filter((m) => checkedMembers[m]);
      if (!checked.length) { toast('Select at least one person', 'error'); return; }
      const share = amt / checked.length;
      checked.forEach((m) => (finalSplits[m] = share));
    } else if (splitType === 'exact') {
      const numSplits = {};
      Object.entries(splits).forEach(([k, v]) => (numSplits[k] = parseFloat(v) || 0));
      const err = validateSplits(numSplits, amt, 'exact');
      if (err) { toast(err, 'error'); return; }
      finalSplits = numSplits;
    } else {
      const numSplits = {};
      Object.entries(splits).forEach(([k, v]) => (numSplits[k] = parseFloat(v) || 0));
      const err = validateSplits(numSplits, amt, 'percent');
      if (err) { toast(err, 'error'); return; }
      Object.entries(numSplits).forEach(([k, v]) => (finalSplits[k] = (v / 100) * amt));
    }

    dispatch({
      type: 'ADD_EXPENSE',
      payload: {
        groupId: state.selectedGroupId,
        description: desc.trim(),
        amount: amt,
        paidBy,
        category,
        date,
        splitType,
        splits: finalSplits,
      },
    });

    onClose();
    toast('Expense added!', 'success');
  };

  if (!selectedGroup) return null;

  return (
    <Modal open={open} onClose={onClose} title="Add Expense">
      <div className={styles.row2}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. Dinner at Charminar"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            autoFocus
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Amount (₹)</label>
          <input
            className={styles.input}
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      <div className={`${styles.row2} ${styles.mt12}`}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Paid By</label>
          <select
            className={styles.input}
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          >
            {selectedGroup.members.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Category</label>
          <select
            className={styles.input}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={`${styles.formGroup} ${styles.mt12}`}>
        <label className={styles.label}>Date</label>
        <input
          className={styles.input}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className={styles.divider} />

      <label className={styles.label}>Split Method</label>
      <div className={styles.splitToggle}>
        {SPLIT_TYPES.map((t) => (
          <button
            key={t.id}
            className={splitType === t.id ? styles.splitActive : styles.splitBtn}
            onClick={() => setSplitType(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.splitList}>
        {splitType === 'equal' &&
          selectedGroup.members.map((m) => (
            <div key={m} className={styles.splitItem}>
              <input
                type="checkbox"
                checked={!!checkedMembers[m]}
                onChange={(e) =>
                  setCheckedMembers((prev) => ({ ...prev, [m]: e.target.checked }))
                }
                id={`check-${m}`}
              />
              <label htmlFor={`check-${m}`} className={styles.splitName}>{m}</label>
              <span className={styles.splitAmt}>
                {checkedMembers[m] ? `₹${fmt(splits[m] || 0)}` : '—'}
              </span>
            </div>
          ))}

        {splitType === 'exact' &&
          selectedGroup.members.map((m) => (
            <div key={m} className={styles.splitItem}>
              <label className={styles.splitName}>{m}</label>
              <input
                className={styles.splitInput}
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={splits[m] || ''}
                onChange={(e) => handleSplitChange(m, e.target.value)}
              />
            </div>
          ))}

        {splitType === 'percent' &&
          selectedGroup.members.map((m) => (
            <div key={m} className={styles.splitItem}>
              <label className={styles.splitName}>{m}</label>
              <input
                className={styles.splitInput}
                type="number"
                placeholder="0"
                min="0"
                max="100"
                step="0.1"
                value={splits[m] || ''}
                onChange={(e) => handleSplitChange(m, e.target.value)}
              />
              <span className={styles.pctLabel}>%</span>
            </div>
          ))}
      </div>

      {splitError && <p className={styles.splitError}>{splitError}</p>}

      <div className={styles.actions}>
        <button className="btn-secondary btn-full" onClick={onClose}>Cancel</button>
        <button className="btn-primary btn-full" onClick={handleSubmit}>Add Expense</button>
      </div>
    </Modal>
  );
}
