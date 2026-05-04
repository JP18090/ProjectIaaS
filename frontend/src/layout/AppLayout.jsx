import { NavLink, Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="app-frame">
      <header className="topbar-shell">
        <div className="topbar-inner">
          <div>
            <span className="eyebrow">ProjectIaaS</span>
            <h1 className="app-title">Catalogo de Veiculos</h1>
          </div>

          <nav className="nav-tabs">
            <NavLink className={({ isActive }) => navClassName(isActive)} to="/">
              Entrada
            </NavLink>
            <NavLink className={({ isActive }) => navClassName(isActive)} to="/cadastro">
              Cadastro
            </NavLink>
            <NavLink className={({ isActive }) => navClassName(isActive)} to="/veiculos">
              Veiculos
            </NavLink>
            <NavLink className={({ isActive }) => navClassName(isActive)} to="/relatorio">
              Relatorio
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}

function navClassName(isActive) {
  return isActive ? 'nav-link nav-link-active' : 'nav-link';
}