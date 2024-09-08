import React, { useState } from 'react';
import axios from 'axios';

type Ingredient = {
    name: string;
    quantity: number;
    cost: number;
};

interface Item {
    id: number;
    type: string;
    name: string;
    image: string;
    venda: number;
    receita: Ingredient[];
}

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onItemAdded: () => void; // Callback para atualizar a lista de itens após adicionar
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onItemAdded }) => {
    const [newItem, setNewItem] = useState<Item>({
        id: Date.now(), // Gerando um ID único baseado no timestamp
        type: '',
        name: '',
        image: '',
        venda: 0,
        receita: []
    });

    const [newIngredient, setNewIngredient] = useState<Ingredient>({
        name: '',
        quantity: 0,
        cost: 0
    });

    const handleAddIngredient = () => {
        setNewItem((prevItem) => ({
            ...prevItem,
            receita: [...prevItem.receita, newIngredient]
        }));
        setNewIngredient({ name: '', quantity: 0, cost: 0 }); // Reseta o ingrediente após adicionar
    };

    const handleSave = () => {
        axios.post('http://localhost:5000/itens', newItem)
            .then(() => {
                onItemAdded(); // Atualiza a lista de itens após adicionar
                onClose(); // Fecha o modal
                alert('Item adicionado com sucesso!');
            })
            .catch(error => {
                console.error('Erro ao adicionar item:', error);
            });
    };

    if (!isOpen) return null; // Não renderiza o modal se ele não estiver aberto

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Adicionar Novo Item</h2>

                {/* Formulário para o novo item */}
                <input 
                    type="text" 
                    placeholder="Tipo (Ex: Hat)" 
                    value={newItem.type} 
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value })} 
                />
                <input 
                    type="text" 
                    placeholder="Nome do Item" 
                    value={newItem.name} 
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} 
                />
                <input 
                    type="text" 
                    placeholder="URL da Imagem" 
                    value={newItem.image} 
                    onChange={(e) => setNewItem({ ...newItem, image: e.target.value })} 
                />
                <input 
                    type="number" 
                    placeholder="Valor de Venda" 
                    value={newItem.venda} 
                    onChange={(e) => setNewItem({ ...newItem, venda: parseFloat(e.target.value) })} 
                />

                {/* Formulário para adicionar um novo ingrediente */}
                <h3>Adicionar Receita</h3>
                <input 
                    type="text" 
                    placeholder="Nome do Ingrediente" 
                    value={newIngredient.name} 
                    onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })} 
                />
                <input 
                    type="number" 
                    placeholder="Quantidade" 
                    value={newIngredient.quantity} 
                    onChange={(e) => setNewIngredient({ ...newIngredient, quantity: parseInt(e.target.value) })} 
                />
                <input 
                    type="number" 
                    placeholder="Custo do Ingrediente" 
                    value={newIngredient.cost} 
                    onChange={(e) => setNewIngredient({ ...newIngredient, cost: parseFloat(e.target.value) })} 
                />
                <button onClick={handleAddIngredient}>Adicionar Ingrediente</button>

                {/* Exibe os ingredientes adicionados */}
                <ul>
                    {newItem.receita.map((ingredient, index) => (
                        <li key={index}>
                            {ingredient.quantity}x {ingredient.name} - Custo: R$ {ingredient.cost.toFixed(2)}
                        </li>
                    ))}
                </ul>

                <button onClick={handleSave}>Salvar Item</button>
                <button onClick={onClose}>Fechar</button>
            </div>
        </div>
    );
};

export default AddItemModal;
