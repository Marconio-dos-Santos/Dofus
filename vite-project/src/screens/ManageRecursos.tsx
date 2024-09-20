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
    type: string;  // Add type field to differentiate resources
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
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');  // State for selected type

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

    const filteredRecursos = recursosGlobais
        .filter(recurso => recurso.name.toLowerCase().includes(searchTerm.toLowerCase()))  // Filter by name
        .filter(recurso => selectedType === '' || recurso.type === selectedType);  // Filter by selected type

    const synchronizeItemsWithGlobalRecursos = () => {
        const updatedItens = itens.map(item => {
            const updatedReceita = item.receita.map((ingredient) => {
                const matchingRecurso = recursosGlobais.find(recurso => recurso.name === ingredient.name);
                if (matchingRecurso) {
                    const latestCost = matchingRecurso.cost[matchingRecurso.cost.length - 1];
                    return {
                        ...ingredient,
                        cost: matchingRecurso.cost,
                        quantity: ingredient.quantity
                    };
                }
                return ingredient;
            });
            return { ...item, receita: updatedReceita };
        });

        updatedItens.forEach(item => {
            axios.put(`http://localhost:5000/itens/${item.id}`, item)
                .catch(error => {
                    console.error(`Erro ao atualizar item ${item.id}:`, error);
                });
        });
    };

    const handleSave = () => {
        const updatedRecursos = [...editedRecursos];

        newCost.forEach((amount, index) => {
            if (amount) {
                updatedRecursos[index].cost = [
                    ...updatedRecursos[index].cost,
                    { amount, date: new Date().toISOString() }
                ];
            }
        });

        setRecursosGlobais(updatedRecursos);

        Promise.all(
            updatedRecursos.map(recurso =>
                axios.put(`http://localhost:5000/recursos/${recurso.id}`, recurso)
            )
        )
        .then(() => {
            setMessage('Recursos globais atualizados com sucesso!');
            setNewCost(new Map());
            synchronizeItemsWithGlobalRecursos();
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

            {/* Search by name */}
            <input
                type="text"
                placeholder="Buscar recurso"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: '20px', padding: '5px', width: '200px' }}
            />

            {/* Dropdown to filter by type */}
            <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{ marginBottom: '20px', padding: '5px' }}
            >
                <option value="">Todos os Tipos</option>
                <option value="raiz">Raiz</option>
                <option value="broto">Broto</option>
                <option value="âmbar">Âmbar</option>
                <option value="casca">Casca</option>
                <option value="recurso">Recurso</option>
                <option value="lã">Lã</option>
                <option value="couro">Couro</option>
                <option value="osso">Osso</option>
                <option value="perna">Perna</option>
                <option value="cauda">Cauda</option>
                <option value="tecido">Tecido</option>
            </select>

            {filteredRecursos.map((recurso, recursoIndex) => {
    const { min, max, average } = calculateCostStatistics(recurso.cost);

    const editedRecursoIndex = editedRecursos.findIndex(
        (editedRecurso) => editedRecurso.id === recurso.id
    );

    return (
        <div key={recurso.id} className="resource-row">
            <input
                type="text"
                value={editedRecursos[editedRecursoIndex]?.name || ''}
                onChange={(e) => handleInputChange(editedRecursoIndex, 'name', e.target.value)}
                style={{ marginRight: '10px' }}
            />
            <input
                type="number"
                placeholder="Novo custo"
                value={newCost.get(editedRecursoIndex) || ''}
                onChange={(e) => handleInputChange(editedRecursoIndex, 'cost', e.target.value)}
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
