import React from 'react';
import { useApp } from '../context/AppContext';
import { fmt } from '../utils/helpers';
import styles from './Header.module.css';

export default function Header() {
  const { state, totalExpenses } = useApp();

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>💸</div>
        <div className={styles.logoText}>
          Split<span>Wise</span>
        </div>
      </div>
      <div className={styles.stats}>
        <Stat label="Groups" value={state.groups.length} />
        <Stat label="Expenses" value={state.expenses.length} />
        <Stat label="Total Spent" value={`₹${fmt(totalExpenses)}`} mono />
      </div>
    </header>
  );
}

function Stat({ label, value, mono }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <strong className={mono ? styles.statValueMono : styles.statValue}>
        {value}
      </strong>
    </div>
  );
}
