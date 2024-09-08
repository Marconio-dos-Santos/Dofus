import React, { useState, useEffect } from 'react';
import axios from 'axios';

type Ingredient = {
    name: string;
    quantity: number;
    cost: number;
};

const AddRecursos: React.FC = () => {
    const [newIngredient, setNewIngredient] = useState<Ingredient>({
        name: '',
        quantity: 0,
        cost: 0,
    });
    const [message, setMessage] = useState<string | null>(null); // Para mostrar mensagens de sucesso ou erro

    // Função para lidar com o input do usuário
    const handleInputChange = (field: 'name' | 'quantity' | 'cost', value: string | number) => {
        setNewIngredient((prevIngredient) => ({
            ...prevIngredient,
            [field]: value,
        }));
    };

    // Função para adicionar o ingrediente à lista global
    const handleAddIngredient = () => {
        // Adiciona o novo recurso ao banco de dados
        axios.post('http://localhost:5000/recursos', newIngredient)
            .then(() => {
                setMessage('Recurso adicionado com sucesso!');
                setNewIngredient({ name: '', quantity: 0, cost: 0 }); // Reseta os campos de input
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
                <label>Quantidade:</label>
                <input
                    type="number"
                    value={newIngredient.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                    placeholder="Quantidade"
                />
            </div>

            <div>
                <label>Custo:</label>
                <input
                    type="number"
                    step="0.01"
                    value={newIngredient.cost}
                    onChange={(e) => handleInputChange('cost', parseFloat(e.target.value))}
                    placeholder="Custo do recurso"
                />
            </div>

            <button onClick={handleAddIngredient}>Adicionar Recurso</button>

            {/* Exibir mensagem de sucesso ou erro */}
            {message && <p>{message}</p>}
        </div>
    );
};

export default AddRecursos;
