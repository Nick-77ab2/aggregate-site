import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
export const SearchLocation = () => {
    const firstRender = useRef(true);
    const navigate = useNavigate();
    const location = useLocation();
    const cityDatas = location.state?.city;
    const searchLocation = location.state?.search;
    const [city, setCity] = useState();
    const [lat, setLat] = useState();
    const [lon, setLon] = useState();

    const [type,setType] = useState('Earthquakes');
    const [time,setTime] = useState('Current');

    useEffect(() => {
        if(firstRender.current && city==null){
            console.log("We're setting things up");
            setCity(searchLocation.location);
            setLat(searchLocation.lat);
            setLon(searchLocation.lng);
            firstRender.current = false;
        }
    }, [searchLocation,city]);
    const handleNavigate = (cityData, location) => {
        //console.log('Navigating with city:', cityData);
        navigate(location, {state: { city: cityData}});

    }
    if(city!=null){
    return (
        <div>
            <h1> Information on {city}:</h1>
            <div className='coords'> lat: {lat} lon: {lon}</div>
            <h2>
                <button onClick={() => handleNavigate(cityDatas,'/')}>Home</button>
            </h2>
            <div>
                  <h3>{city}</h3>
                  <div className="yourlocation" >
                  <header className='typeParent'><span className='type' onClick={() =>{setType("Earthquakes");} }>Earthquakes</span> | <span className='type' onClick={() =>{setType("Tropical Cyclones");}}>Tropical-Cyclones</span> | <span className='type' onClick={() =>{setType("Floods");}}>Floods</span> | <span className='type' onClick={() =>{setType("Volcanoes");}}>Volcanoes</span> | <span className='type' onClick={() =>{setType("Droughts");}}>Droughts</span> | <span className='type' onClick={() =>{setType("Forest Fires");}}>Forest-Fires</span></header>
                  <div className='data'>
                  {time} {type} near {city} { /* placeholders */}
                  </div>
                  <footer className='timeParent'><span className='time' onClick={() =>{setTime("Past");}}>Past</span> | <span className='time' onClick={() =>{setTime("Current");}}>Current</span> | <span className='time' onClick={() =>{setTime("Future");}}>Future</span></footer>
                  </div>
              </div>
        </div>

    )
    }
    else{
        return <h1>Loading...</h1>
    }


}