import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { CatalogProvider } from './context/CatalogContext';
import AppLayout from './layout/AppLayout';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import VehicleFormPage from './pages/VehicleFormPage';
import VehiclesPage from './pages/VehiclesPage';

export default function App() {
  return (
    <CatalogProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/cadastro" element={<VehicleFormPage />} />
            <Route path="/veiculos" element={<VehiclesPage />} />
            <Route path="/relatorio" element={<ReportPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CatalogProvider>
  );
}
