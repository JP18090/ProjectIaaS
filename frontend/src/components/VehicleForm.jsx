import { useEffect, useState } from 'react';

import {
  fetchFipeBrands,
  fetchFipeModels,
  fetchFipeVehicleInfo,
  fetchFipeYears
} from '../services/api';

const emptyForm = {
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

export default function VehicleForm({ initialValues, isEditing, isSubmitting, onCancel, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [selection, setSelection] = useState({ brandId: '', modelId: '', yearId: '' });
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState('');

  useEffect(() => {
    setForm({
      ...emptyForm,
      ...initialValues,
      price: initialValues?.price ?? '',
      mileage: initialValues?.mileage ?? 0
    });
    setSelection({ brandId: '', modelId: '', yearId: '' });
    setModels([]);
    setYears([]);
  }, [initialValues]);

  useEffect(() => {
    let active = true;

    async function loadBrands() {
      setCatalogLoading(true);
      setCatalogError('');

      try {
        const data = await fetchFipeBrands();
        if (active) {
          setBrands(data);
        }
      } catch (error) {
        if (active) {
          setCatalogError('Nao foi possivel carregar a base FIPE no momento.');
        }
      } finally {
        if (active) {
          setCatalogLoading(false);
        }
      }
    }

    loadBrands();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleBrandSelect(event) {
    const brandId = event.target.value;

    setSelection({ brandId, modelId: '', yearId: '' });
    setModels([]);
    setYears([]);
    setCatalogError('');

    if (!brandId) {
      return;
    }

    setCatalogLoading(true);
    try {
      const data = await fetchFipeModels(brandId);
      setModels(data);
    } catch {
      setCatalogError('Nao foi possivel carregar os modelos da FIPE.');
    } finally {
      setCatalogLoading(false);
    }
  }

  async function handleModelSelect(event) {
    const modelId = event.target.value;

    setSelection((current) => ({ ...current, modelId, yearId: '' }));
    setYears([]);
    setCatalogError('');

    if (!selection.brandId || !modelId) {
      return;
    }

    setCatalogLoading(true);
    try {
      const data = await fetchFipeYears(selection.brandId, modelId);
      setYears(data);
    } catch {
      setCatalogError('Nao foi possivel carregar os anos da FIPE.');
    } finally {
      setCatalogLoading(false);
    }
  }

  async function handleYearSelect(event) {
    const yearId = event.target.value;
    const nextSelection = { ...selection, yearId };
    setSelection(nextSelection);
    setCatalogError('');

    if (!nextSelection.brandId || !nextSelection.modelId || !yearId) {
      return;
    }

    setCatalogLoading(true);
    try {
      const info = await fetchFipeVehicleInfo(nextSelection.brandId, nextSelection.modelId, yearId);
      setForm((current) => ({
        ...current,
        brand: info.brand || current.brand,
        model: info.model || current.model,
        year: info.modelYear || current.year,
        fuelType: info.fuel || current.fuelType,
        price: parseFipePrice(info.price) || current.price
      }));
    } catch {
      setCatalogError('Nao foi possivel carregar o preco estimado da FIPE.');
    } finally {
      setCatalogLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const saved = await onSubmit({
      ...form,
      year: Number(form.year),
      price: Number(form.price),
      mileage: Number(form.mileage)
    });

    if (saved && !isEditing) {
      setForm(emptyForm);
    }
  }

  return (
    <section className="panel-card">
      <div className="panel-header">
        <h2>{isEditing ? 'Editar veiculo' : 'Cadastrar veiculo'}</h2>
        {isEditing ? (
          <button className="ghost-button" type="button" onClick={onCancel}>
            Cancelar edicao
          </button>
        ) : null}
      </div>

      <form className="vehicle-form" onSubmit={handleSubmit}>
        <div className="stack-field stack-field-full">
          <strong>Consulta FIPE</strong>
          <small>
            Use a FIPE para preencher marca, modelo, ano, combustivel e preco medio antes de salvar
            no seu CRUD.
          </small>
          <div className="inline-grid">
            <label>
              Marca FIPE
              <select value={selection.brandId} onChange={handleBrandSelect}>
                <option value="">Selecione</option>
                {brands.map((brand) => (
                  <option key={brand.code} value={brand.code}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Modelo FIPE
              <select disabled={!selection.brandId || catalogLoading} value={selection.modelId} onChange={handleModelSelect}>
                <option value="">Selecione</option>
                {models.map((model) => (
                  <option key={model.code} value={model.code}>
                    {model.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Ano FIPE
              <select disabled={!selection.modelId || catalogLoading} value={selection.yearId} onChange={handleYearSelect}>
                <option value="">Selecione</option>
                {years.map((year) => (
                  <option key={year.code} value={year.code}>
                    {year.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {catalogLoading ? <small>Consultando FIPE...</small> : null}
          {catalogError ? <small className="inline-error">{catalogError}</small> : null}
        </div>

        <label>
          Marca
          <input name="brand" value={form.brand} onChange={handleChange} required />
        </label>

        <label>
          Modelo
          <input name="model" value={form.model} onChange={handleChange} required />
        </label>

        <label>
          Ano
          <input name="year" type="number" min="1950" value={form.year} onChange={handleChange} required />
        </label>

        <label>
          Cor
          <input name="color" value={form.color} onChange={handleChange} />
        </label>

        <label>
          Preco
          <input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={handleChange} required />
        </label>

        <label>
          Quilometragem
          <input name="mileage" type="number" min="0" value={form.mileage} onChange={handleChange} />
        </label>

        <label>
          Combustivel
          <select name="fuelType" value={form.fuelType} onChange={handleChange}>
            <option value="">Selecione</option>
            <option value="Flex">Flex</option>
            <option value="Gasolina">Gasolina</option>
            <option value="Etanol">Etanol</option>
            <option value="Diesel">Diesel</option>
            <option value="Hibrido">Hibrido</option>
            <option value="Eletrico">Eletrico</option>
          </select>
        </label>

        <label>
          Cambio
          <select name="transmission" value={form.transmission} onChange={handleChange}>
            <option value="">Selecione</option>
            <option value="Manual">Manual</option>
            <option value="Automatico">Automatico</option>
            <option value="CVT">CVT</option>
          </select>
        </label>

        <label>
          Status
          <select name="status" value={form.status} onChange={handleChange} required>
            <option value="available">Disponivel</option>
            <option value="reserved">Reservado</option>
            <option value="sold">Vendido</option>
          </select>
        </label>

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar item' : 'Cadastrar item'}
        </button>
      </form>
    </section>
  );
}

function parseFipePrice(price) {
  if (!price) {
    return '';
  }

  const normalized = String(price)
    .replace(/R\$/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : '';
}
