import React, { useEffect, useState } from 'react';

type Ingredient = {
    name: string;
    quantity: number;
    cost: number;
};

interface ReceitaProps {
    receita: Ingredient[];
}

const Receita: React.FC<ReceitaProps> = ({ receita }) => {
    const [totalCost, setTotalCost] = useState(0); // Estado para armazenar o custo total

    // Recalcular o custo total da receita sempre que a receita mudar
    useEffect(() => {
        const newTotalCost = receita.reduce((total, ingredient) => {
            return total + (ingredient.cost * ingredient.quantity);
        }, 0);
        setTotalCost(newTotalCost); // Atualiza o estado com o novo custo total
    }, [receita]); // O useEffect é disparado sempre que a prop 'receita' mudar

    return (
        <div className='receita'>
            <h2>Receita</h2>
            <ul>
                {receita.map((ingredient, index) => (
                    <li key={index}>
                        {ingredient.quantity}x {ingredient.name} - Custo: R$ {(ingredient.cost * ingredient.quantity).toFixed(2)}
                    </li>
                ))}
            </ul>
            <h3>Custo Total da Receita: R$ {totalCost.toFixed(2)}</h3>
        </div>
    );
};

export default Receita;
