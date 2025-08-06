import axios from "axios";
import { useEffect, useState } from 'react';

export default function useGeoLocation() {
    const [geolocation, setGeolocation] = useState(null);
    useEffect(() => {
        getGeolocation();}, []);
    // Function to fetch geolocation data
    // This function uses the IP-API to get the geolocation based on the user's IP address
    // It returns an object containing city, country, latitude, longitude, etc.
    async function getGeolocation() {
        const res = await axios.get("http://ip-api.com/json");
        console.log(res);
        if (res.status === 200)
            setGeolocation(res.data);
        }
        return{
            city: geolocation?.city,
            country: geolocation?.country,
            countryCode: geolocation?.countryCode,
            lat: geolocation?.lat,
            lon: geolocation?.lon,
            region: geolocation?.region,
            regionCode: geolocation?.regionCode,
            timezone: geolocation?.timezone,
            zip: geolocation?.zip
        }
}