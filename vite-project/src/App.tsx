import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";

import './App.css';
import Home from "./screens/Home";
import Recursos from './screens/Recursos';
import AddRecursos from './screens/AddRecursos'; // Importa o novo componente
import React from "react";
import ManageRecursos from './screens/ManageRecursos'; // Importa o novo componente de gerenciamento de recursos

function Navigation({ selectedItemId }: { selectedItemId: number | null }) {
  const location = useLocation();

  return (
    <nav>
      <ul>
        <li className={location.pathname === "/home" ? "active" : ""}>
          <Link to="/home">Home</Link>
        </li>
        <li className={location.pathname === "/manage-recursos" ? "active" : ""}>
          <Link to="/recursos">Manage Recursos</Link>
        </li>
        {selectedItemId && (
            <li className={location.pathname === `/recursos/${selectedItemId}` ? "active" : ""}>
              <Link to={`/recursos/${selectedItemId}`}>Recursos do item {selectedItemId}</Link>
            </li>
          )}
          <li className={location.pathname === "/manage-recursos" ? "active" : ""}>
          <Link to="/manage-recursos">Gerenciar Recursos Globais</Link> {/* Novo link */}
        </li>
        <li className={location.pathname === "/add-recursos" ? "active" : ""}>
          <Link to="/add-recursos">Adicionar Recurso</Link> {/* Novo link para adicionar recurso */}
        </li>
      </ul>
    </nav>
  );
}

function App() {
  const [selectedItemId, setSelectedItemId] = React.useState<number | null>(null); // Controla o item selecionado
  return (
    <>
      <Router>
      <Navigation selectedItemId={selectedItemId} />
        <Routes>
        <Route path="/home" element={<Home setSelectedItemId={setSelectedItemId} />} /> {/* Passa a função para Home */}
          <Route path="/recursos/:itemId" element={<Recursos />} /> {/* Rota para recursos de um item específico */}
          <Route path="/add-recursos" element={<AddRecursos />} /> {/* Nova rota para adicionar recurso */}
          <Route path="/manage-recursos" element={<ManageRecursos />} /> {/* Nova rota para gerenciar recursos globais */}
        </Routes>
      </Router>
    </>
  );
}

export default App;

