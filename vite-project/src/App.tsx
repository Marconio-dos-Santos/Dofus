import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";

import './App.css';
import Home from "./screens/Home";
import AddRecursos from './screens/AddRecursos'; 
import ManageRecursos from './screens/ManageRecursos';
import LojaScreen from './screens/LojaScreen'; // Importa a nova página da loja
import React from "react";

function Navigation({ }: { selectedItemId: number | null }) {
  const location = useLocation();

  return (
    <nav>
        <a className={location.pathname === "/home" ? "active" : ""}>
          <Link to="/home">Home</Link>
        </a>
        <a className={location.pathname === "/manage-recursos" ? "active" : ""}>
          <Link to="/manage-recursos">Gerenciar Recursos Globais</Link> 
        </a>
        <a className={location.pathname === "/add-recursos" ? "active" : ""}>
          <Link to="/add-recursos">Adicionar Recurso</Link> 
        </a>
        <a className={location.pathname === "/loja" ? "active" : ""}>
          <Link to="/loja">Loja</Link> {/* Novo link para acessar a loja */}
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
          <Route path="/home" element={<Home setSelectedItemId={setSelectedItemId} />} /> 
          <Route path="/add-recursos" element={<AddRecursos />} /> 
          <Route path="/manage-recursos" element={<ManageRecursos />} /> 
          <Route path="/loja" element={<LojaScreen />} /> {/* Nova rota para acessar a loja */}
        </Routes>
      </Router>
    </>
  );
}

export default App;
