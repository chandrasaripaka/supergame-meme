import axios from "axios";

interface WeatherResponse {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_mph: number;
    humidity: number;
    feelslike_c: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
      };
    }>;
  };
}

export async function getWeather(location: string, days = 3): Promise<WeatherResponse> {
  try {
    const apiKey = process.env.WEATHER_API_KEY || "";
    
    if (!apiKey) {
      throw new Error("Weather API key is not configured");
    }

    // Using WeatherAPI.com
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(location)}&days=${days}&aqi=no`;
    
    const response = await axios.get<WeatherResponse>(url);
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch weather: ${response.statusText}`);
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw new Error(`Weather service error: ${error.message}`);
  }
}
