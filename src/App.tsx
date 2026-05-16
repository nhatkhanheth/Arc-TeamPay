import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider } from "./hooks/useWallet";
import Layout from "./components/Layout";
import SendPage from "./pages/SendPage";
import HistoryPage from "./pages/HistoryPage";
import TeamPage from "./pages/TeamPage";
import AboutPage from "./pages/AboutPage";
import "./styles/global.css";

export default function App() {
  return (
    <WalletProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/send" replace />} />
            <Route path="/send" element={<SendPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Layout>
      </HashRouter>
    </WalletProvider>
  );
}
