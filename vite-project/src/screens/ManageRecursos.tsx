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
    const [itens, setItens] = useState<Item[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>(''); // Estado para busca

    useEffect(() => {
        // Fetching global resources
        axios.get('http://localhost:5000/recursos')
            .then(response => {
                const recursosData = response.data;
                setRecursosGlobais(recursosData);
                setEditedRecursos(JSON.parse(JSON.stringify(recursosData)));
            })
            .catch(error => {
                console.error('Erro ao buscar recursos globais:', error);
            });

        // Fetching items that use resources
        axios.get('http://localhost:5000/itens')
            .then(response => {
                setItens(response.data);
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

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const filteredRecursos = recursosGlobais.filter(recurso => 
        recurso.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = () => {
        const updatedRecursos = [...editedRecursos];

        // Update costs
        newCost.forEach((amount, index) => {
            if (amount) {
                updatedRecursos[index].cost = [
                    ...updatedRecursos[index].cost,
                    { amount, date: new Date().toISOString() }
                ];
            }
        });

        setRecursosGlobais(updatedRecursos);

        // Save resources
        Promise.all(
            updatedRecursos.map(recurso =>
                axios.put(`http://localhost:5000/recursos/${recurso.id}`, recurso)
            )
        )
        .then(() => {
            setMessage('Recursos globais atualizados com sucesso!');
            setNewCost(new Map());  // Clear new costs after successful save
        })
        .catch(error => {
            console.error('Erro ao atualizar recursos globais:', error);
            setMessage('Erro ao atualizar recursos globais.');
        });
    };

    const calculateCostStatistics = (costs: CostHistory[]) => {
        if (costs.length === 0) {
            return { min: 0, max: 0, average: 0 };
        }

        const amounts = costs.map(cost => cost.amount);
        const min = Math.min(...amounts);
        const max = Math.max(...amounts);
        const average = amounts.reduce((acc, amount) => acc + amount, 0) / amounts.length;

        return { min, max, average };
    };

    return (
        <div className="global-resource-manager">
            <h2>Gerenciar Recursos Globais</h2>
            <input 
                type="text" 
                placeholder="Buscar recursos..." 
                value={searchTerm} 
                onChange={handleSearchChange} 
                style={{ marginBottom: '20px' }} 
            />
            {filteredRecursos.map((recurso, recursoIndex) => {
                const { min, max, average } = calculateCostStatistics(recurso.cost);

                return (
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
                        <span className="currency">K</span>

                        <div className="cost-history">
                            <p>Histórico de custos:</p>
                            <ul>
                                {recurso.cost.map((c, costIndex) => (
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

                        <div className="cost-stats">
                            <p>Menor custo: {min.toFixed(2)}</p>
                            <p>Maior custo: {max.toFixed(2)}</p>
                            <p>Média dos custos: {average.toFixed(2)}</p>
                        </div>
                    </div>
                );
            })}
            <button className="save-button" onClick={handleSave}>Salvar Alterações</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ManageRecursos;
