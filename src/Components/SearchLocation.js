import React from 'react';
import { useNavigate } from 'react-router-dom';

export const SearchLocation = () => {

    const navigate = useNavigate();

    return (
        <div>
            <h1>SearchLocation</h1>
            <h2>
                <button onClick={() => navigate('/')}>Home</button>
            </h2>
        </div>

    )

}