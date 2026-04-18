import React from 'react';
import { useApp } from '../context/AppContext';
import { computeBalances, getCategoryMeta, fmt, CATEGORIES } from '../utils/helpers';
import styles from './BalancesTab.module.css';

export default function BalancesTab() {
  const { state, selectedGroup, groupExpenses } = useApp();

  if (!state.selectedGroupId || !selectedGroup) {
    return (
      <div className={styles.panel}>
        <div className={styles.noGroup}>
          <div className={styles.bigIcon}>⚖️</div>
          <h3>Select a Group First</h3>
          <p>Go to the Groups tab and click a group to view balances.</p>
        </div>
      </div>
    );
  }

  const balances = computeBalances(selectedGroup, groupExpenses);
  const totalSpent = groupExpenses.reduce((s, e) => s + e.amount, 0);

  const catTotals = {};
  groupExpenses.forEach((e) => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });
  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

  const memberPaid = {};
  selectedGroup.members.forEach((m) => (memberPaid[m] = 0));
  groupExpenses.forEach((e) => {
    memberPaid[e.paidBy] = (memberPaid[e.paidBy] || 0) + e.amount;
  });

  return (
    <div className={styles.grid}>
      {/* Left column */}
      <div className={styles.col}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Member Balances</span>
          </div>
          <div className={styles.balanceCards}>
            {selectedGroup.members.map((m) => {
              const bal = balances[m] || 0;
              const cls = bal > 0.01 ? 'positive' : bal < -0.01 ? 'negative' : 'zero';
              const label = bal > 0.01 ? 'gets back' : bal < -0.01 ? 'owes' : 'settled ✓';
              return (
                <div key={m} className={styles.balCard}>
                  <div className={styles.balAvatar}>
                    {m.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.balInfo}>
                    <div className={styles.balName}>{m}</div>
                    <div className={styles.balMeta}>
                      Paid ₹{fmt(memberPaid[m] || 0)} total
                    </div>
                  </div>
                  <div className={styles.balRight}>
                    <div className={`${styles.balAmount} ${styles[cls]}`}>
                      {bal < -0.01 ? '−' : bal > 0.01 ? '+' : ''}₹{fmt(Math.abs(bal))}
                    </div>
                    <div className={styles.balLabel}>{label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Group summary */}
        <div className={styles.panel} style={{ marginTop: 16 }}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Group Summary</span>
          </div>
          <div className={styles.summaryList}>
            <SummaryRow label="Total Expenses" value={`₹${fmt(totalSpent)}`} accent />
            <SummaryRow label="Number of Expenses" value={groupExpenses.length} />
            <SummaryRow label="Members" value={selectedGroup.members.length} />
            {selectedGroup.members.length > 0 && (
              <SummaryRow
                label="Avg per Person"
                value={`₹${fmt(totalSpent / selectedGroup.members.length)}`}
              />
            )}
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className={styles.col}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Spending by Category</span>
          </div>
          {sortedCats.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📊</div>
              <p>No expenses yet</p>
            </div>
          ) : (
            <div className={styles.catList}>
              {sortedCats.map(([cat, amt]) => {
                const meta = getCategoryMeta(cat);
                const pct = totalSpent ? (amt / totalSpent) * 100 : 0;
                return (
                  <div key={cat} className={styles.catRow}>
                    <div className={styles.catHeader}>
                      <div className={styles.catLeft}>
                        <span
                          className={styles.catDot}
                          style={{ background: meta.color }}
                        />
                        <span className={styles.catName}>
                          {meta.icon} {meta.label}
                        </span>
                      </div>
                      <div className={styles.catRight}>
                        <span className={styles.catAmt}>₹{fmt(amt)}</span>
                        <span className={styles.catPct}>{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className={styles.barBg}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${pct}%`, background: meta.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Member contribution chart */}
        {groupExpenses.length > 0 && (
          <div className={styles.panel} style={{ marginTop: 16 }}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Who Paid What</span>
            </div>
            <div className={styles.catList}>
              {Object.entries(memberPaid)
                .sort((a, b) => b[1] - a[1])
                .map(([name, amt]) => {
                  const pct = totalSpent ? (amt / totalSpent) * 100 : 0;
                  return (
                    <div key={name} className={styles.catRow}>
                      <div className={styles.catHeader}>
                        <div className={styles.catLeft}>
                          <div className={styles.miniAvatar}>
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <span className={styles.catName}>{name}</span>
                        </div>
                        <div className={styles.catRight}>
                          <span className={styles.catAmt}>₹{fmt(amt)}</span>
                          <span className={styles.catPct}>{pct.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className={styles.barBg}>
                        <div
                          className={styles.barFill}
                          style={{ width: `${pct}%`, background: 'var(--accent)' }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, accent }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid var(--border)',
        fontSize: 13,
      }}
    >
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <strong
        style={{
          fontFamily: 'var(--font-mono)',
          color: accent ? 'var(--accent)' : 'var(--text)',
          fontSize: accent ? 16 : 14,
        }}
      >
        {value}
      </strong>
    </div>
  );
}
