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

  const calculateProfit = (venda: number, totalCost: number) => {
    return venda - totalCost;
  };

  const calculateProfitPercentage = (venda: number, totalCost: number) => {
    if (totalCost === 0) return 0; // Avoid division by zero
    return (calculateProfit(venda, totalCost) / totalCost) * 100;
  };

  return (
    <div>
      <h2>Loja Itens</h2>
      <ul>
        {lojaItens.map(item => {
          const totalCost = calculateTotalCost(item.receita);
          const lucro = calculateProfit(item.venda, totalCost);
          const lucroPercentage = calculateProfitPercentage(item.venda, totalCost);


          return (
            <li key={item.id}>
    
              <h3>{item.id}</h3>
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
              <p><strong>Venda: K: {formatNumber(item.venda)}</strong></p> {/* Ensure unique venda value */}
              <span><strong>Lucro: K: {formatNumber(lucro)}   </strong></span>
              <span><strong> -- {formatNumber(lucroPercentage)}% </strong></span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LojaScreen;
