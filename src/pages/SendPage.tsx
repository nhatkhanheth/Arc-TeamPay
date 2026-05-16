import { useState, useCallback } from "react";
import { useWallet } from "../hooks/useWallet";
import { sendUsdc, isValidAmount } from "../utils/arc";
import { savePayment, loadMembers, type TeamMember } from "../utils/storage";
import { ARC_TESTNET } from "../utils/constants";
import styles from "./SendPage.module.css";

type SendStep = "form" | "confirm" | "sending" | "success" | "error";

export default function SendPage() {
  const { isConnected, isOnArc, address, connect, switchNetwork, isLoading, refreshBalance } = useWallet();

  const [step, setStep] = useState<SendStep>("form");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [txResult, setTxResult] = useState<{ txHash: string; explorerUrl: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const members = loadMembers();

  const toError = to && !/^0x[0-9a-fA-F]{40}$/.test(to) ? "Invalid EVM address" : "";
  const amountError = amount && !isValidAmount(amount) ? "Enter a valid amount" : "";
  const canSubmit = to && !toError && amount && !amountError && isConnected && isOnArc;

  const handleMemberSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = members.find((m) => m.address === e.target.value) ?? null;
    setSelectedMember(m);
    if (m) setTo(m.address);
    else setTo("");
  };

  const handleConfirm = useCallback(async () => {
    setStep("sending");
    setErrorMsg("");
    try {
      const result = await sendUsdc({ to, amount, memo });
      setTxResult(result);
      savePayment({
        id: crypto.randomUUID(),
        txHash: result.txHash,
        from: address ?? "",
        to,
        toLabel: selectedMember?.label,
        amount,
        memo: memo || undefined,
        timestamp: Date.now(),
        explorerUrl: result.explorerUrl,
        status: "success",
      });
      await refreshBalance();
      setStep("success");
    } catch (err: unknown) {
      setErrorMsg((err as Error).message ?? "Transaction failed.");
      setStep("error");
    }
  }, [to, amount, memo, address, selectedMember, refreshBalance]);

  const reset = () => {
    setStep("form");
    setTo("");
    setAmount("");
    setMemo("");
    setSelectedMember(null);
    setTxResult(null);
    setErrorMsg("");
  };

  // ── Not connected ──────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className={styles.centerWrap}>
        <div className="card" style={{ maxWidth: 400, textAlign: "center" }}>
          <div className={styles.emptyIcon}>◈</div>
          <h2 style={{ marginBottom: 8, fontSize: 20 }}>Connect your wallet</h2>
          <p style={{ color: "var(--text-2)", marginBottom: 24, fontSize: 14 }}>
            Connect a MetaMask or EVM-compatible wallet to send USDC to your team on Arc Testnet.
          </p>
          <button className="btn btn-primary" onClick={connect} disabled={isLoading} style={{ width: "100%" }}>
            Connect Wallet
          </button>
          <p style={{ marginTop: 16, fontSize: 12, color: "var(--text-3)" }}>
            Need testnet USDC?{" "}
            <a href={ARC_TESTNET.faucet} target="_blank" rel="noreferrer">Get from faucet ↗</a>
          </p>
        </div>
      </div>
    );
  }

  if (!isOnArc) {
    return (
      <div className={styles.centerWrap}>
        <div className="card" style={{ maxWidth: 400, textAlign: "center" }}>
          <div className={styles.emptyIcon} style={{ color: "var(--gold)" }}>⚠</div>
          <h2 style={{ marginBottom: 8, fontSize: 20 }}>Wrong Network</h2>
          <p style={{ color: "var(--text-2)", marginBottom: 24, fontSize: 14 }}>
            Switch to Arc Testnet to send payments.
          </p>
          <button className="btn btn-primary" onClick={switchNetwork} style={{ width: "100%" }}>
            Switch to Arc Testnet
          </button>
        </div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────
  if (step === "success" && txResult) {
    return (
      <div className={styles.centerWrap}>
        <div className={`card ${styles.successCard}`}>
          <div className={styles.successIcon}>✓</div>
          <h2 style={{ fontSize: 22, marginBottom: 6 }}>Payment Sent</h2>
          <p style={{ color: "var(--text-2)", marginBottom: 4, fontSize: 14 }}>
            {amount} USDC → {selectedMember?.label ?? to.slice(0, 10) + "…"}
          </p>
          {memo && <p style={{ color: "var(--text-3)", fontSize: 13, marginBottom: 16 }}>"{memo}"</p>}
          <div className={styles.txHashBox}>
            <span className="mono" style={{ fontSize: 11, color: "var(--text-2)", wordBreak: "break-all" }}>
              {txResult.txHash}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            <a href={txResult.explorerUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ flex: 1 }}>
              View on Explorer ↗
            </a>
            <button className="btn btn-primary" onClick={reset} style={{ flex: 1 }}>
              New Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (step === "error") {
    return (
      <div className={styles.centerWrap}>
        <div className="card" style={{ maxWidth: 440, textAlign: "center" }}>
          <div className={styles.emptyIcon} style={{ color: "var(--red)" }}>✕</div>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Transaction Failed</h2>
          <p style={{ color: "var(--text-2)", marginBottom: 20, fontSize: 13, wordBreak: "break-word" }}>{errorMsg}</p>
          <button className="btn btn-primary" onClick={() => setStep("confirm")} style={{ width: "100%" }}>
            Try Again
          </button>
          <button className="btn btn-ghost" onClick={reset} style={{ width: "100%", marginTop: 8 }}>
            Start Over
          </button>
        </div>
      </div>
    );
  }

  // ── Sending ────────────────────────────────────────────────────────────
  if (step === "sending") {
    return (
      <div className={styles.centerWrap}>
        <div className="card" style={{ maxWidth: 360, textAlign: "center" }}>
          <div className={styles.spinnerWrap}>
            <div className={styles.spinner} />
          </div>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Broadcasting…</h2>
          <p style={{ color: "var(--text-2)", fontSize: 13 }}>
            Sending {amount} USDC on Arc Testnet. Please wait.
          </p>
        </div>
      </div>
    );
  }

  // ── Confirm ────────────────────────────────────────────────────────────
  if (step === "confirm") {
    return (
      <div className={styles.centerWrap}>
        <div className="card" style={{ maxWidth: 440 }}>
          <div className={styles.confirmHeader}>
            <button className="btn btn-ghost" onClick={() => setStep("form")} style={{ padding: "6px 10px" }}>← Back</button>
            <h2 style={{ fontSize: 18 }}>Confirm Payment</h2>
          </div>
          <div className={styles.divider} />

          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>To</span>
            <span className={`mono ${styles.confirmValue}`} style={{ fontSize: 12 }}>
              {selectedMember ? <><span style={{ color: "var(--accent)" }}>{selectedMember.label}</span> · {to}</> : to}
            </span>
          </div>
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>Amount</span>
            <span className={styles.confirmValue} style={{ color: "var(--accent)", fontWeight: 700, fontSize: 20 }}>
              {amount} <span style={{ fontSize: 13, color: "var(--text-2)" }}>USDC</span>
            </span>
          </div>
          {memo && (
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Memo</span>
              <span className={styles.confirmValue} style={{ color: "var(--text-2)", fontStyle: "italic" }}>"{memo}"</span>
            </div>
          )}
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>Network</span>
            <span className={styles.confirmValue}>Arc Testnet · Chain ID 5042002</span>
          </div>
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>Gas fee</span>
            <span className={styles.confirmValue} style={{ color: "var(--text-2)" }}>≈ &lt;$0.01 USDC</span>
          </div>

          <div className={styles.divider} />

          <button className="btn btn-primary" onClick={handleConfirm} style={{ width: "100%", padding: "14px" }}>
            Confirm &amp; Send
          </button>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Send Payment</h1>
        <p className={styles.pageSubtitle}>Transfer USDC to your team on Arc Testnet</p>
      </div>

      <div className={styles.formCard}>
        {/* Quick select team member */}
        {members.length > 0 && (
          <div className="input-group" style={{ marginBottom: 20 }}>
            <label className="input-label">Quick select team member</label>
            <select
              className="input"
              value={selectedMember?.address ?? ""}
              onChange={handleMemberSelect}
            >
              <option value="">— Select member —</option>
              {members.map((m) => (
                <option key={m.address} value={m.address}>
                  {m.label}{m.role ? ` · ${m.role}` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Recipient address */}
        <div className="input-group" style={{ marginBottom: 20 }}>
          <label className="input-label">Recipient Address</label>
          <input
            className={`input ${toError ? "error" : ""}`}
            placeholder="0x..."
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setSelectedMember(null);
            }}
            spellCheck={false}
          />
          {toError && <span style={{ fontSize: 12, color: "var(--red)" }}>{toError}</span>}
        </div>

        {/* Amount */}
        <div className="input-group" style={{ marginBottom: 20 }}>
          <label className="input-label">Amount (USDC)</label>
          <div style={{ position: "relative" }}>
            <input
              className={`input ${amountError ? "error" : ""}`}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              min="0"
              step="0.01"
              style={{ paddingRight: 64 }}
            />
            <span style={{
              position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
              fontSize: 12, fontWeight: 700, color: "var(--accent)", pointerEvents: "none", fontFamily: "var(--font-mono)"
            }}>USDC</span>
          </div>
          {amountError && <span style={{ fontSize: 12, color: "var(--red)" }}>{amountError}</span>}
          {/* Preset buttons */}
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            {["10", "50", "100", "500"].map((v) => (
              <button key={v} className="btn btn-ghost" onClick={() => setAmount(v)} style={{ fontSize: 12, padding: "4px 12px", flex: 1 }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Memo */}
        <div className="input-group" style={{ marginBottom: 24 }}>
          <label className="input-label">Memo <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(optional)</span></label>
          <input
            className="input"
            placeholder="e.g. March bonus, bug bounty…"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            maxLength={120}
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: "100%", padding: "15px" }}
          disabled={!canSubmit}
          onClick={() => setStep("confirm")}
        >
          Review Payment →
        </button>
      </div>

      {/* Info footer */}
      <div className={styles.infoRow}>
        <span style={{ color: "var(--text-3)", fontSize: 12 }}>
          Gas fees &lt;$0.01 · Powered by{" "}
          <a href="https://arc.io" target="_blank" rel="noreferrer">Arc Network</a>
          {" "}· USDC by Circle
        </span>
      </div>
    </div>
  );
}
