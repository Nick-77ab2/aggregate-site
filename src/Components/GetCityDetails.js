
// import axios from 'axios';
import {
    fromAddress,
    setDefaults
} from "react-geocode";

//AIzaSyB_TUdD_4OY1NNfxfK7HrPOvc7rwx__Z4Q

export default function GetCityDetails(city) {
    setDefaults({
        key: "AIzaSyB_TUdD_4OY1NNfxfK7HrPOvc7rwx__Z4Q",
        language: "en",
        region: "US",
    });
    fromAddress(city.toString())
    .then(({ results }) => {
        const { lat, lng } = results[0].geometry.location;
        console.log(lat, lng);
        return{ lat: lat, lng: lng };
        //TODO: FIX THIS IT DOESN'T RETURN CORRECTLY
      })
      .catch(console.error);
    /*
    var baseUrl = 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities/'
    var final = 'Q60';
    const options = {
        method: 'GET',
        url: baseUrl + final.toString(),
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
   */
}