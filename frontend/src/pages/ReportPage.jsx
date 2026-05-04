import ReportPanel from '../components/ReportPanel';
import { useCatalog } from '../context/CatalogContext';

export default function ReportPage() {
  const { report, reportError, loadReport, loadingReport } = useCatalog();

  return (
    <section className="page-stack">
      <article className="page-intro">
        <span className="eyebrow">Relatorio</span>
        <h2>Resumo consolidado do catalogo</h2>
        <p>Visualize os indicadores que a Lambda /report deve retornar em producao.</p>
      </article>

      {loadingReport ? <div className="feedback info">Atualizando relatorio...</div> : null}

      <ReportPanel report={report} reportError={reportError} onReload={loadReport} />
    </section>
  );
}