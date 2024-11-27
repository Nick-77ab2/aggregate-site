import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GetCityDetails from './GetCityDetails';
export const SearchLocation = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const cityDatas = location.state?.city;
    const searchLocation = location.state?.search;
    const [city, setCity] = useState([]);
    const hasFetched = useRef(false); // UseRef to track if the API call has been made

    useEffect(() => {
        const fetchCity = async () => {
            if (!hasFetched.current && searchLocation?.trim().length > 0) {
                hasFetched.current = true; // Set the flag
                try {
                    console.log("Fetching city details for:", searchLocation);
                    const theCity = await GetCityDetails(searchLocation);
                    setCity(theCity);
                    console.log("Fetched city:", theCity);
                } catch (error) {
                    console.error("Error fetching city details:", error);
                }
            }
        };

        fetchCity();
    }, [searchLocation]);

    const handleNavigate = (cityData, location) => {
        //console.log('Navigating with city:', cityData);
        navigate(location, {state: { city: cityData}});

    }
    if(city!=null && city.city!=null){
    return (
        <div>
            <h1> Information on {city.city.city}:</h1>
            <h2>
                <button onClick={() => handleNavigate(cityDatas,'/')}>Home</button>
            </h2>
        </div>

    )
    }
    else{
        return <h1>Loading...</h1>
    }


}