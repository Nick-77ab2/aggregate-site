import axios from 'axios';

export default function GetCityDetails(city) {
    const options = {
        method: 'GET',
        url: 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities/Q60',
        headers: {
          'x-rapidapi-key': '50894cab9dmshc84f5d31c9ed649p12b042jsnbd850e8fdc5f',
          'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com'
        }
      };
    console.log(options.url);

   return axios
   .request(options)
   .then((res) => {
     console.log("wee");
       if (res.status === 200) {
           return { city: res.data.data};
       } else {
           console.error(`API responded with status: ${res.status}`);
           return { city: [] };
       }
   })
   .catch((error) => {
       console.error("Error fetching cities:", error);
       return { city: [] };
   });
}