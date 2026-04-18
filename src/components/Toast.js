import React from 'react';
import styles from './Toast.module.css';

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles.toast} ${styles[t.type]}`}
          onClick={() => onRemove(t.id)}
        >
          <span className={styles.icon}>
            {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span className={styles.message}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
