import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

export const getSalesPrediction = async (historicalData, days = 7) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict/sales`, {
      historicalData,
      days
    });
    return response.data;
  } catch (error) {
    console.error('ML Service Error:', error.message);
    return null;
  }
};

export const getDemandForecast = async (productData) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict/demand`, {
      productData
    });
    return response.data;
  } catch (error) {
    console.error('ML Service Error:', error.message);
    return null;
  }
};

export const detectAnomalies = async (salesData) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict/anomaly`, {
      salesData
    });
    return response.data;
  } catch (error) {
    console.error('ML Service Error:', error.message);
    return null;
  }
};

export const getPriceOptimization = async (productData) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/optimize/price`, {
      productData
    });
    return response.data;
  } catch (error) {
    console.error('ML Service Error:', error.message);
    return null;
  }
};

export const getRestockRecommendations = async (inventoryData) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict/restock`, {
      inventoryData
    });
    return response.data;
  } catch (error) {
    console.error('ML Service Error:', error.message);
    return null;
  }
};
