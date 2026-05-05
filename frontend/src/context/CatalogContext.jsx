import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import {
  createVehicle,
  deleteVehicle,
  fetchReport,
  fetchVehicles,
  updateVehicle
} from '../services/api';

function validateVehiclePayload(formData) {
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 1;

  if (!String(formData.brand || '').trim()) {
    return 'Informe a marca do veiculo.';
  }

  if (!String(formData.model || '').trim()) {
    return 'Informe o modelo do veiculo.';
  }

  if (!Number.isInteger(formData.year) || formData.year < 1950 || formData.year > maxYear) {
    return `Informe um ano valido entre 1950 e ${maxYear}.`;
  }

  if (!Number.isFinite(formData.price) || formData.price <= 0) {
    return 'Informe um preco valido maior que zero.';
  }

  if (!Number.isInteger(formData.mileage) || formData.mileage < 0) {
    return 'Informe uma quilometragem valida.';
  }

  if (!['available', 'reserved', 'sold'].includes(formData.status)) {
    return 'Selecione um status valido.';
  }

  return '';
}

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

    const validationError = validateVehiclePayload(formData);

    if (validationError) {
      setError(validationError);
      setSubmitting(false);
      return false;
    }

    const normalizedPayload = {
      ...formData,
      brand: String(formData.brand).trim(),
      model: String(formData.model).trim(),
      color: String(formData.color || '').trim(),
      fuelType: String(formData.fuelType || '').trim(),
      transmission: String(formData.transmission || '').trim(),
      status: String(formData.status).trim()
    };

    try {
      if (selectedVehicle) {
        await updateVehicle(selectedVehicle.id, normalizedPayload);
        setSuccessMessage('Veiculo atualizado com sucesso.');
      } else {
        await createVehicle(normalizedPayload);
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