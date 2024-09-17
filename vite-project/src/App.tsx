import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";

import './App.css';
import Home from "./screens/Home";
import AddRecursos from './screens/AddRecursos'; // Importa o novo componente
import React from "react";
import ManageRecursos from './screens/ManageRecursos'; // Importa o novo componente de gerenciamento de recursos

function Navigation({ }: { selectedItemId: number | null }) {
  const location = useLocation();

  return (
    <nav>
        <a className={location.pathname === "/home" ? "active" : ""}>
          <Link to="/home">Home</Link>
        </a>

          <a className={location.pathname === "/manage-recursos" ? "active" : ""}>
          <Link to="/manage-recursos">Gerenciar Recursos Globais</Link> {/* Novo link */}
        </a>
        <a className={location.pathname === "/add-recursos" ? "active" : ""}>
          <Link to="/add-recursos">Adicionar Recurso</Link> {/* Novo link para adicionar recurso */}
        </a>
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
          <Route path="/add-recursos" element={<AddRecursos />} /> {/* Nova rota para adicionar recurso */}
          <Route path="/manage-recursos" element={<ManageRecursos />} /> {/* Nova rota para gerenciar recursos globais */}
        </Routes>
      </Router>
    </>
  );
}

export default App;

