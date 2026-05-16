import { useState } from "react";
import { loadPayments, clearPayments, type PaymentRecord } from "../utils/storage";
import styles from "./HistoryPage.module.css";

export default function HistoryPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>(loadPayments);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = () => {
    clearPayments();
    setPayments([]);
    setConfirmClear(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>History</h1>
          <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 4 }}>
            {payments.length} transaction{payments.length !== 1 ? "s" : ""} stored locally
          </p>
        </div>
        {payments.length > 0 && (
          confirmClear ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-danger" onClick={handleClear} style={{ fontSize: 13, padding: "8px 14px" }}>Confirm clear</button>
              <button className="btn btn-ghost" onClick={() => setConfirmClear(false)} style={{ fontSize: 13 }}>Cancel</button>
            </div>
          ) : (
            <button className="btn btn-ghost" onClick={() => setConfirmClear(true)} style={{ fontSize: 13, color: "var(--text-3)" }}>
              Clear all
            </button>
          )
        )}
      </div>

      {payments.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>◷</span>
          <h3>No transactions yet</h3>
          <p>Your sent payments will appear here.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {payments.map((p) => (
            <PaymentRow key={p.id} payment={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentRow({ payment: p }: { payment: PaymentRecord }) {
  const date = new Date(p.timestamp);
  const dateStr = date.toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={styles.row}>
      <div className={styles.rowLeft}>
        <div className={`${styles.rowIcon} ${p.status === "success" ? styles.rowIconSuccess : styles.rowIconFail}`}>
          {p.status === "success" ? "↑" : "✕"}
        </div>
        <div className={styles.rowInfo}>
          <div className={styles.rowTo}>
            {p.toLabel ? (
              <><span style={{ color: "var(--text-1)", fontWeight: 600 }}>{p.toLabel}</span>
              <span style={{ color: "var(--text-3)", fontSize: 12, marginLeft: 6 }}>{p.to.slice(0, 8)}…</span></>
            ) : (
              <span className="mono" style={{ fontSize: 13 }}>{p.to.slice(0, 10)}…{p.to.slice(-6)}</span>
            )}
          </div>
          {p.memo && <div className={styles.rowMemo}>"{p.memo}"</div>}
          <div className={styles.rowMeta}>
            <span>{dateStr} · {timeStr}</span>
          </div>
        </div>
      </div>
      <div className={styles.rowRight}>
        <div className={styles.rowAmount}>−{p.amount} <span style={{ fontSize: 11, color: "var(--text-2)" }}>USDC</span></div>
        <a href={p.explorerUrl} target="_blank" rel="noreferrer" className={styles.rowExplorer}>
          View ↗
        </a>
      </div>
    </div>
  );
}
