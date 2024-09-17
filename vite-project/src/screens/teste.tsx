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
};

const ManageRecursos: React.FC = () => {
    const [recursosGlobais, setRecursosGlobais] = useState<Ingredient[]>([]);
    const [editedRecursos, setEditedRecursos] = useState<Ingredient[]>([]);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        axios.get('http://localhost:5000/recursos')
            .then(response => {
                const recursosData = response.data;
                setRecursosGlobais(recursosData);
                setEditedRecursos(JSON.parse(JSON.stringify(recursosData)));  // Clone resources for editing
            })
            .catch(error => {
                console.error('Erro ao buscar recursos globais:', error);
            });
    }, []);

    // Handle input changes, but only modify `editedRecursos`
    const handleInputChange = (index: number, field: 'name' | 'cost', value: string | number) => {
        const updatedRecursos = [...editedRecursos];
        if (field === 'cost') {
            updatedRecursos[index] = {
                ...updatedRecursos[index],
                cost: [...updatedRecursos[index].cost, { amount: value as number, date: new Date().toISOString() }]
            };
        } else {
            updatedRecursos[index] = { ...updatedRecursos[index], name: value as string };
        }
        setEditedRecursos(updatedRecursos);  // Only update the edited state
    };

    // Inline cost editing for saved cost history
    const handleCostEdit = (recursoIndex: number, costIndex: number, newAmount: number, newDate: string) => {
        const updatedRecursos = [...editedRecursos];
        updatedRecursos[recursoIndex].cost[costIndex] = { amount: newAmount, date: newDate };
        setEditedRecursos(updatedRecursos);  // Update cost in the edited state
    };

    const handleCostDelete = (recursoIndex: number, costIndex: number) => {
        const updatedRecursos = [...editedRecursos];
        updatedRecursos[recursoIndex].cost = updatedRecursos[recursoIndex].cost.filter((_, idx) => idx !== costIndex);
        setEditedRecursos(updatedRecursos);
    };

    // Save only committed (edited) costs
    const handleSave = () => {
        setRecursosGlobais(editedRecursos);  // Update the main state
        Promise.all(
            editedRecursos.map(recurso =>
                axios.put(`http://localhost:5000/recursos/${recurso.id}`, recurso)
            )
        )
        .then(() => {
            setMessage('Recursos globais atualizados com sucesso!');
        })
        .catch(error => {
            console.error('Erro ao atualizar recursos globais:', error);
            setMessage('Erro ao atualizar recursos globais.');
        });
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
                        value={editedRecursos[recursoIndex].cost[editedRecursos[recursoIndex].cost.length - 1]?.amount || 0} // Show the latest cost
                        onChange={(e) => handleInputChange(recursoIndex, 'cost', parseFloat(e.target.value))}
                        step="0.01"
                        style={{ width: '80px', marginLeft: '10px' }}
                    />
                    <span className="currency">R$</span>

                    {/* Cost History with Date, Edit/Delete */}
                    <div className="cost-history">
                        <p>Histórico de custos:</p>
                        <ul>
                            {recursosGlobais[recursoIndex].cost.map((c, costIndex) => (
                                <li key={costIndex}>
                                    {/* Display only saved cost records */}
                                    <input
                                        type="number"
                                        value={c.amount}
                                        onChange={(e) => handleCostEdit(recursoIndex, costIndex, parseFloat(e.target.value), c.date)}
                                        style={{ width: '80px' }}
                                    />
                                    <input
                                        type="date"
                                        value={c.date ? c.date.split('T')[0] : new Date().toISOString().split('T')[0]} // Fallback to the current date
                                        onChange={(e) => handleCostEdit(recursoIndex, costIndex, c.amount, e.target.value)}
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
