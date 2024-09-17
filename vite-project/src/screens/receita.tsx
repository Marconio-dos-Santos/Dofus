import React from 'react';

type Ingredient = {
  name: string;
  quantity: number;
  cost: { amount: number; date: string }[];
};

interface ReceitaProps {
  receita: Ingredient[];
}


const Receita: React.FC<ReceitaProps> = ({ receita }) => {
    const formatNumber = (amount: number) => {
        return new Intl.NumberFormat('pt-BR').format(amount);
      };
      
      
  const totalCost = receita.reduce((total, ingredient) => {
    const latestCost = ingredient.cost[ingredient.cost.length - 1]?.amount || 0;
    return total + latestCost * ingredient.quantity;
  }, 0);
  return (
    <div className="receita">
      <h2>Receita</h2>
      <ul>
        {receita.map((ingredient, index) => (
          <li key={index}>
            {ingredient.quantity}x {ingredient.name} - Custo: K : {formatNumber(ingredient.cost[ingredient.cost.length - 1]?.amount || 0)}
          </li>
        ))}
      </ul>
      <h3>Custo Total da Receita: K : {formatNumber(totalCost)}</h3>
    </div>
  );
};

export default Receita;
