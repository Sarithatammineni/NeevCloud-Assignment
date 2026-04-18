import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { computeBalances, minimizeTransactions, fmt } from '../utils/helpers';
import styles from './SettleTab.module.css';

export default function SettleTab({ toast }) {
  const { state, selectedGroup, groupExpenses, dispatch } = useApp();
  const [settled, setSettled] = useState({});

  if (!state.selectedGroupId || !selectedGroup) {
    return (
      <div className={styles.panel}>
        <div className={styles.noGroup}>
          <div className={styles.bigIcon}>✅</div>
          <h3>Select a Group First</h3>
          <p>Go to the Groups tab and click a group to see settlement suggestions.</p>
        </div>
      </div>
    );
  }

  const balances = computeBalances(selectedGroup, groupExpenses);
  const transactions = minimizeTransactions(balances);

  const allZero = Object.values(balances).every((b) => Math.abs(b) < 0.01);

  const handleMarkSettled = (idx) => {
    setSettled((prev) => ({ ...prev, [idx]: !prev[idx] }));
    toast('Marked as settled!', 'success');
  };

  return (
    <div>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.panelTitle}>Settle Up</span>
            <p className={styles.subtitle}>
              Minimum transactions to clear all debts in{' '}
              <strong style={{ color: 'var(--accent)' }}>{selectedGroup.name}</strong>
            </p>
          </div>
        </div>

        {/* Balance overview pills */}
        <div className={styles.balancePills}>
          {Object.entries(balances).map(([name, bal]) => (
            <div
              key={name}
              className={`${styles.pill} ${
                bal > 0.01
                  ? styles.pillPositive
                  : bal < -0.01
                  ? styles.pillNegative
                  : styles.pillZero
              }`}
            >
              <span className={styles.pillName}>{name}</span>
              <span className={styles.pillBal}>
                {bal > 0.01 ? '+' : ''}₹{fmt(bal)}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.divider} />

        {allZero || transactions.length === 0 ? (
          <div className={styles.settled}>
            <div className={styles.settledIcon}>🎉</div>
            <h3>All Settled!</h3>
            <p>No outstanding debts in this group.</p>
          </div>
        ) : (
          <>
            <div className={styles.txnHeader}>
              <span className={styles.txnCount}>
                {transactions.length} payment{transactions.length !== 1 ? 's' : ''} needed
              </span>
            </div>
            <div className={styles.list}>
              {transactions.map((txn, idx) => (
                <TransactionCard
                  key={idx}
                  txn={txn}
                  isSettled={!!settled[idx]}
                  onMark={() => handleMarkSettled(idx)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Detailed balances table */}
      <div className={styles.panel} style={{ marginTop: 18 }}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Detailed Balance Sheet</span>
        </div>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Member</span>
            <span>Paid</span>
            <span>Owes</span>
            <span>Net</span>
          </div>
          {selectedGroup.members.map((m) => {
            const paid = groupExpenses
              .filter((e) => e.paidBy === m)
              .reduce((s, e) => s + e.amount, 0);
            const owes = groupExpenses
              .reduce((s, e) => s + (e.splits[m] || 0), 0);
            const net = balances[m] || 0;
            return (
              <div key={m} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <div className={styles.avatar}>{m.charAt(0).toUpperCase()}</div>
                  <span className={styles.memberName}>{m}</span>
                </div>
                <div className={`${styles.tableCell} ${styles.mono}`}>₹{fmt(paid)}</div>
                <div className={`${styles.tableCell} ${styles.mono}`}>₹{fmt(owes)}</div>
                <div className={`${styles.tableCell} ${styles.mono} ${
                  net > 0.01 ? styles.pos : net < -0.01 ? styles.neg : styles.zer
                }`}>
                  {net > 0.01 ? '+' : ''}₹{fmt(net)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TransactionCard({ txn, isSettled, onMark }) {
  return (
    <div className={`${styles.txnCard} ${isSettled ? styles.txnSettled : ''}`}>
      <div className={styles.txnFrom}>
        <div className={styles.txnAvatar} style={{ background: 'rgba(255,77,109,0.15)', color: 'var(--danger)' }}>
          {txn.from.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className={styles.txnName}>{txn.from}</div>
          <div className={styles.txnRole}>pays</div>
        </div>
      </div>

      <div className={styles.txnArrow}>
        <div className={styles.txnAmount}>₹{fmt(txn.amount)}</div>
        <div className={styles.arrowLine}>
          <div className={styles.arrowDot} />
          <div className={styles.arrowTrack} />
          <div className={styles.arrowHead}>→</div>
        </div>
      </div>

      <div className={styles.txnTo}>
        <div className={styles.txnAvatar} style={{ background: 'rgba(77,255,176,0.15)', color: 'var(--success)' }}>
          {txn.to.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className={styles.txnName}>{txn.to}</div>
          <div className={styles.txnRole}>receives</div>
        </div>
      </div>

      <button
        className={isSettled ? styles.settleBtn : styles.markBtn}
        onClick={onMark}
      >
        {isSettled ? '✓ Settled' : 'Mark Settled'}
      </button>
    </div>
  );
}
