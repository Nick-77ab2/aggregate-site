import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LocationA = () => {

    const navigate = useNavigate();

    return (
        <div>
            <h1>LocationA</h1>
            <h2>
                <button onClick={() => navigate('/')}>Home</button>
                |
                <button onClick={() => navigate('/LocationB')}>Location B</button>
            </h2>
        </div>

    )

}