import { Link } from 'react-router-dom';

import { useCatalog } from '../context/CatalogContext';

export default function HomePage() {
  const { vehicles, report } = useCatalog();

  return (
    <section className="home-stack">
      <article className="hero-card hero-grid">
        <div>
          <span className="eyebrow">AWS + Spring Boot + Node.js</span>
          <h2 className="hero-title">Controle seu catalogo automotivo com CRUD, FIPE e relatorio.</h2>
          <p>
            A aplicacao centraliza cadastro de veiculos, consulta de marcas e modelos pela FIPE,
            listagem operacional e um resumo consolidado em /report.
          </p>
          <div className="cta-row">
            <Link className="primary-button button-link" to="/cadastro">
              Cadastrar veiculo
            </Link>
            <Link className="ghost-button button-link" to="/veiculos">
              Ver catalogo
            </Link>
          </div>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <strong>Itens cadastrados</strong>
            <span>{vehicles.length}</span>
          </article>
          <article className="stat-card">
            <strong>Disponiveis</strong>
            <span>{report?.available ?? 0}</span>
          </article>
          <article className="stat-card">
            <strong>Vendidos</strong>
            <span>{report?.sold ?? 0}</span>
          </article>
          <article className="stat-card">
            <strong>Preco medio</strong>
            <span>
              {Number(report?.avgPrice ?? 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </span>
          </article>
        </div>
      </article>

      <section className="feature-grid">
        <article className="panel-card">
          <h3>Cadastro estruturado</h3>
          <p>Use a base FIPE para preencher marca, modelo, ano, combustivel e preco medio.</p>
          <Link className="text-link" to="/cadastro">
            Ir para cadastro
          </Link>
        </article>

        <article className="panel-card">
          <h3>Catalogo operacional</h3>
          <p>Gerencie os itens cadastrados, edite registros existentes e remova veiculos vendidos.</p>
          <Link className="text-link" to="/veiculos">
            Abrir lista de veiculos
          </Link>
        </article>

        <article className="panel-card">
          <h3>Relatorio consolidado</h3>
          <p>Acompanhe total de veiculos, disponibilidade, vendidos e distribuicao por marca.</p>
          <Link className="text-link" to="/relatorio">
            Ver relatorio
          </Link>
        </article>
      </section>
    </section>
  );
}