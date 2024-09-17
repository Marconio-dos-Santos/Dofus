import React, { useState, useEffect } from 'react';
import axios from 'axios';

type IngredientWithCostNumber = {
    name: string;
    quantity: number;
    cost: { amount: number; date: string }[];
};
  
  type ItemWithCostNumber = {
    id: number;
    type: string;
    name: string;
    image: string;
    venda: number;
    receita: IngredientWithCostNumber[];
  };
  

const ItensScreen: React.FC<{ item: ItemWithCostNumber }> = ({ item }) => {
    const [venda, setVenda] = useState<number>(item.venda); // Estado para armazenar o valor de venda editável
    const [totalCost, setTotalCost] = useState<number>(0); // Estado para o custo total

    const formatNumber = (amount: number) => {
        return new Intl.NumberFormat('pt-BR').format(amount);
      };

    // Recalcular o custo total da receita sempre que a receita do item mudar
    useEffect(() => {
        const calculateTotalCost = () => {
            const cost = item.receita.reduce((total, ingredient) => {
                const latestCost = ingredient.cost[ingredient.cost.length - 1]?.amount || 0;
                return total + latestCost * ingredient.quantity
            }, 0);
            setTotalCost(cost);
        };

        calculateTotalCost(); // Calcula o custo total quando o componente é montado ou atualizado
    }, [item.receita]); // Dependência é a receita do item

    // Calcular o lucro (venda - custo total)
    const lucro = item.venda - totalCost;

    // Função para salvar a nova venda no json-server
    const handleSave = () => {
        // Atualiza o item com o novo valor de venda
        const updatedItem = { ...item, venda };

        // Envia a requisição PUT para salvar a venda no json-server
        axios.put(`http://localhost:5000/itens/${item.id}`, updatedItem)
            .then(() => {
                alert("Valor de venda atualizado com sucesso!");
            })
            .catch(error => {
                console.error("Erro ao salvar o valor de venda:", error);
            });
    };

    return (
        <div className='iten'>
            <h1 className='iten-type'>{item.type}</h1>
            <div className='iten-info'>
                <h2 className='iten-name'>{item.name}</h2>
                <img src={item.image} alt={item.name} />
                
                <p>
                    Venda: 
                    <input 
                        type="number"
                        value={item.venda} // Controlado pelo estado de venda
                        onChange={(e) => setVenda(parseFloat(e.target.value))}
                        style={{ width: '80px', marginLeft: '10px' }}
                    /> - K
                </p>
                
                <p>Custo Total: K : {formatNumber(totalCost)}</p>
                <p>Lucro: K : {formatNumber(lucro)}</p>
                <button onClick={handleSave}>Salvar</button>
            </div>
        </div>
    );
};

export default ItensScreen;
