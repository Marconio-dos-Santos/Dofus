import React, { useState } from 'react';
import axios from 'axios';

type CostHistory = {
    amount: number;
    date: string;
};

type Ingredient = {
    name: string;
    quantity: number;
    cost: CostHistory[]; // Updated cost structure
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
    onItemAdded: () => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onItemAdded }) => {
    const [newItem, setNewItem] = useState<Item>({
        id: Date.now(),
        type: '',
        name: '',
        image: '',
        venda: 0,
        receita: []
    });

    const [newIngredient, setNewIngredient] = useState<Ingredient>({
        name: '',
        quantity: 0,
        cost: [] // Initialize as empty array for cost
    });

    const handleAddIngredient = () => {
        if (!newIngredient.name || newIngredient.quantity <= 0 || newIngredient.cost.length === 0) {
            alert("Please fill out the ingredient fields properly.");
            return;
        }
        setNewItem((prevItem) => ({
            ...prevItem,
            receita: [...prevItem.receita, newIngredient]
        }));
        setNewIngredient({ name: '', quantity: 0, cost: [] });
    };

    const handleCostChange = (amount: number) => {
        setNewIngredient({
            ...newIngredient,
            cost: [{ amount, date: new Date().toISOString() }] // Add cost with current date
        });
    };

    const handleSave = () => {
        if (!newItem.name || !newItem.type || newItem.venda <= 0 || newItem.receita.length === 0) {
            alert("Please complete the item details and add at least one ingredient.");
            return;
        }

        axios.post('http://localhost:5000/itens', newItem)
            .then(() => {
                onItemAdded(); // Refresh the item list
                onClose(); // Close the modal
                alert('Item successfully added!');
            })
            .catch(error => {
                console.error('Error adding item:', error);
                alert('Error adding item. Please try again.');
            });
    };

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Add New Item</h2>

                {/* New Item Form */}
                <input 
                    type="text" 
                    placeholder="Type (Ex: Hat)" 
                    value={newItem.type} 
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value })} 
                />
                <input 
                    type="text" 
                    placeholder="Item Name" 
                    value={newItem.name} 
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} 
                />
                <input 
                    type="text" 
                    placeholder="Image URL" 
                    value={newItem.image} 
                    onChange={(e) => setNewItem({ ...newItem, image: e.target.value })} 
                />
                <input 
                    type="number" 
                    placeholder="Selling Price" 
                    value={newItem.venda} 
                    onChange={(e) => setNewItem({ ...newItem, venda: parseFloat(e.target.value) })} 
                />

                {/* New Ingredient Form */}
                <h3>Add Recipe</h3>
                <input 
                    type="text" 
                    placeholder="Ingredient Name" 
                    value={newIngredient.name} 
                    onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })} 
                />
                <input 
                    type="number" 
                    placeholder="Quantity" 
                    value={newIngredient.quantity} 
                    onChange={(e) => setNewIngredient({ ...newIngredient, quantity: parseInt(e.target.value) })} 
                />
                <input 
                    type="number" 
                    placeholder="Ingredient Cost" 
                    onChange={(e) => handleCostChange(parseFloat(e.target.value))}
                />
                <button onClick={handleAddIngredient}>Add Ingredient</button>

                {/* Display added ingredients */}
                <ul>
                    {newItem.receita.map((ingredient, index) => (
                        <li key={index}>
                            {ingredient.quantity}x {ingredient.name} - Cost: R$ {ingredient.cost[0]?.amount.toFixed(2)} (Date: {ingredient.cost[0]?.date})
                        </li>
                    ))}
                </ul>

                <button onClick={handleSave}>Save Item</button>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default AddItemModal;
