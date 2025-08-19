import axios from 'axios';
//given a latitude and longitude, this function will return a list of cities within 100km of that location and with a minimum population of 100,000
//it uses the wft-geo-db API
const apiKey = process.env.REACT_APP_RAPID_API_KEY; // Ensure you have set your RapidAPI key in your environment variables
export default function GetCities(lat,lon) {
    console.log(lat,lon);
    var baseUrl = 'https:///wft-geo-db.p.rapidapi.com/v1/geo/locations/';
    var final = '/nearbyCities';
    const options = {
        method: 'GET',
        url: baseUrl + lat.toString() + lon.toString() + final,
        params: {radius: '100', minPopulation: '100000'},
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com'
        }
    };
    console.log(options.url);

   return axios
   .request(options)
   .then((res) => {
       if (res.status === 200) {
           return { otherCities: res.data.data };
       } else {
           console.error(`API responded with status: ${res.status}`);
           return { otherCities: [] };
       }
   })
   .catch((error) => {
       console.error("Error fetching cities:", error);
       return { otherCities: [] };
   });
}