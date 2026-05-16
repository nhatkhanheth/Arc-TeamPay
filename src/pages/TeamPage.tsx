import { useState } from "react";
import { loadMembers, saveMembers, type TeamMember } from "../utils/storage";
import styles from "./TeamPage.module.css";

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(loadMembers);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", address: "", role: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState("");

  const persist = (next: TeamMember[]) => {
    setMembers(next);
    saveMembers(next);
  };

  const handleAdd = () => {
    setError("");
    if (!form.label.trim()) return setError("Name is required.");
    if (!/^0x[0-9a-fA-F]{40}$/.test(form.address)) return setError("Invalid EVM address.");
    if (members.some((m) => m.address.toLowerCase() === form.address.toLowerCase())) {
      return setError("Address already in team.");
    }
    persist([...members, { label: form.label.trim(), address: form.address, role: form.role.trim() || undefined }]);
    setForm({ label: "", address: "", role: "" });
    setShowAdd(false);
  };

  const handleDelete = (address: string) => {
    persist(members.filter((m) => m.address !== address));
  };

  const handleEdit = (m: TeamMember) => {
    setEditing(m.address);
    setForm({ label: m.label, address: m.address, role: m.role ?? "" });
  };

  const handleSaveEdit = () => {
    setError("");
    if (!form.label.trim()) return setError("Name is required.");
    persist(members.map((m) => m.address === editing
      ? { ...m, label: form.label.trim(), role: form.role.trim() || undefined }
      : m
    ));
    setEditing(null);
    setForm({ label: "", address: "", role: "" });
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Team</h1>
          <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 4 }}>
            {members.length} member{members.length !== 1 ? "s" : ""} · saved locally
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowAdd(true); setEditing(null); }} style={{ padding: "9px 18px", fontSize: 13 }}>
          + Add Member
        </button>
      </div>

      {/* Add / Edit form */}
      {(showAdd || editing) && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            {editing ? "Edit Member" : "Add Member"}
          </h3>
          <div style={{ display: "grid", gap: 14 }}>
            <div className="input-group">
              <label className="input-label">Name</label>
              <input className="input" placeholder="e.g. Khanh, Treasury" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
            {!editing && (
              <div className="input-group">
                <label className="input-label">Wallet Address</label>
                <input className="input" placeholder="0x..." value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} spellCheck={false} />
              </div>
            )}
            <div className="input-group">
              <label className="input-label">Role <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(optional)</span></label>
              <input className="input" placeholder="e.g. Dev, Designer, Lead" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            {error && <p style={{ color: "var(--red)", fontSize: 13 }}>{error}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" onClick={editing ? handleSaveEdit : handleAdd} style={{ flex: 1 }}>
                {editing ? "Save Changes" : "Add Member"}
              </button>
              <button className="btn btn-outline" onClick={() => { setShowAdd(false); setEditing(null); setError(""); }} style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member list */}
      {members.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>◈</span>
          <h3>No team members yet</h3>
          <p>Add your teammates' wallet addresses for quick payments.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {members.map((m) => (
            <div key={m.address} className={styles.row}>
              <div className={styles.avatar}>{m.label[0].toUpperCase()}</div>
              <div className={styles.info}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={styles.name}>{m.label}</span>
                  {m.role && <span className="badge badge-blue" style={{ fontSize: 10 }}>{m.role}</span>}
                </div>
                <span className={`mono ${styles.address}`}>{m.address.slice(0, 12)}…{m.address.slice(-8)}</span>
              </div>
              <div className={styles.actions}>
                <button className="btn btn-ghost" onClick={() => { navigator.clipboard.writeText(m.address); }} title="Copy address" style={{ padding: "6px 10px", fontSize: 14 }}>⎘</button>
                <button className="btn btn-ghost" onClick={() => handleEdit(m)} title="Edit" style={{ padding: "6px 10px", fontSize: 14 }}>✎</button>
                <button className="btn btn-ghost" onClick={() => handleDelete(m.address)} title="Remove" style={{ padding: "6px 10px", fontSize: 14, color: "var(--red)" }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
