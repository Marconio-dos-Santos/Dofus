import React, { useEffect, useState } from 'react';
import axios from 'axios';

type Ingredient = {
    id: any;
    name: string;
    quantity: number;
    cost: number;
};

type Item = {
    id: number;
    type: string;
    name: string;
    receita: Ingredient[];
};

const ManageRecursos: React.FC = () => {
    const [recursosGlobais, setRecursosGlobais] = useState<Ingredient[]>([]);
    const [itens, setItens] = useState<Item[]>([]);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        // Verifique se a URL está correta
        axios.get('http://localhost:5000/recursos')
            .then(response => {
                const recursosData = response.data;
                if (Array.isArray(recursosData)) {
                    setRecursosGlobais(recursosData);
                } else if (recursosData.recursos) {
                    setRecursosGlobais(recursosData.recursos);
                } else {
                    console.error('Formato de dados inesperado para recursos globais:', recursosData);
                }
            })
            .catch(error => {
                console.error('Erro ao buscar recursos globais:', error);
            });

        axios.get('http://localhost:5000/itens')
            .then(response => {
                setItens(response.data);
            })
            .catch(error => {
                console.error('Erro ao buscar itens:', error);
            });
    }, []);

    const handleInputChange = (index: number, field: 'quantity' | 'cost', value: number) => {
        const updatedRecursos = [...recursosGlobais];
        updatedRecursos[index] = { ...updatedRecursos[index], [field]: value };
        setRecursosGlobais(updatedRecursos);
    };

    const synchronizeItemsWithGlobalRecursos = () => {
        const updatedItens = itens.map(item => {
            const updatedReceita = item.receita.map(ingredient => {
                const matchingRecurso = recursosGlobais.find(recurso => recurso.name === ingredient.name);
                if (matchingRecurso) {
                    return { ...ingredient, quantity: matchingRecurso.quantity, cost: matchingRecurso.cost };
                }
                return ingredient;
            });

            return { ...item, receita: updatedReceita };
        });

        updatedItens.forEach(item => {
            const hasChanges = item.receita.some(ingredient =>
                recursosGlobais.some(recurso => recurso.name === ingredient.name)
            );

            if (hasChanges) {
                axios.put(`http://localhost:5000/itens/${item.id}`, item)
                    .catch(error => {
                        console.error(`Erro ao atualizar item ${item.id}:`, error);
                    });
            }
        });
    };

    const handleSave = () => {
        // Atualize cada recurso individualmente
        Promise.all(
            recursosGlobais.map(recurso =>
                axios.put(`http://localhost:5000/recursos/${recurso.id}`, recurso)
            )
        )
        .then(() => {
            setMessage('Recursos globais atualizados com sucesso!');
            synchronizeItemsWithGlobalRecursos();
        })
        .catch(error => {
            console.error('Erro ao atualizar recursos globais:', error);
            setMessage('Erro ao atualizar recursos globais.');
        });
    };
    

    return (
        <div className='manage-recursos'>
            <h2>Gerenciar Recursos Globais</h2>
            <ul>
                {recursosGlobais.map((recurso, index) => (
                    <li key={recurso.id}>
                        <input
                            type="text"
                            value={recurso.name}
                            readOnly
                            style={{ marginRight: '10px' }}
                        />
                        <input
                            type="number"
                            value={recurso.quantity}
                            onChange={(e) => handleInputChange(index, 'quantity', parseInt(e.target.value))}
                            style={{ width: '50px', marginRight: '10px' }}
                        />
                        <input
                            type="number"
                            value={recurso.cost}
                            onChange={(e) => handleInputChange(index, 'cost', parseFloat(e.target.value))}
                            step="0.01"
                            style={{ width: '80px', marginLeft: '10px' }}
                        /> R$
                    </li>
                ))}
            </ul>
            <button onClick={handleSave}>Salvar Alterações</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ManageRecursos;
