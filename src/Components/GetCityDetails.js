import { fromAddress, setDefaults } from "react-geocode";
// This function fetches the geolocation of a city using the Google Maps Geocoding API
// It returns the latitude and longitude of the city
// Ensure you have the react-geocode package installed and configured with your API key
export async function GetCityDetails(city) {
  setDefaults({
    key: "AIzaSyB_TUdD_4OY1NNfxfK7HrPOvc7rwx__Z4Q",
    language: "en",
    region: "US",
  });
  try {
    const { results } = await fromAddress(city.toString());
    if (results && results.length > 0) {
      return results[0].geometry.location; // Return the geolocation directly
    } else {
      throw new Error("No results found for the given city");
    }
  } catch (error) {
    console.error("Error fetching city details:", error);
    return null; // Return null in case of an error
  }
}