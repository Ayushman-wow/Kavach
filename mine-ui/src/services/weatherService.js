import axios from 'axios';

/**
 * Fetches current weather data for a specific location.
 * Uses Open-Meteo API (No key required for non-commercial use).
 * 
 * @param {number} lat Latitude
 * @param {number} lng Longitude
 * @returns {Promise<{temp: number, humidity: number, wind: number, conditionCode: number}>}
 */
export const getWeather = async (lat, lng) => {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
        const response = await axios.get(url);

        if (response.data && response.data.current) {
            const current = response.data.current;
            return {
                temp: current.temperature_2m,
                humidity: current.relative_humidity_2m,
                wind: current.wind_speed_10m,
                conditionCode: current.weather_code
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return null; // Handle error gracefully in UI
    }
};
