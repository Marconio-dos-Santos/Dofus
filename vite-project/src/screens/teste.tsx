import React, { useEffect, useState } from 'react';
import axios from 'axios';

type CostHistory = {
  amount: number;
  date: string;
};

type Ingredient = {
  name: string;
  quantity: number;
  cost: CostHistory[];
};

type Item = {
  id: string;
  name: string;
  type: string;
  image: string;
  venda: number;
  receita: Ingredient[];
  status: string; // Adicionando status
};

const LojaScreen: React.FC = () => {
  const [lojaItens, setLojaItens] = useState<Item[]>([]);

  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('pt-BR').format(amount);
  };

  useEffect(() => {
    axios.get('http://localhost:5000/loja')
      .then(response => {
        setLojaItens(response.data);
      })
      .catch(error => {
        console.error("Error fetching loja items:", error);
      });
  }, []);

  const calculateTotalCost = (receita: Ingredient[]) => {
    return receita.reduce((total, ingredient) => {
      const latestCost = ingredient.cost[ingredient.cost.length - 1]?.amount || 0;
      return total + latestCost * ingredient.quantity;
    }, 0);
  };

  const toggleStatus = (item: Item) => {
    const updatedStatus = item.status === 'vendido' ? 'na loja' : 'vendido';
    
    // Atualiza o status localmente
    const updatedItems = lojaItens.map(i => 
      i.id === item.id ? { ...i, status: updatedStatus } : i
    );
    setLojaItens(updatedItems);

    // Atualiza no banco de dados
    axios.put(`http://localhost:5000/loja/${item.id}`, { ...item, status: updatedStatus })
      .catch(error => {
        console.error("Erro ao atualizar o status do item:", error);
      });
  };

  return (
    <div>
      <h2>Loja Itens</h2>
      <ul>
        {lojaItens.map(item => {
          const totalCost = calculateTotalCost(item.receita);
          const lucro = item.venda - totalCost;
          const lucroPercentage = (totalCost === 0) ? 0 : (lucro / totalCost) * 100;

          return (
            <li key={item.id}>
              <h3>{item.name}</h3>
              <p>Type: {item.type}</p>
              <img src={item.image} alt={item.name} style={{ width: '100px' }} />
              <h4>Receita:</h4>
              <ul>
                {item.receita.map((ingredient, index) => (
                  <li key={index}>
                    {ingredient.quantity}x {ingredient.name} - Custo: K: {ingredient.cost[0].amount}
                  </li>
                ))}
              </ul>
              <p><strong>Custo Total: K: {formatNumber(totalCost)}</strong></p>
              <p><strong>Venda: K: {formatNumber(item.venda)}</strong></p>
              <span><strong>Lucro: K: {formatNumber(lucro)}   </strong></span>
              <span><strong> -- {formatNumber(lucroPercentage)}% </strong></span>

              <div>
                <strong>Status:</strong> {item.status}
                <button onClick={() => toggleStatus(item)}>
                  {item.status === 'vendido' ? 'Marcar como na loja' : 'Marcar como vendido'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LojaScreen;
