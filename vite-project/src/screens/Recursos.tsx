import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

type Ingredient = {
    id: number;
    name: string;
    quantity: number;
    cost: number;
};

interface Item {
    id: number;
    type: string;
    name: string;
    receita: Ingredient[];
}

const Recursos: React.FC = () => {
    const { itemId } = useParams<{ itemId: string }>(); // Captura o itemId da URL
    const [item, setItem] = useState<Item | null>(null); // Estado para armazenar o item completo
    const [recursosGlobais, setRecursosGlobais] = useState<Ingredient[]>([]); // Estado para armazenar os recursos globais
    const [allItems, setAllItems] = useState<Item[]>([]); // Estado para armazenar todos os itens

    // Buscar os dados do item específico, a lista de recursos globais e todos os itens
    useEffect(() => {
        if (itemId) {
            // Buscar todos os itens
            axios.get(`http://localhost:5000/itens`)
                .then(response => {
                    setAllItems(response.data); // Armazena todos os itens
                })
                .catch(error => {
                    console.error("Erro ao buscar itens:", error);
                });

            // Buscar os recursos globais
            axios.get(`http://localhost:5000/recursos`)
                .then(response => {
                    setRecursosGlobais(response.data); // Armazena os recursos globais
                })
                .catch(error => {
                    console.error("Erro ao buscar recursos globais:", error);
                });

            // Buscar o item específico
            axios.get(`http://localhost:5000/itens/${itemId}`)
                .then(response => {
                    setItem(response.data); // Armazena o item completo
                })
                .catch(error => {
                    console.error("Erro ao buscar o item:", error);
                });
        }
    }, [itemId]);

    // Função para lidar com mudanças nos inputs
    const handleInputChange = (index: number, field: 'quantity' | 'cost', value: number) => {
        if (!item) return;
        
        // Atualiza a receita do item localmente
        const updatedReceita = [...item.receita];
        updatedReceita[index] = { ...updatedReceita[index], [field]: value };
        setItem({ ...item, receita: updatedReceita });

        // Atualiza o recurso global correspondente
        const globalIndex = recursosGlobais.findIndex((recurso) => recurso.name === updatedReceita[index].name);
        if (globalIndex >= 0) {
            const updatedRecursosGlobais = [...recursosGlobais];
            updatedRecursosGlobais[globalIndex] = { ...updatedRecursosGlobais[globalIndex], [field]: value };
            setRecursosGlobais(updatedRecursosGlobais);
        }
    };

    // Função para salvar os dados atualizados no servidor
    const handleSave = () => {
        if (item) {
            // Atualiza a receita do item específico
            axios.put(`http://localhost:5000/itens/${itemId}`, { ...item, receita: item.receita })
                .then(() => {
                    alert("Receita do item atualizada com sucesso!");
                })
                .catch(error => {
                    console.error("Erro ao atualizar receita do item:", error);
                });

            // Atualize os recursos globais
            Promise.all(
                recursosGlobais.map(recurso =>
                    axios.put(`http://localhost:5000/recursos/${recurso.id}`, recurso)
                )
            )
            .then(() => {
                // Sincroniza os itens que utilizam o recurso atualizado
                const updatedItems = allItems.map((item) => {
                    const updatedReceita = item.receita.map((ingredient) => {
                        const matchingRecurso = recursosGlobais.find((recurso) => recurso.name === ingredient.name);
                        if (matchingRecurso) {
                            return { ...ingredient, quantity: matchingRecurso.quantity, cost: matchingRecurso.cost };
                        }
                        return ingredient;
                    });
                    return { ...item, receita: updatedReceita };
                });

                // Atualiza todos os itens que tiveram seus recursos alterados
                Promise.all(
                    updatedItems.map(item =>
                        axios.put(`http://localhost:5000/itens/${item.id}`, item)
                    )
                )
                .then(() => {
                    alert("Todos os itens foram atualizados com sucesso!");
                })
                .catch(error => {
                    console.error("Erro ao atualizar itens:", error);
                });
            })
            .catch(error => {
                console.error("Erro ao atualizar recursos globais:", error);
            });
        }
    };

    return (
        <div className='receita'>
            <h2>Recursos</h2>
            {item ? (
                <ul>
                    {item.receita.map((ingredient, index) => (
                        <li key={index}>
                            <input
                                type="number"
                                value={ingredient.quantity}
                                onChange={(e) => handleInputChange(index, 'quantity', parseInt(e.target.value))}
                                style={{ width: '50px', marginRight: '10px' }}
                            />
                            {ingredient.name} - 
                            <input
                                type="number"
                                value={ingredient.cost}
                                onChange={(e) => handleInputChange(index, 'cost', parseFloat(e.target.value))}
                                step="0.01"
                                style={{ width: '80px', marginLeft: '10px' }}
                            /> K
                        </li>
                    ))}
                </ul>
            ) : <p>Carregando...</p>}

            <button onClick={handleSave}>Salvar</button>
        </div>
    );
};

export default Recursos;
