import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import VehicleList from '../components/VehicleList';
import { useCatalog } from '../context/CatalogContext';

export default function VehiclesPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    color: '',
    year: '',
    minPrice: '',
    maxPrice: ''
  });
  const {
    vehicles,
    loadingVehicles,
    error,
    successMessage,
    removeVehicle,
    startEditing,
    cancelEditing,
    clearMessages
  } = useCatalog();

  const brandOptions = useMemo(
    () => [...new Set(vehicles.map((vehicle) => vehicle.brand).filter(Boolean))].sort((left, right) => left.localeCompare(right)),
    [vehicles]
  );

  const yearOptions = useMemo(
    () => [...new Set(vehicles.map((vehicle) => vehicle.year).filter(Boolean))].sort((left, right) => right - left),
    [vehicles]
  );

  const filteredVehicles = useMemo(() => {
    const normalizedModel = filters.model.trim().toLowerCase();
    const normalizedColor = filters.color.trim().toLowerCase();
    const minPrice = filters.minPrice === '' ? null : Number(filters.minPrice);
    const maxPrice = filters.maxPrice === '' ? null : Number(filters.maxPrice);

    return vehicles.filter((vehicle) => {
      if (filters.brand && vehicle.brand !== filters.brand) {
        return false;
      }

      if (filters.year && String(vehicle.year) !== filters.year) {
        return false;
      }

      if (normalizedModel && !String(vehicle.model || '').toLowerCase().includes(normalizedModel)) {
        return false;
      }

      if (normalizedColor && !String(vehicle.color || '').toLowerCase().includes(normalizedColor)) {
        return false;
      }

      if (minPrice !== null && Number(vehicle.price) < minPrice) {
        return false;
      }

      if (maxPrice !== null && Number(vehicle.price) > maxPrice) {
        return false;
      }

      return true;
    });
  }, [filters, vehicles]);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function clearFilters() {
    setFilters({
      brand: '',
      model: '',
      color: '',
      year: '',
      minPrice: '',
      maxPrice: ''
    });
  }

  function handleNewVehicle() {
    cancelEditing();
    clearMessages();
    navigate('/cadastro');
  }

  function handleEdit(vehicle) {
    startEditing(vehicle);
    navigate('/cadastro');
  }

  return (
    <section className="page-stack">
      <article className="page-intro page-intro-inline">
        <div>
          <span className="eyebrow">Catalogo</span>
          <h2>Veiculos cadastrados</h2>
          <p>Consulte os registros persistidos no PostgreSQL e inicie edicoes a partir desta lista.</p>
        </div>

        <button className="primary-button" onClick={handleNewVehicle} type="button">
          Novo cadastro
        </button>
      </article>

      {successMessage ? <div className="feedback success">{successMessage}</div> : null}
      {error ? <div className="feedback error">{error}</div> : null}

      <section className="panel-card filter-panel">
        <div className="panel-header">
          <div>
            <h2>Filtros</h2>
            <p className="filter-summary">
              Exibindo {filteredVehicles.length} de {vehicles.length} veiculos cadastrados.
            </p>
          </div>

          <button className="ghost-button" onClick={clearFilters} type="button">
            Limpar filtros
          </button>
        </div>

        <div className="filter-grid">
          <label>
            Marca
            <select name="brand" onChange={handleFilterChange} value={filters.brand}>
              <option value="">Todas</option>
              {brandOptions.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>

          <label>
            Modelo
            <input
              name="model"
              onChange={handleFilterChange}
              placeholder="Ex.: Corolla, X5, Hilux"
              value={filters.model}
            />
          </label>

          <label>
            Cor
            <input
              name="color"
              onChange={handleFilterChange}
              placeholder="Ex.: Preto, Branco"
              value={filters.color}
            />
          </label>

          <label>
            Ano
            <select name="year" onChange={handleFilterChange} value={filters.year}>
              <option value="">Todos</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>

          <label>
            Preco minimo
            <input
              min="0"
              name="minPrice"
              onChange={handleFilterChange}
              placeholder="Ex.: 50000"
              step="0.01"
              type="number"
              value={filters.minPrice}
            />
          </label>

          <label>
            Preco maximo
            <input
              min="0"
              name="maxPrice"
              onChange={handleFilterChange}
              placeholder="Ex.: 200000"
              step="0.01"
              type="number"
              value={filters.maxPrice}
            />
          </label>
        </div>
      </section>

      <VehicleList
        vehicles={filteredVehicles}
        loading={loadingVehicles}
        onDelete={removeVehicle}
        onEdit={handleEdit}
      />
    </section>
  );
}