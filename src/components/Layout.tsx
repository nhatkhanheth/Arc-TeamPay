import { NavLink } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import { ARC_TESTNET } from "../utils/constants";
import styles from "./Layout.module.css";

const NAV = [
  { to: "/send",    label: "Send",    icon: "↑" },
  { to: "/history", label: "History", icon: "◷" },
  { to: "/team",    label: "Team",    icon: "◈" },
  { to: "/about",   label: "About",   icon: "◎" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { address, shortAddress, usdcBalance, isConnected, isOnArc, isLoading, connect, disconnect, switchNetwork } = useWallet();

  return (
    <div className={styles.root}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>◈</span>
            <span className={styles.brandName}>TeamPay</span>
            <span className={styles.brandTag}>by C1K</span>
          </div>

          <div className={styles.headerRight}>
            {/* Network badge */}
            <a
              href={ARC_TESTNET.blockExplorer}
              target="_blank"
              rel="noreferrer"
              className={styles.networkBadge}
              title="View on Arc Explorer"
            >
              <span className={styles.networkDot} data-active={isConnected && isOnArc} />
              <span>Arc Testnet</span>
            </a>

            {/* Wallet */}
            {!isConnected ? (
              <button className="btn btn-primary" onClick={connect} disabled={isLoading} style={{ padding: "9px 18px", fontSize: 13 }}>
                {isLoading ? <Spinner /> : "Connect Wallet"}
              </button>
            ) : !isOnArc ? (
              <button className="btn btn-outline" onClick={switchNetwork} disabled={isLoading} style={{ padding: "9px 18px", fontSize: 13, borderColor: "var(--gold)", color: "var(--gold)" }}>
                {isLoading ? <Spinner /> : "Switch to Arc"}
              </button>
            ) : (
              <button className={styles.walletBtn} onClick={disconnect} title="Click to disconnect">
                <span className={styles.walletBalance}>{usdcBalance} USDC</span>
                <span className={styles.walletAddress}>{shortAddress}</span>
              </button>
            )}
          </div>
        </div>

        {/* Wrong network warning */}
        {isConnected && !isOnArc && (
          <div className={styles.networkWarning}>
            ⚠ You are not on Arc Testnet. Please switch network to use TeamPay.
            <button className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 10px" }} onClick={switchNetwork}>Switch now</button>
          </div>
        )}
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className={styles.main}>
        {children}
      </main>

      {/* ── Bottom Nav ───────────────────────────────────────────────────── */}
      <nav className={styles.bottomNav}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
          >
            <span className={styles.navIcon}>{icon}</span>
            <span className={styles.navLabel}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
  );
}
