import React, { useState, useEffect } from 'react';
import axios from 'axios';

type CostHistory = {
    amount: number;
    date: string;
};

type Ingredient = {
    name: string;
    cost: CostHistory[];
};

const AddRecursos: React.FC = () => {
    const [newIngredient, setNewIngredient] = useState<Ingredient>({
        name: '',
        cost: [],
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

    const handleInputChange = (field: 'name' | 'cost', value: string | number) => {
        if (field === 'name') {
            setNewIngredient((prevIngredient) => ({
                ...prevIngredient,
                name: value as string,
            }));
        } else {
            setNewCost(value as number);
        }
    };

    const handleAddIngredient = () => {
        // Check if the resource name already exists
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
                setNewIngredient({ name: '', cost: [] });
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
