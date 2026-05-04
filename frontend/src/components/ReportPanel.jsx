export default function ReportPanel({ report, reportError, onReload }) {
  return (
    <section className="panel-card">
      <div className="panel-header">
        <h2>Relatorio /report</h2>
        <button className="ghost-button" onClick={onReload} type="button">
          Atualizar
        </button>
      </div>

      {report ? (
        <div className="report-grid">
          <article>
            <strong>Total</strong>
            <span>{report.totalVehicles ?? 0}</span>
          </article>
          <article>
            <strong>Disponiveis</strong>
            <span>{report.available ?? 0}</span>
          </article>
          <article>
            <strong>Vendidos</strong>
            <span>{report.sold ?? 0}</span>
          </article>
          <article>
            <strong>Preco medio</strong>
            <span>
              {Number(report.avgPrice ?? 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </span>
          </article>

          <div className="brand-summary">
            <strong>Por marca</strong>
            <ul>
              {Object.entries(report.byBrand ?? {}).map(([brand, total]) => (
                <li key={brand}>
                  <span>{brand}</span>
                  <span>{total}</span>
                </li>
              ))}
            </ul>
          </div>

          <small>Ultima atualizacao: {report.lastUpdate ?? '-'}</small>
        </div>
      ) : (
        <div className="report-empty">
          <p>O relatorio aparecera aqui quando a Lambda /report estiver acessivel.</p>
          {reportError ? <p className="feedback error">{reportError}</p> : null}
        </div>
      )}
    </section>
  );
}
