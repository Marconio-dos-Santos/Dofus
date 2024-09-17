import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ItensScreen from './itenScreen';
import AddItemModal from './AddItemModal'; // Importa o modal
import Receita from './receita';

type IngredientWithCostArray = {
  name: string;
  quantity: number;
  cost: { amount: number; date: string }[];
};

type ItemWithCostArray = {
  id: number;
  type: string;
  name: string;
  image: string;
  venda: number;
  receita: IngredientWithCostArray[];
};

// Define a interface para as props do Home
interface HomeProps {
  setSelectedItemId: (id: number) => void; // Função para setar o ID do item
}

const Home: React.FC<HomeProps> = ({ setSelectedItemId }) => {
  const [itens, setItens] = useState<ItemWithCostArray[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemWithCostArray | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Controla a visibilidade do modal

  useEffect(() => {
    axios.get('http://localhost:5000/itens')
      .then(response => {
        const updatedItens = response.data.map((item: ItemWithCostArray) => ({
          ...item,
          receita: item.receita.map(ingredient => ({
            ...ingredient,
            cost: [{ amount: ingredient.cost[ingredient.cost.length - 1]?.amount || 0, date: new Date().toISOString() }],
          })),
        }));
        setItens(updatedItens);
        setSelectedItem(updatedItens[0]);  // Set the first item by default
        setSelectedItemId(updatedItens[0].id);  // Set the item ID
      })
      .catch(error => {
        console.error("Erro ao buscar itens:", error);
      });
  }, [setSelectedItemId]);
  
  

  const handleItemClick = (item: ItemWithCostArray) => {
    const updatedItem = {
      ...item,
      receita: item.receita.map(ingredient => ({
        ...ingredient,
        cost: ingredient.cost.map(c => ({
          amount: c.amount,
          date: c.date
        }))
      }))
    };
    setSelectedItem(updatedItem);
    setSelectedItemId(item.id);
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
    <div className='container'>
      <div className='left-section'>
        {selectedItem && <ItensScreen item={selectedItem} />}
      </div>
      <div className='right-section' >
      {selectedItem && <Receita receita={selectedItem.receita} />}
      </div>
      <div className='item-selector'>
      {itens.map((item) => (
  <a key={item.id} onClick={() => handleItemClick(item)}>
    {item.name}
  </a>
))}

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
