import React from 'react';
import { useApp } from '../context/AppContext';
import styles from './Tabs.module.css';

const TABS = [
  { id: 'groups',   label: '👥 Groups' },
  { id: 'expenses', label: '💰 Expenses' },
  { id: 'balances', label: '⚖️ Balances' },
  { id: 'settle',   label: '✅ Settle Up' },
];

export default function Tabs() {
  const { state, dispatch } = useApp();

  return (
    <div className={styles.tabs}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${state.activeTab === tab.id ? styles.active : ''}`}
          onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
