import axios from 'axios';

export const fetchWalletBalance = async (userId) => {
  try {
    // Make a GET request to the /wallet endpoint with the userId as a query parameter
    const response = await axios.get(`https://stock-backend-82502.wl.r.appspot.com/wallet`);
    
    // Extract the wallet balance from the response data
    const walletBalance = response.data?.balance || 0;
    
    return walletBalance;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    throw error;
  }
};
