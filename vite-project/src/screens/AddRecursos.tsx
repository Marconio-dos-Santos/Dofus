import React, { useState, useEffect } from 'react';
import axios from 'axios';

type CostHistory = {
    amount: number;
    date: string;
};

type Ingredient = {
    name: string;
    cost: CostHistory[];
    type: string; // Add the type field
};

const AddRecursos: React.FC = () => {
    const [newIngredient, setNewIngredient] = useState<Ingredient>({
        name: '',
        cost: [],
        type: '', // Initialize with an empty string for type
    });
    const [newCost, setNewCost] = useState<number>(0);
    const [existingResources, setExistingResources] = useState<Ingredient[]>([]);
    const [message, setMessage] = useState<string | null>(null);

    // Fetch existing resources
    useEffect(() => {
        axios.get('http://localhost:5000/recursos')
            .then(response => setExistingResources(response.data))
            .catch(error => console.error('Erro ao buscar recursos:', error));
    }, []);

    const handleInputChange = (field: 'name' | 'cost' | 'type', value: string | number) => {
        if (field === 'name') {
            setNewIngredient((prevIngredient) => ({
                ...prevIngredient,
                name: value as string,
            }));
        } else if (field === 'cost') {
            setNewCost(value as number);
        } else {
            setNewIngredient((prevIngredient) => ({
                ...prevIngredient,
                type: value as string, // Update the type field
            }));
        }
    };

    const handleAddIngredient = () => {
        const exists = existingResources.some(
            (resource) => resource.name.toLowerCase() === newIngredient.name.toLowerCase()
        );

        if (exists) {
            setMessage('Recurso já existe!');
            return;
        }

        const newCostEntry: CostHistory = {
            amount: newCost,
            date: new Date().toISOString(),
        };

        const ingredientWithCost: Ingredient = {
            ...newIngredient,
            cost: [...newIngredient.cost, newCostEntry],
        };

        axios.post('http://localhost:5000/recursos', ingredientWithCost)
            .then(() => {
                setMessage('Recurso adicionado com sucesso!');
                setNewIngredient({ name: '', cost: [], type: '' });
                setNewCost(0);
                setExistingResources([...existingResources, ingredientWithCost]);
            })
            .catch((error) => {
                console.error('Erro ao adicionar recurso:', error);
                setMessage('Erro ao adicionar recurso.');
            });
    };

    return (
        <div className="add-recursos">
            <h2>Adicionar Novo Recurso</h2>

            <div>
                <label>Nome do Recurso:</label>
                <input
                    type="text"
                    value={newIngredient.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nome do recurso"
                />
            </div>

            <div>
                <label>Tipo do Recurso:</label>
                <select
                    value={newIngredient.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                >
                    <option value="">Selecione um tipo</option>
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
            </div>

            <div>
                <label>Custo:</label>
                <input
                    type="number"
                    step="0.01"
                    value={newCost}
                    onChange={(e) => handleInputChange('cost', parseFloat(e.target.value))}
                    placeholder="Custo do recurso"
                />
            </div>

            <button onClick={handleAddIngredient}>Adicionar Recurso</button>

            {message && <p>{message}</p>}
        </div>
    );
};

export default AddRecursos;
