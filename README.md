# ◈ TeamPay

**USDC team payment tool built on [Arc Network](https://arc.io) — by [C1K](https://github.com/nhatkhanheth)**

TeamPay lets crypto research teams send USDC payments to teammates directly on-chain, using Arc Testnet's sub-second finality and near-zero gas fees denominated in USDC itself.

---

## ✦ Features

- **Send USDC** to any EVM address on Arc Testnet — with one-click confirm flow
- **Team address book** — save teammates' wallets for quick selection
- **Transaction history** — all sent payments stored locally with Arc Explorer links
- **One-click network switch** — adds Arc Testnet to MetaMask automatically
- **Memo support** — attach an off-chain label to each payment
- **Real-time USDC balance** — always up to date after each transaction
- **Mobile-friendly** — responsive layout optimized for all screen sizes

---

## ✦ Live Demo

> Deployed on GitHub Pages: [https://nhatkhanheth.github.io/teampay/](https://nhatkhanheth.github.io/teampay/)

---

## ✦ Network

| Parameter       | Value                                    |
|-----------------|------------------------------------------|
| Network name    | Arc Testnet                              |
| Chain ID        | `5042002`                                |
| RPC URL         | `https://rpc.testnet.arc.network`        |
| Currency symbol | USDC                                     |
| Block explorer  | https://testnet.arcscan.app              |
| Faucet          | https://faucet.circle.com                |

> Arc uses **USDC as the native gas token**. All transaction fees are paid in USDC (~$0.01 per transaction).
> The USDC ERC-20 contract on Arc Testnet: `0x3600000000000000000000000000000000000000`

---

## ✦ Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | React 18 + TypeScript + Vite                |
| Web3       | ethers.js v6                                |
| Wallet     | MetaMask / any EVM wallet via window.ethereum |
| Styling    | CSS Modules + custom design system          |
| Routing    | React Router v6 (HashRouter for GH Pages)  |
| Storage    | localStorage (no backend required)         |
| Deploy     | GitHub Pages via `gh-pages`                 |

---

## ✦ Getting Started

### Prerequisites

- Node.js 18+
- MetaMask (or any EVM-compatible wallet)
- Testnet USDC from [faucet.circle.com](https://faucet.circle.com)

### Installation

```bash
git clone https://github.com/nhatkhanheth/teampay.git
cd teampay
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173/teampay/](http://localhost:5173/teampay/)

### Production Build

```bash
npm run build
```

Output in `dist/`.

---

## ✦ Deployment (GitHub Pages)

### 1. Install gh-pages

```bash
npm install --save-dev gh-pages
```

### 2. Add deploy script to `package.json`

```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

### 3. Set the correct base URL

In `vite.config.ts`, ensure `base` matches your repo name:

```ts
base: "/teampay/",
```

### 4. Deploy

```bash
npm run deploy
```

Your app will be live at `https://<your-username>.github.io/teampay/`

---

## ✦ Project Structure

```
teampay/
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # App shell, header, nav
│   │   └── Layout.module.css
│   ├── hooks/
│   │   └── useWallet.tsx       # Wallet state (connect, balance, network)
│   ├── pages/
│   │   ├── SendPage.tsx        # Main payment UI
│   │   ├── HistoryPage.tsx     # Transaction history
│   │   ├── TeamPage.tsx        # Team address book
│   │   └── AboutPage.tsx       # Project info & network details
│   ├── utils/
│   │   ├── constants.ts        # Arc network config, USDC address
│   │   ├── arc.ts              # Web3 helpers (send, balance, switch network)
│   │   └── storage.ts          # LocalStorage helpers (history, team)
│   ├── styles/
│   │   └── global.css          # Design tokens, base styles
│   ├── App.tsx                 # Root + routing
│   ├── main.tsx                # Entry point
│   └── types.d.ts              # window.ethereum type declaration
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## ✦ How It Works

1. **Connect wallet** — triggers `eth_requestAccounts` via MetaMask
2. **Switch network** — calls `wallet_addEthereumChain` with Arc Testnet params if not already on Arc
3. **Send USDC** — calls `transfer(address, uint256)` on the USDC ERC-20 contract at `0x3600…0000` with:
   - `maxFeePerGas: 20 Gwei` (Arc protocol minimum per [docs](https://docs.arc.io/arc/references/gas-and-fees))
   - `maxPriorityFeePerGas: 1 Gwei`
4. **Receipt** — transaction hash + Arc Explorer link displayed on success
5. **Storage** — payment record saved to localStorage for history

---

## ✦ About C1K

C1K is a crypto research community founded in 2022, focused on:
- On-chain project research and airdrop workflows
- Tool development for DeFi power users
- Knowledge sharing across crypto-native verticals

GitHub: [@nhatkhanheth](https://github.com/nhatkhanheth)

---

## ✦ License

MIT — free to use, fork, and build upon.

---

> Built with ◈ on Arc Testnet · USDC by Circle
