import axios from "axios";

import { apiKey } from "../utils/constants";

const forecastEndpoint = (params: any) => `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${params.days}&aqi=no&alerts=no`

const locationEndpoint = (params: any) => `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}`

const apiCall = async (endpoint: any) => {
    const options = {
        method: 'GET',
        url: endpoint
    }

    try {

        const response = await axios.request(options);
        return response.data;
        
    } catch (error) {
        console.log('error ',error);
        return null
    }
}

export const fetchWeatherForecast = (params:any) => {
    return apiCall(forecastEndpoint(params));
} 

export const fetchLocations = (params:any) => {
    return apiCall(locationEndpoint(params));
} 