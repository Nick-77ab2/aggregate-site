import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import getDisasters from './getDisasters';
export const SearchLocation = () => {
    const firstRender = useRef(true);
    const navigate = useNavigate();
    const location = useLocation();
    const cityDatas = location.state?.city;
    const searchLocation = location.state?.search;
    const [currentDisasters, setCurrentDisasters] = useState(); // state to hold currentDisasters
    const [previousDisasters, setPreviousDisasters] = useState(); // state to hold previousDisasters
    const [areDisasters, setAreDisasters] = useState(null); // fix this, we need to know if there are disasters of each type, not just if there are any disasters.
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
    // Used to get the information on the city that was searched
    useEffect(() => {
		const fetchDisasters = async () => {
			if (lat!=null && lon!=null){
			try {
				const { currentDisasters, previousDisasters } = await getDisasters(lat, lon);
				setCurrentDisasters(currentDisasters);
				setPreviousDisasters(previousDisasters);
				console.log("Fetched Current Disasters:", currentDisasters);
				console.log("Fetched Previous Disasters:", previousDisasters);
				//change this to multiple checks for each disaster type based on length of array for type i.e. currentDisasters.earthquakes.length>0 || currentDisasters.floods.length>0 ...
				setAreDisasters(true);
			} catch (error) {
				console.error("Error fetching disasters:", error);
				setAreDisasters(false);
			}
			}
		};
		fetchDisasters();
    }, [lat, lon]);
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
                  {
                    areDisasters===true ? time + " " + type + " near " + city + ": ": "There are no " + time + " " + type + " near " + city + ". ur safe, ur good, go outside."
                  }
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