import { useEffect, useState } from 'react';

import { fetchVehicleImages } from '../services/api';

export default function VehicleList({ vehicles, loading, onDelete, onEdit }) {
  const [imagesByVehicleId, setImagesByVehicleId] = useState({});

  useEffect(() => {
    let active = true;

    async function loadImages() {
      const nextImages = {};

      await Promise.all(
        vehicles.map(async (vehicle) => {
          try {
            const images = await fetchVehicleImages(vehicle.id, 1);
            nextImages[vehicle.id] = images[0] || null;
          } catch {
            nextImages[vehicle.id] = null;
          }
        })
      );

      if (active) {
        setImagesByVehicleId(nextImages);
      }
    }

    if (vehicles.length === 0) {
      setImagesByVehicleId({});
      return () => {
        active = false;
      };
    }

    loadImages();

    return () => {
      active = false;
    };
  }, [vehicles]);

  return (
    <section className="panel-card">
      <div className="panel-header">
        <h2>Itens cadastrados</h2>
        <span className="badge">{vehicles.length} veiculos</span>
      </div>

      {loading ? <p>Carregando veiculos...</p> : null}

      {!loading && vehicles.length === 0 ? (
        <p>Nenhum veiculo cadastrado ainda.</p>
      ) : (
        <div className="vehicle-card-grid">
          {vehicles.map((vehicle) => {
            const image = imagesByVehicleId[vehicle.id]?.thumbnail || imagesByVehicleId[vehicle.id]?.url;

            return (
              <article className="vehicle-card" key={vehicle.id}>
                <div className="vehicle-card-media">
                  {image ? (
                    <img
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="vehicle-card-image"
                      loading="lazy"
                      src={image}
                    />
                  ) : (
                    <div className="vehicle-card-placeholder">Sem imagem</div>
                  )}

                  <div className="vehicle-card-overlay">
                    <span className="vehicle-photo-counter">ID {vehicle.id}</span>
                    <span className={`status-chip ${vehicle.status}`}>{vehicle.status}</span>
                  </div>
                </div>

                <div className="vehicle-card-body">
                  <h3>{vehicle.brand}</h3>
                  <p className="vehicle-card-model">{vehicle.model}</p>

                  <div className="vehicle-card-specs">
                    <span>{vehicle.year}</span>
                    <span>{vehicle.mileage ?? 0} km</span>
                    <span>{vehicle.fuelType || 'Nao informado'}</span>
                  </div>

                  <div className="vehicle-card-meta">
                    <span>{vehicle.color || 'Cor nao informada'}</span>
                    <span>{vehicle.transmission || 'Cambio nao informado'}</span>
                  </div>

                  <strong className="vehicle-card-price">
                    {Number(vehicle.price).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </strong>

                  <div className="action-row vehicle-card-actions">
                    <button className="ghost-button" onClick={() => onEdit(vehicle)} type="button">
                      Editar
                    </button>
                    <button className="danger-button" onClick={() => onDelete(vehicle.id)} type="button">
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
