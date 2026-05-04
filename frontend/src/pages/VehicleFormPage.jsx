import { useNavigate } from 'react-router-dom';

import VehicleForm from '../components/VehicleForm';
import { initialForm, useCatalog } from '../context/CatalogContext';

export default function VehicleFormPage() {
  const navigate = useNavigate();
  const {
    selectedVehicle,
    submitting,
    error,
    successMessage,
    saveVehicle,
    cancelEditing,
    clearMessages
  } = useCatalog();

  async function handleSubmit(formData) {
    const saved = await saveVehicle(formData);

    if (saved) {
      navigate('/veiculos');
    }
  }

  function handleCancel() {
    cancelEditing();
    clearMessages();
    navigate('/veiculos');
  }

  return (
    <section className="page-stack">
      <article className="page-intro">
        <span className="eyebrow">Cadastro</span>
        <h2>{selectedVehicle ? 'Atualizar um veiculo existente' : 'Cadastrar novo veiculo'}</h2>
        <p>Preencha manualmente ou use a FIPE para acelerar o preenchimento do catalogo.</p>
      </article>

      {successMessage ? <div className="feedback success">{successMessage}</div> : null}
      {error ? <div className="feedback error">{error}</div> : null}

      <VehicleForm
        initialValues={selectedVehicle || initialForm}
        isEditing={Boolean(selectedVehicle)}
        isSubmitting={submitting}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </section>
  );
}