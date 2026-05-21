import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './Layout';
import Home from './pages/Home';
import Components from './pages/Components';
import CrmContractDetail from './pages/CrmContractDetail';
import SignContractList from './pages/SignContractList';
import NovaWorkspace from './pages/NovaWorkspace';
import PolarisOffice from './pages/PolarisOffice';
import ProposalPlatform from './pages/ProposalPlatform';
import Tokens from './pages/Tokens';
import Assets from './pages/Assets';
import Icons from './pages/Icons';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="components" element={<Components />} />
          <Route path="nova" element={<NovaWorkspace />} />
          <Route path="crm/contract" element={<CrmContractDetail />} />
          <Route path="sign/contracts" element={<SignContractList />} />
          <Route path="polaris-office" element={<PolarisOffice />} />
          <Route path="proposal-platform" element={<ProposalPlatform />} />
          <Route path="tokens" element={<Tokens />} />
          <Route path="assets" element={<Assets />} />
          <Route path="icons" element={<Icons />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
