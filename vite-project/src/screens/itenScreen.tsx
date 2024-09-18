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
    const [venda, setVenda] = useState<number>(item.venda);
    const [totalCost, setTotalCost] = useState<number>(0);

    const formatNumber = (amount: number) => {
        return new Intl.NumberFormat('pt-BR').format(amount);
    };

    useEffect(() => {
        const calculateTotalCost = () => {
            const cost = item.receita.reduce((total, ingredient) => {
                const latestCost = ingredient.cost[ingredient.cost.length - 1]?.amount || 0;
                return total + latestCost * ingredient.quantity;
            }, 0);
            setTotalCost(cost);
        };

        calculateTotalCost();
    }, [item.receita]);

    const lucro = item.venda - totalCost;

    const handleSave = () => {
        const updatedItem = { ...item, venda };

        axios.put(`http://localhost:5000/itens/${item.id}`, updatedItem)
            .then(() => alert("Valor de venda atualizado com sucesso!"))
            .catch(error => console.error("Erro ao salvar o valor de venda:", error));
    };

    // New function to save the item to the store
    const handleSaveToLoja = () => {
        const itemToSave = { ...item, venda, receita: item.receita };
      
        axios.post('http://localhost:5000/loja', itemToSave)
          .then(() => {
            alert("Item saved to loja successfully!");
          })
          .catch(error => {
            console.error("Error saving item to loja:", error);
          });
      };
      

    return (
        <div className='iten'>
            <h1 className='iten-type'>{item.type}</h1>
            <div className='iten-info'>
                <h2 className='iten-name'>{item.name}</h2>
                <img src={item.image} alt={item.name} />
                
                <p>
                    Venda: {item.venda}
                    <input 
                        type="number"
                        value={venda } 
                        onChange={(e) => setVenda(parseFloat(e.target.value))}
                        style={{ width: '80px', marginLeft: '10px' }}
                    /> - K
                </p>
                
                <p>Custo Total: K {formatNumber(totalCost)}</p>
                <p>Lucro: K {formatNumber(lucro)}</p>
                <button onClick={handleSave}>Salvar</button>

                {/* Button to save the item to the store */}
                <button onClick={handleSaveToLoja} style={{ marginTop: '10px' }}>Salvar na Loja</button>
            </div>
        </div>
    );
};

export default ItensScreen;
