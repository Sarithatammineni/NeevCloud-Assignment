import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useToast } from './hooks/useToast';
import Header from './components/Header';
import Tabs from './components/Tabs';
import GroupsTab from './components/GroupsTab';
import ExpensesTab from './components/ExpensesTab';
import BalancesTab from './components/BalancesTab';
import SettleTab from './components/SettleTab';
import ToastContainer from './components/Toast';
import styles from './App.module.css';

function AppInner() {
  const { state } = useApp();
  const { toasts, addToast, removeToast } = useToast();

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <Header />
        <Tabs />

        {state.activeTab === 'groups'   && <GroupsTab   toast={addToast} />}
        {state.activeTab === 'expenses' && <ExpensesTab toast={addToast} />}
        {state.activeTab === 'balances' && <BalancesTab />}
        {state.activeTab === 'settle'   && <SettleTab   toast={addToast} />}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
