import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LocationB = () => {

    const navigate = useNavigate();

    return (
        <div>
            <h1>LocationB</h1>
            <h2>
                <button onClick={() => navigate('/')}>Home</button>
                |
                <button onClick={() => navigate('/LocationA')}>Location A</button>
            </h2>
        </div>

    )

}