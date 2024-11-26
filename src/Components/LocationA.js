import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './LocationA.css';

export const LocationA = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const cityDatas = location.state?.city;
    const localCity = cityDatas[0];

    const [type,setType] = useState('');
    const [time,setTime] = useState('');
    const handleNavigate = (cityData, location) => {
        console.log('Navigating with city:', cityData);
        navigate(location, {state: { city: cityData}});
    }
    return (
        <div>
            <h1>Largest Nearby City</h1>
            <h2>
                <button onClick={() => handleNavigate(cityDatas,'/')}>Home</button>
                |
                <button onClick={() => handleNavigate(cityDatas,'/LocationB')}>{cityDatas[1].city}</button>
            </h2>
            { localCity ? (
            <div>
                <h3>{localCity.city}</h3>
                <div className="locationA" >
                <header className='typeParent'><span className='type' onClick={() =>{setType("Earthquakes");} }>Earthquakes</span> | <span className='type' onClick={() =>{setType("Tropical Cyclones");}}>Tropical-Cyclones</span> | <span className='type' onClick={() =>{setType("Floods");}}>Floods</span> | <span className='type' onClick={() =>{setType("Volcanoes");}}>Volcanoes</span> | <span className='type' onClick={() =>{setType("Droughts");}}>Droughts</span> | <span className='type' onClick={() =>{setType("Forest Fires");}}>Forest-Fires</span></header>
                <div className='data'>
                {time} {type} at {localCity.city}
                </div>
                <footer className='timeParent'><span className='time' onClick={() =>{setTime("Past");}}>Past</span> | <span className='time' onClick={() =>{setTime("Current");}}>Current</span> | <span className='time' onClick={() =>{setTime("Future");}}>Future</span></footer>
                </div>
            </div>
            ) : (
                <p>No nearby cities found</p>
            )}
        </div>

    )

}