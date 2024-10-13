import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchWalletBalance } from './Global.js'; // Update the import path
import Button from 'react-bootstrap/Button';
import { BsX } from 'react-icons/bs';
import axios from 'axios';

const SearchDetails = ({ data }) => {
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [wallet, setWallet] = useState(0);
  const [buySuccess, setBuySuccess] = useState(false);
  const [sellSuccess, setSellSuccess] = useState(false); // New state for sell success
  const [tickerBought, setTickerBought] = useState('');
  const [tickerSold, setTickerSold] = useState(''); // New state for ticker sold
  const [inWatchlist, setInWatchlist] = useState(false);
  const [hasShares, setHasShares] = useState(false); // New state to track if user has shares
  const [portfolioData, setPortfolioData] = useState([]);
  const portfolioQuantity = portfolioData.find(item => item.symbol === data.profileData.ticker)?.quantity || 0;


  useEffect(() => {
    // Fetch wallet balance when component mounts
    const fetchWallet = async () => {
      try {
        const balance = await fetchWalletBalance();
        setWallet(balance);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    };
    fetchWallet();
  }, []);

  // Fetch inWatchlist state from backend when component mounts
  useEffect(() => {
    if (data && data.profileData) {
      checkWatchlist(data.profileData.ticker);
    }
    // eslint-disable-next-line
  }, [data]);
  
  useEffect(() => {
    if (inWatchlist) {
      const targetTime = new Date();
      targetTime.setHours(13, 15, 0); // Set the target time to 13:15:00
  
      const interval = setInterval(async () => {
        const currentTime = new Date();
        // Check if the current time is before 13:15:00
        if (currentTime.getTime() < targetTime.getTime()) {
          try {
            const watchlistData = {
              symbol: data.profileData.ticker,
              name: data.profileData.name,
              currentPrice: data.quoteData.c,
              dailyChange: data.quoteData.d,
              percentChange: data.quoteData.dp
            };
            console.log("watchlistData:", watchlistData);
            await axios.post('https://stock-backend-82502.wl.r.appspot.com/watchlist/add', watchlistData);
          } catch (error) {
            console.error('Error updating data:', error);
          }
        } else {
          clearInterval(interval); // Clear interval after 13:15:00
        }
      }, 15000);
  
      // Clear interval on component unmount
      return () => clearInterval(interval);
    }
  }, [data, inWatchlist]);
  
  useEffect(() => {
    if (hasShares) {
      const targetTime = new Date();
      targetTime.setHours(13, 15, 0); // Set the target time to 13:15:00
  
      const interval = setInterval(async () => {
        const currentTime = new Date();
        // Check if the current time is before 13:15:00
        if (currentTime.getTime() < targetTime.getTime()) {
          try {
            const totalPrice = data.quoteData.c * quantity;
            const portfolioData = {
              symbol: data.profileData.ticker,
              name: data.profileData.name,
              quantity: quantity,
              totalCost: totalPrice,
              currentPrice: data.quoteData.c,
            };
            console.log("portfolioData:", portfolioData);
            await axios.post('https://stock-backend-82502.wl.r.appspot.com/portfolio', portfolioData);
          } catch (error) {
            console.error('Error updating data:', error);
          }
        } else {
          clearInterval(interval); // Clear interval after 13:15:00
        }
      }, 15000);
  
      // Clear interval on component unmount
      return () => clearInterval(interval);
    }
  }, [data, quantity, hasShares]);
  
  

  const checkWatchlist = async (symbol) => {
    try {
      const response = await axios.get(`https://stock-backend-82502.wl.r.appspot.com/watchlist/check/${symbol}`);
      setInWatchlist(response.data.inWatchlist);
      await checkPortfolio(symbol);
    }   catch (error) {
      console.error('Error checking watchlist or portfolio:', error);
    }
  };

  const checkPortfolio = async (symbol) => {
    try {
      const portfolioResponse = await axios.get(`https://stock-backend-82502.wl.r.appspot.com/portfolioData`);
      setPortfolioData(portfolioResponse.data);
      setPortfolioData(portfolioResponse.data);
      const hasSharesForSymbol = portfolioResponse.data.some(item => item.symbol === symbol && item.quantity > 0);
      setHasShares(hasSharesForSymbol);
    } catch (error) {
      console.error('Error checking portfolio:', error);
    }
  };

  const handleStarClick = async () => {
    try {
      if (inWatchlist) {
        // Remove from watchlist
        await axios.post(`https://stock-backend-82502.wl.r.appspot.com/watchlist/remove/${data.profileData.ticker}`); // Adjust the endpoint as per your backend
      } else {
        // Add to watchlist
        const watchlistData = {
          symbol: data.profileData.ticker,
          name: data.profileData.name,
          currentPrice: data.quoteData.c,
          dailyChange: data.quoteData.d, // Include daily change
          percentChange: data.quoteData.dp // Include percent change
        };
        await axios.post('https://stock-backend-82502.wl.r.appspot.com/watchlist/add', watchlistData); // Adjust the endpoint as per your backend
      }
      setInWatchlist(!inWatchlist); // Toggle the state
    } catch (error) {
      console.error('Error adding/removing from watchlist:', error);
    }
  };


  const handleQuantityChange = (event) => {
    // Update the quantity state when the input changes
    setQuantity(parseInt(event.target.value));
  };

  const openBuyModal = () => {
    setBuyModalOpen(true);
    setBuySuccess(false);
    setTickerBought('');
  };

  const closeBuyModal = () => {
    setBuyModalOpen(false);
  };

  const openSellModal = () => {
    setSellModalOpen(true);
    setBuySuccess(false);
    setTickerBought('');
  };

  const closeSellModal = () => {
    setSellModalOpen(false);
  };

  const getTotalPrice = () => {
    const currentPrice = data.quoteData.c; // Assuming data.quoteData.c contains the current price
    return quantity * currentPrice;
  };

  // Function to check if there's enough money in the wallet
  const hasEnoughMoney = () => {
    return getTotalPrice() <= wallet;
  };

  const isBuyButtonDisabled = () => {
    return quantity < 1 || !quantity || !hasEnoughMoney();
  };

  const isSellButtonDisabled = () => {
    return quantity < 1 || !quantity || quantity > portfolioQuantity;
  };
  
  // Function to reset quantity state
  const resetQuantity = () => {
    setQuantity(0);
  };

  // Function to close modal and reset quantity
  const handleCloseModal = () => {
    resetQuantity(); // Reset quantity every time modal is closed
    closeBuyModal();
    closeSellModal();
  };
  
  // Function to handle buy button click
  const handleBuy = async () => {
    const totalPrice = getTotalPrice();
    if (totalPrice <= wallet) {
      // Deduct total price from wallet balance
      const newWalletBalance = wallet - totalPrice;
      setWallet(newWalletBalance);

      // Prepare data to send to the server to update wallet balance
      const walletData = {
        newBalance: newWalletBalance
      };

      // Prepare data to insert/update in the portfolio in the database
      const portfolioData = {
        symbol: data.profileData.ticker,
        name: data.profileData.name,
        quantity: quantity,
        totalCost: totalPrice,
        currentPrice: data.quoteData.c,
      };

      try {
        // Update wallet balance in the database
        await axios.post('https://stock-backend-82502.wl.r.appspot.com/wallet/update', walletData);

        // Insert or update user portfolio data in the database
        await axios.post('https://stock-backend-82502.wl.r.appspot.com/portfolio', portfolioData);

        console.log("Buying success! New wallet balance:", newWalletBalance);
        setBuySuccess(true);
        setTickerBought(data.profileData.ticker);

        // Check portfolio after buying the stock
        await checkPortfolio(data.profileData.ticker);

        // Close the modal
        closeBuyModal();
        // Reset quantity
        setQuantity(0);
      } catch (error) {
        console.error("Error updating wallet balance or saving portfolio data:", error);
        // Handle error
      }
    } else {
      console.log("Not enough money in wallet!");
      // Handle the case where there is not enough money in the wallet
    }
  };
  
  const handleSell = async () => {
    const totalPrice = getTotalPrice();
    // Prepare data to send to the server to update wallet balance
    const newWalletBalance = wallet + totalPrice;
    const walletData = {
      newBalance: newWalletBalance
    };
  
    // Prepare data to remove from the portfolio in the database
    const portfolioData = {
      symbol: data.profileData.ticker,
      name: data.profileData.name,
      quantity: quantity,
      totalCost: totalPrice,
      currentPrice: data.quoteData.c,
    };
  
    try {
      // Update wallet balance in the database
      await axios.post('https://stock-backend-82502.wl.r.appspot.com/wallet/update', walletData);
  
      // Remove sold shares from the portfolio in the database
      await axios.post('https://stock-backend-82502.wl.r.appspot.com/portfolio/sell', portfolioData);
  
      console.log("Selling success! New wallet balance:", newWalletBalance);
      // Update wallet and quantity states
      setWallet(newWalletBalance);
      setTickerSold(data.profileData.ticker);
      // Set sell success message
      setSellSuccess(true);
      setTickerBought(''); // You can remove this line if not needed

      // Check portfolio after buying the stock
      await checkPortfolio(data.profileData.ticker);

      // Close the modal
      closeSellModal();
      // Reset quantity
      setQuantity(0);
    } catch (error) {
      console.error("Error updating wallet balance or selling portfolio data:", error);
      // Handle error
    }
  };

  // Function to calculate market status based on timestamp
  const calculateMarketStatus = (timestamp) => {
    // Get current date and time
    const currentDate = new Date();
    const currentTime = currentDate.getTime();

    // Define market opening and closing times (Assuming market opens at 9:30 AM and closes at 4:00 PM)
    const marketOpeningTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 9, 30).getTime();
    const marketClosingTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 16, 0).getTime();

    // Check if the current time is within market hours
    if (currentTime >= marketOpeningTime && currentTime <= marketClosingTime) {
      return 'open';
    } else {
      return 'closed';
    }
  };

  // Calculate market status based on timestamp
  const marketStatus = data ? calculateMarketStatus(data.quoteData.t) : null;

  // Define styles based on market status
  const marketStatusStyle = {
    color: marketStatus === 'open' ? 'green' : 'red',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  // Define triangle symbol based on data.quoteData.d
  const triangleSymbol = data && data.quoteData.d >= 0 ? '▲' : '▼';

  return (
    <div>
      {buySuccess && (
        <div style={{display:'flex', background: 'darkseagreen', opacity: '0.75', color: 'black', padding: '10px', textAlign: 'center', borderRadius: '5px', marginTop: '5vh', marginBottom: '-2.5vh'}}>  
          <div style={{display: 'flex', width:'100%', justifyContent: 'center', alignItems: 'center'}}>
            {tickerBought} bought successfully
          </div>  
          <div style={{display: 'flex', justifyContent: 'flex-end'}}>  
            <Button type="button" onClick={() => {setBuySuccess(false); setTickerBought('');}} variant="secondary" className="rounded-end" style={{ backgroundColor: 'darkseagreen', opacity: '0.75', color: 'darkblue', border: 'none', paddingLeft: '1px', paddingRight: '7.5px', outline: 'none' }}>
              <BsX style={{ fontSize: '1.5em' }} />
            </Button>
          </div>  
        </div>
      )}
      
      {sellSuccess && (
        <div style={{display:'flex', background: 'lightcoral', opacity: '0.75', color: 'black', padding: '10px', textAlign: 'center', borderRadius: '5px', marginTop: '5vh', marginBottom: '-2.5vh'}}>  
          <div style={{display: 'flex', width:'100%', justifyContent: 'center', alignItems: 'center'}}>
            {tickerSold} sold successfully
          </div>  
          <div style={{display: 'flex', justifyContent: 'flex-end'}}>  
            <Button type="button" onClick={() => {setSellSuccess(false); setTickerSold('');}} variant="secondary" className="rounded-end" style={{ backgroundColor: 'lightcoral', opacity: '0.75', color: 'darkred', border: 'none', paddingLeft: '1px', paddingRight: '7.5px', outline: 'none' }}>
              <BsX style={{ fontSize: '1.5em' }} />
            </Button>
          </div>  
        </div>
      )}

      {/* Display relevant information from the data prop */}
      {data && data.profileData && (
        <div className='searchContainer'>
          <div id='Profile'>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'}}>
              <div><h2>{data.profileData.ticker}</h2></div>
              <svg
            onClick={handleStarClick}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={inWatchlist ? "yellow" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-star"
            style={{ cursor: "pointer" }} // Set cursor to pointer
          >
            <path
              d="M12 2L15.09 8.22L22 9.27L17 14.14L18.18 21.02L12 18.77L5.82 21.02L7 14.14L2 9.27L8.91 8.22L12 2Z"
            ></path>
          </svg>
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h4>{data.profileData.name}</h4></div>
            <div style={{fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{data.profileData.exchange}</div>
            <div style={{marginTop: '5px'}}>
              <button onClick={openBuyModal} style={{ backgroundColor: 'green', color: 'white', marginRight: '10px', border: 'none', borderRadius: '5px', padding: '2px', fontSize: '12px', width: '50px', height: '30px' }}>Buy</button>
              {hasShares && (
                <button onClick={openSellModal} style={{ backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px', padding: '2px', fontSize: '12px', width: '50px', height: '30px' }}>Sell</button>
              )}
            </div>
          </div>
          <div id='Logo' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div id='logo-img'><img src={data.profileData.logo} alt="Company Logo" height='75px' width='75px'/></div>
            {/* Display calculated market status with conditional styling */}
            <div style={marketStatusStyle}>
              {marketStatus === 'open' ? 'Market open' : 'Market closed'}
            </div>
          </div>
          <div id='Quote'>
            {/* Additional information from quote data */}
            <div>
              <h2 style={{ color: data.quoteData.d >= 0 ? 'green' : 'red' }}>
                {parseFloat(data.quoteData.c).toFixed(2)}
              </h2>
            </div> {/* Current price */}
            <div id='arrow'>
              {/* Render triangle symbol based on data.quoteData.d */}
              <div id='arrow1'>
                <span style={{ fontSize: '20px', color: data.quoteData.d >= 0 ? 'green' : 'red' }}>{triangleSymbol}</span>
              </div>
              <div id='arrow2'>
                <h4 style={{ color: data.quoteData.d >= 0 ? 'green' : 'red' }}>
                  {parseFloat(data.quoteData.d).toFixed(2)} ({parseFloat(data.quoteData.dp).toFixed(2)}%)
                </h4>
              </div>
            </div> {/* Change in price (perc change) */}
            {new Date(data.quoteData.t * 1000).getFullYear()}-{('0' + (new Date(data.quoteData.t * 1000).getMonth() + 1)).slice(-2)}-
            {('0' + new Date(data.quoteData.t * 1000).getDate()).slice(-2)} {' '}
            {('0' + new Date(data.quoteData.t * 1000).getHours()).slice(-2)}:
            {('0' + new Date(data.quoteData.t * 1000).getMinutes()).slice(-2)}:
            {('0' + new Date(data.quoteData.t * 1000).getSeconds()).slice(-2)}
          </div>
          {/* Add more information as needed */}
        </div>
      )}
      {/* Modal for Buy */}
      {buyModalOpen && (
        <div className="moda">
          <div className="moda-content">
            <span className="clos" onClick={handleCloseModal}>&times;</span>
            <div>{data.profileData.ticker}</div>
            <div><hr /></div>
            <div style={{display: 'flex', gap: '5px'}}><div>Current Price:</div><div>{data.quoteData.c}</div></div>
            <div style={{display: 'flex', gap: '5px'}}><div>Money in Wallet:</div><div>{parseFloat(wallet).toFixed(2)}</div></div>
            <div style={{display: 'flex', gap: '5px'}}><div>Quantity:</div><div style={{width: '75%'}}><input type="number" style={{ width: '100%', padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }} value={quantity} onChange={handleQuantityChange} /></div></div>
            {!hasEnoughMoney() && (
              <div style={{ color: 'red' }}>Not enough money in wallet!</div>
            )}
            <div><hr /></div>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{display: 'flex', justifyContent: 'flex-start', width: '50%'}}>Total: ${getTotalPrice().toFixed(2)}</div>
              <div style={{display: 'flex', justifyContent: 'flex-end', width: '50%'}}><button  disabled={isBuyButtonDisabled()} onClick={handleBuy} style={{ backgroundColor: 'green', color: 'white', marginRight: '10px', border: 'none', borderRadius: '5px', padding: '2px', fontSize: '12px', width: '50px', height: '30px', opacity: isBuyButtonDisabled() ? '0.5' : '1' }}>Buy</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Sell */}
      {sellModalOpen && (
        <div className="moda">
          <div className="moda-content">
            <span className="clos" onClick={handleCloseModal}>&times;</span>
            <div>{data.profileData.ticker}</div>
            <div><hr /></div>
            <div style={{display: 'flex', gap: '5px'}}><div>Current Price:</div><div>{data.quoteData.c}</div></div>
            <div style={{display: 'flex', gap: '5px'}}><div>Money in Wallet:</div><div>{parseFloat(wallet).toFixed(2)}</div></div>
            <div style={{display: 'flex', gap: '5px'}}><div>Quantity:</div><div style={{width: '75%'}}><input type="number" style={{ width: '100%', padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }} value={quantity} onChange={handleQuantityChange} /></div></div>
            {/* Error message for insufficient shares or invalid quantity */}
            {(quantity < 0 || quantity > portfolioQuantity) && (
              <div style={{ color: 'red' }}>You cannot sell the stocks you don't have!</div>
            )}
            <div><hr /></div>  
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{display: 'flex', justifyContent: 'flex-start', width: '50%'}}>Total: ${getTotalPrice().toFixed(2)}</div>
              <div style={{display: 'flex', justifyContent: 'flex-end', width: '50%'}}><button  disabled={isBuyButtonDisabled()} onClick={handleSell} style={{ backgroundColor: 'green', color: 'white', marginRight: '10px', border: 'none', borderRadius: '5px', padding: '2px', fontSize: '12px', width: '50px', height: '30px', opacity: isSellButtonDisabled() ? '0.5' : '1' }}>Sell</button></div>
            </div>            
            </div>
        </div>
      )}
    </div>
  );  
};

export default SearchDetails;
