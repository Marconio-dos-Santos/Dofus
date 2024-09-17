import React, { useState } from 'react';
import axios from 'axios';

type CostHistory = {
    amount: number;
    date: string;
};

type Ingredient = {
    name: string;
    cost: CostHistory[]; // Updated cost structure
};

const AddRecursos: React.FC = () => {
    const [newIngredient, setNewIngredient] = useState<Ingredient>({
        name: '',
        cost: [], // Initialize as an empty array
    });
    const [newCost, setNewCost] = useState<number>(0); // Separate state for the new cost amount
    const [message, setMessage] = useState<string | null>(null);

    // Function to handle input changes
    const handleInputChange = (field: 'name' | 'cost', value: string | number) => {
        if (field === 'name') {
            setNewIngredient((prevIngredient) => ({
                ...prevIngredient,
                name: value as string,
            }));
        } else {
            setNewCost(value as number); // Update the cost state separately
        }
    };

    // Function to add the ingredient to the global list
    const handleAddIngredient = () => {
        const newCostEntry: CostHistory = {
            amount: newCost,
            date: new Date().toISOString(), // Set the current date and time
        };

        const ingredientWithCost: Ingredient = {
            ...newIngredient,
            cost: [...newIngredient.cost, newCostEntry], // Add the cost with amount and date
        };

        // Add the new resource to the database
        axios.post('http://localhost:5000/recursos', ingredientWithCost)
            .then(() => {
                setMessage('Recurso adicionado com sucesso!');
                setNewIngredient({ name: '', cost: [] }); // Reset the input fields
                setNewCost(0); // Reset the cost
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

            {/* Display success or error message */}
            {message && <p>{message}</p>}
        </div>
    );
};

export default AddRecursos;
