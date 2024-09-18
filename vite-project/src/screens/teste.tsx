import React, { useEffect, useState } from 'react';
import axios from 'axios';

type CostHistory = {
    amount: number;
    date: string;
};

type Ingredient = {
    id: any;
    name: string;
    cost: CostHistory[];
    quantity: number;
};

type Item = {
    id: number;
    type: string;
    name: string;
    receita: Ingredient[];
};

const ManageRecursos: React.FC = () => {
    const [recursosGlobais, setRecursosGlobais] = useState<Ingredient[]>([]);
    const [editedRecursos, setEditedRecursos] = useState<Ingredient[]>([]);
    const [newCost, setNewCost] = useState<Map<number, number>>(new Map());
    const [itens, setItens] = useState<Item[]>([]); // Estado para armazenar todos os itens
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        axios.get('http://localhost:5000/recursos')
            .then(response => {
                const recursosData = response.data;
                setRecursosGlobais(recursosData);
                setEditedRecursos(JSON.parse(JSON.stringify(recursosData)));
            })
            .catch(error => {
                console.error('Erro ao buscar recursos globais:', error);
            });
            axios.get('http://localhost:5000/itens')
            .then(response => {
                setItens(response.data); // Armazena todos os itens
            })
            .catch(error => {
                console.error('Erro ao buscar itens:', error);
            });
    }, []);

    const handleInputChange = (index: number, field: 'name' | 'cost', value: string | number) => {
        const updatedRecursos = [...editedRecursos];
        if (field === 'name') {
            updatedRecursos[index].name = value as string;
            setEditedRecursos(updatedRecursos);
        } else if (field === 'cost') {
            handleCostChange(index, parseFloat(value as string));
        }
    };

    const handleCostChange = (index: number, value: number) => {
        setNewCost(prevNewCost => new Map(prevNewCost).set(index, value));
    };

    const handleCostDelete = (recursoIndex: number, costIndex: number) => {
        const updatedRecursos = [...editedRecursos];
        updatedRecursos[recursoIndex].cost = updatedRecursos[recursoIndex].cost.filter((_, idx) => idx !== costIndex);
        setEditedRecursos(updatedRecursos);
    };

    const handleSave = async () => {
        const updatedRecursos = [...editedRecursos];
      
        // Apply new costs to the resources
        newCost.forEach((amount, index) => {
          if (amount) {
            updatedRecursos[index].cost = [
              ...updatedRecursos[index].cost,
              { amount, date: new Date().toISOString() }
            ];
          }
        });
      
        setRecursosGlobais(updatedRecursos);
      
        try {
          // First, update the resources
          await Promise.all(
            updatedRecursos.map(recurso =>
              axios.put(`http://localhost:5000/recursos/${recurso.id}`, recurso)
            )
          );
      
          // Once resources are updated, synchronize the items with the updated resource data
          const updatedItens = itens.map(item => {
            const updatedReceita = item.receita.map((ingredient) => {
              const matchingRecurso = updatedRecursos.find(recurso => recurso.name === ingredient.name);
              if (matchingRecurso) {
                return { ...ingredient, quantity: matchingRecurso.quantity, cost: matchingRecurso.cost };
              }
              return ingredient; // No changes if resource isn't found
            });
            return { ...item, receita: updatedReceita };
          });
      
          // Update each item individually in the server
          await Promise.all(
            updatedItens.map(item =>
              axios.put(`http://localhost:5000/itens/${item.id}`, item)
            )
          );
      
          setMessage('Recursos e itens atualizados com sucesso!');
          setNewCost(new Map());  // Clear new costs after successful save
      
        } catch (error) {
          console.error('Erro ao atualizar recursos e itens:', error);
          setMessage('Erro ao atualizar recursos e itens.');
        }
      };
      

    return (
        <div className="global-resource-manager">
            <h2>Gerenciar Recursos Globais</h2>
            {recursosGlobais.map((recurso, recursoIndex) => (
                <div key={recurso.id} className="resource-row">
                    <input
                        type="text"
                        value={editedRecursos[recursoIndex].name}
                        onChange={(e) => handleInputChange(recursoIndex, 'name', e.target.value)}
                        style={{ marginRight: '10px' }}
                    />

                    <input
                        type="number"
                        placeholder="Novo custo"
                        value={newCost.get(recursoIndex) || ''}
                        onChange={(e) => handleInputChange(recursoIndex, 'cost', e.target.value)}
                        step="0.01"
                        style={{ width: '80px', marginLeft: '10px' }}
                    />
                    <span className="currency">R$</span>

                    <div className="cost-history">
                        <p>Histórico de custos:</p>
                        <ul>
                            {recursosGlobais[recursoIndex].cost.map((c, costIndex) => (
                                <li key={costIndex}>
                                    <input
                                        type="number"
                                        value={c.amount}
                                        readOnly
                                        style={{ width: '80px' }}
                                    />
                                    <input
                                        type="date"
                                        value={c.date.split('T')[0]}
                                        readOnly
                                        style={{ marginLeft: '10px' }}
                                    />
                                    <button onClick={() => handleCostDelete(recursoIndex, costIndex)}>Deletar</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
            <button className="save-button" onClick={handleSave}>Salvar Alterações</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ManageRecursos;
