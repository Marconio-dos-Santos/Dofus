import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ItensScreen from './itenScreen';
import AddItemModal from './AddItemModal'; // Importa o modal
import Receita from './receita';

type Item = {
  id: number;
  type: string;
  name: string;
  image: string;
  venda: number;
  receita: { name: string, quantity: number, cost: number }[];
};

// Define a interface para as props do Home
interface HomeProps {
  setSelectedItemId: (id: number) => void; // Função para setar o ID do item
}

const Home: React.FC<HomeProps> = ({ setSelectedItemId }) => {
  const [itens, setItens] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Controla a visibilidade do modal

  useEffect(() => {
    axios.get('http://localhost:5000/itens')
      .then(response => {
        setItens(response.data);
        setSelectedItem(response.data[0]); // Seleciona o primeiro item por padrão
        setSelectedItemId(response.data[0].id); // Define o ID do item selecionado
      })
      .catch(error => {
        console.error("Erro ao buscar itens:", error);
      });
  }, [setSelectedItemId]);

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setSelectedItemId(item.id); // Atualiza o ID do item selecionado quando clicado
  };

  const handleItemAdded = () => {
    // Atualiza a lista de itens após adicionar um novo
    axios.get('http://localhost:5000/itens')
      .then(response => {
        setItens(response.data);
      })
      .catch(error => {
        console.error("Erro ao buscar itens:", error);
      });
  };

  return (
    <div className='hero-section'>
      <div className='itens'>
        {selectedItem && <ItensScreen item={selectedItem} />}
        {selectedItem && <Receita receita={selectedItem.receita} />}
      </div>
      <div className='item-selector'>
        <ul>
          {itens.map((item) => (
            <li key={item.id} onClick={() => handleItemClick(item)}>
              {item.name}
            </li>
          ))}
        </ul>
        <button onClick={() => setIsModalOpen(true)}>Adicionar Novo Item</button>
      </div>

      {/* Modal de adicionar novo item */}
      <AddItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onItemAdded={handleItemAdded}
      />
    </div>
  );
};

export default Home;
