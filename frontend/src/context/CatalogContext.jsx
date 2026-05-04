import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import {
  createVehicle,
  deleteVehicle,
  fetchReport,
  fetchVehicles,
  updateVehicle
} from '../services/api';

const CatalogContext = createContext(null);

export const initialForm = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  color: '',
  price: '',
  mileage: 0,
  fuelType: '',
  transmission: '',
  status: 'available'
};

export function CatalogProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);
  const [report, setReport] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingReport, setLoadingReport] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reportError, setReportError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadVehicles() {
    setLoadingVehicles(true);
    setError('');

    try {
      const data = await fetchVehicles();
      setVehicles(data);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoadingVehicles(false);
    }
  }

  async function loadReport() {
    setLoadingReport(true);
    setReportError('');

    try {
      const data = await fetchReport();
      setReport(data);
    } catch (loadError) {
      setReport(null);
      setReportError(loadError.message);
    } finally {
      setLoadingReport(false);
    }
  }

  useEffect(() => {
    loadVehicles();
    loadReport();
  }, []);

  async function saveVehicle(formData) {
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      if (selectedVehicle) {
        await updateVehicle(selectedVehicle.id, formData);
        setSuccessMessage('Veiculo atualizado com sucesso.');
      } else {
        await createVehicle(formData);
        setSuccessMessage('Veiculo cadastrado com sucesso.');
      }

      setSelectedVehicle(null);
      await Promise.all([loadVehicles(), loadReport()]);
      return true;
    } catch (submitError) {
      setError(submitError.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function removeVehicle(id) {
    setError('');
    setSuccessMessage('');

    try {
      await deleteVehicle(id);
      if (selectedVehicle?.id === id) {
        setSelectedVehicle(null);
      }
      setSuccessMessage('Veiculo removido com sucesso.');
      await Promise.all([loadVehicles(), loadReport()]);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  function startEditing(vehicle) {
    setSelectedVehicle(vehicle);
    setError('');
    setSuccessMessage('');
  }

  function cancelEditing() {
    setSelectedVehicle(null);
  }

  function clearMessages() {
    setError('');
    setReportError('');
    setSuccessMessage('');
  }

  const value = useMemo(
    () => ({
      vehicles,
      report,
      selectedVehicle,
      loadingVehicles,
      loadingReport,
      submitting,
      error,
      reportError,
      successMessage,
      loadVehicles,
      loadReport,
      saveVehicle,
      removeVehicle,
      startEditing,
      cancelEditing,
      clearMessages
    }),
    [vehicles, report, selectedVehicle, loadingVehicles, loadingReport, submitting, error, reportError, successMessage]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);

  if (!context) {
    throw new Error('useCatalog deve ser usado dentro de CatalogProvider');
  }

  return context;
}