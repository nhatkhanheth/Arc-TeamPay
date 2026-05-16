import { ARC_TESTNET } from "../utils/constants";
import styles from "./AboutPage.module.css";

const LINKS = [
  { label: "Arc Network", href: "https://arc.io", tag: "Infrastructure" },
  { label: "Arc Explorer", href: ARC_TESTNET.blockExplorer, tag: "Explorer" },
  { label: "USDC Faucet", href: ARC_TESTNET.faucet, tag: "Testnet" },
  { label: "Arc Docs", href: "https://docs.arc.io", tag: "Docs" },
  { label: "C1K GitHub", href: "https://github.com/nhatkhanheth", tag: "Team" },
];

const TECH = [
  { name: "Arc Testnet", desc: "L1 blockchain — USDC as gas, sub-second finality, EVM-compatible" },
  { name: "USDC (ERC-20)", desc: "Native stablecoin on Arc · 6 decimals · 0x360000…0000" },
  { name: "ethers.js v6", desc: "Ethereum library for wallet connection and contract calls" },
  { name: "React + Vite", desc: "Frontend framework — fast dev, lightweight production bundle" },
  { name: "MetaMask", desc: "EVM wallet for signing transactions via window.ethereum" },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className="badge badge-green">C1K × Arc</span>
        </div>
        <h1 className={styles.heroTitle}>TeamPay</h1>
        <p className={styles.heroDesc}>
          A lightweight USDC payment tool for crypto research teams. Send stablecoin payments
          to teammates on Arc Testnet — instant, cheap, and verifiable on-chain.
        </p>
      </div>

      {/* Network details */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Network</h2>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {[
            ["Chain", "Arc Testnet"],
            ["Chain ID", "5042002"],
            ["RPC", "rpc.testnet.arc.network"],
            ["Gas token", "USDC (18 decimals native)"],
            ["USDC contract", "0x3600000000000000000000000000000000000000"],
            ["Block time", "~0.48s"],
            ["Finality", "Deterministic, sub-second"],
          ].map(([k, v]) => (
            <div key={k} className={styles.netRow}>
              <span className={styles.netKey}>{k}</span>
              <span className={`mono ${styles.netVal}`}>{v}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tech Stack</h2>
        <div className={styles.techGrid}>
          {TECH.map((t) => (
            <div key={t.name} className="card" style={{ padding: "16px 20px" }}>
              <div className={styles.techName}>{t.name}</div>
              <div className={styles.techDesc}>{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Links */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Links</h2>
        <div className={styles.linksGrid}>
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className={styles.linkCard}>
              <div>
                <div className={styles.linkLabel}>{l.label}</div>
                <div className={styles.linkTag}>{l.tag}</div>
              </div>
              <span style={{ color: "var(--text-3)" }}>↗</span>
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className={styles.footer}>
        <p>Built by <strong>C1K</strong> · Crypto research community founded 2022</p>
        <p style={{ marginTop: 4, color: "var(--text-3)", fontSize: 12 }}>
          This app runs on testnet only. No real funds are involved.
        </p>
      </div>
    </div>
  );
}
