import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { BsX } from 'react-icons/bs';

const Portfolio = () => {
  const [data, setPortfolioData] = useState([]);
  const [wallet, setWallet] = useState(0); // State to hold the wallet balance
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [buySuccess, setBuySuccess] = useState(false);
  const [sellSuccess, setSellSuccess] = useState(false); // New state for sell success
  const [tickerBought, setTickerBought] = useState('');
  const [tickerSold, setTickerSold] = useState(''); // New state for ticker sold
  const portfolioQuantity = data.find(item => item.symbol === data.symbol)?.quantity || 0;

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const response = await axios.get('https://stock-backend-82502.wl.r.appspot.com/portfolioData');
        setPortfolioData(response.data);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      }
    };

    const fetchWalletBalance = async () => {
      try {
        const response = await axios.get('https://stock-backend-82502.wl.r.appspot.com/wallet');
        setWallet(response.data.balance);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    };

    fetchPortfolioData();
    fetchWalletBalance();
  }, []);

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

  // const getTotalPrice = () => {
  //   const currentPrice = data.currentPrice; // Assuming data.quoteData.c contains the current price
  //   return quantity * currentPrice;
  // };

  // Function to check if there's enough money in the wallet
  const hasEnoughMoney = () => {
    return data.currentPrice*quantity <= wallet;
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
    const totalPrice = data.currentPrice*quantity;
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
        symbol: data.symbol,
        name: data.name,
        quantity: quantity,
        totalCost: totalPrice,
        currentPrice: data.currentPrice,
      };

      try {
        // Update wallet balance in the database
        await axios.post('https://stock-backend-82502.wl.r.appspot.com/wallet/update', walletData);

        // Insert or update user portfolio data in the database
        await axios.post('https://stock-backend-82502.wl.r.appspot.com/portfolio', portfolioData);

        console.log("Buying success! New wallet balance:", newWalletBalance);
        setBuySuccess(true);
        setTickerBought(data.symbol);

        // // Check portfolio after buying the stock
        // await checkPortfolio(data.profileData.ticker);

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
    const totalPrice = data.currentPrice*quantity;
    // Prepare data to send to the server to update wallet balance
    const newWalletBalance = wallet + totalPrice;
    const walletData = {
      newBalance: newWalletBalance
    };
  
    // Prepare data to remove from the portfolio in the database
    const portfolioData = {
      symbol: data.symbol,
      name: data.name,
      quantity: quantity,
      totalCost: totalPrice,
      currentPrice: data.currentPrice,
    };
  
    try {
      // Update wallet balance in the database
      await axios.post('https://stock-backend-82502.wl.r.appspot.com/wallet/update', walletData);
  
      // Remove sold shares from the portfolio in the database
      await axios.post('https://stock-backend-82502.wl.r.appspot.com/portfolio/sell', portfolioData);
  
      console.log("Selling success! New wallet balance:", newWalletBalance);
      // Update wallet and quantity states
      setWallet(newWalletBalance);
      setTickerSold(data.symbol);
      // Set sell success message
      setSellSuccess(true);
      setTickerBought(''); // You can remove this line if not needed

      // // Check portfolio after buying the stock
      // await checkPortfolio(data.profileData.ticker);

      // Close the modal
      closeSellModal();
      // Reset quantity
      setQuantity(0);
    } catch (error) {
      console.error("Error updating wallet balance or selling portfolio data:", error);
      // Handle error
    }
  };

  return (
    <div className='Portfolio-container'>
      <div className='Portfolio'>
        <h2>My Portfolio</h2>
        <h5>Money in wallet: ${wallet.toFixed(2)}</h5> {/* Display wallet balance */}
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
        {data.map((item, index) => (
          <div key={index}>
          {/* Card component for portfolio items */}
          <Card>
            {/* Card header */}
            <Card.Header>
              <p><b>{item.symbol}</b> {item.name}</p>
            </Card.Header>
            {/* Card body */}
            <Card.Body>
              <Row id='row'>
                <Col xs={6} md={3} id='col1'>
                  {/* Display quantity, average cost per share, total cost */}
                  <p className="bold-text" style={{ marginBottom: '0', textAlign: 'left' }}>Quantity:</p>
                  <p className="bold-text" style={{ marginBottom: '0', textAlign: 'left' }}>Cost / Share:</p>
                  <p className="bold-text" style={{ marginBottom: '0', textAlign: 'left' }}>Total Cost:</p>
                </Col>
                <Col xs={6} md={3} id='col2'>
                  {/* Display values */}
                  <p className="bold-text" style={{ marginBottom: '0', textAlign: 'left' }}>{parseFloat(item.quantity).toFixed(2)}</p>
                  <p className="bold-text" style={{ marginBottom: '0', textAlign: 'left' }}>{parseFloat(item.averageCostPerShare).toFixed(2)}</p>
                  <p className="bold-text" style={{ marginBottom: '0', textAlign: 'left' }}>{parseFloat(item.totalCost).toFixed(2)}</p>
                </Col>
                <Col xs={6} md={3} id='col3'>
                  {/* Display change, current price, market value */}
                  <p className="bold-text" style={{ marginBottom: '0', textAlign: 'left' }}>Change:</p>
                  <p className="bold-text" style={{ marginBottom: '0', textAlign: 'left' }}>Current Price:</p>
                  <p className="bold-text" style={{ marginBottom: '0', textAlign: 'left' }}>Market Value:</p>
                </Col>
                <Col xs={6} md={3} id='col4'>
                  {/* Display values */}
                  <p style={{ marginBottom: '0', textAlign: 'left' }}>{parseFloat(item.change).toFixed(2)}</p>
                  <p style={{ marginBottom: '0', textAlign: 'left' }}>{parseFloat(item.currentPrice).toFixed(2)}</p>
                  <p style={{ marginBottom: '0', textAlign: 'left' }}>{parseFloat(item.marketValue).toFixed(2)}</p>
                </Col>
              </Row>
            </Card.Body>
            {/* Card footer with buy and sell buttons */}
            {/* <Card.Footer>
                <p style={{ display: 'flex', gap: '10px', justifyContent: 'left' }}>
                  <Button variant="primary" onClick={openBuyModal}>Buy</Button>
                  <Button variant="danger" onClick={openSellModal}>Sell</Button>
                </p>
              </Card.Footer> */}
          </Card>
            {/* Add some space between cards */}
            {buyModalOpen && (
              <div className="moda">
                <div className="moda-content">
                  <span className="clos" onClick={handleCloseModal}>&times;</span>
                  <div>{item.symbol}</div>
                  <div><hr /></div>
                  <div style={{display: 'flex', gap: '5px'}}><div>Current Price:</div><div>{item.currentPrice}</div></div>
                  <div style={{display: 'flex', gap: '5px'}}><div>Money in Wallet:</div><div>${wallet}</div></div>
                  <div style={{display: 'flex', gap: '5px'}}><div>Quantity:</div><div style={{width: '75%'}}><input type="number" style={{ width: '100%', padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }} value={quantity} onChange={handleQuantityChange} /></div></div>
                  {!hasEnoughMoney() && (
                    <div style={{ color: 'red' }}>Not enough money in wallet!</div>
                  )}
                  <div><hr /></div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <div style={{display: 'flex', justifyContent: 'flex-start', width: '50%'}}>Total: {(item.currentPrice*quantity).toFixed(2)}</div>
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
                  <div>{item.symbol}</div>
                  <div><hr /></div>
                  <div style={{display: 'flex', gap: '5px'}}><div>Current Price:</div><div>{item.currentPrice}</div></div>
                  <div style={{display: 'flex', gap: '5px'}}><div>Money in Wallet:</div><div>${wallet}</div></div>
                  <div style={{display: 'flex', gap: '5px'}}><div>Quantity:</div><div style={{width: '75%'}}><input type="number" style={{ width: '100%', padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }} value={quantity} onChange={handleQuantityChange} /></div></div>
                  {/* Error message for insufficient shares or invalid quantity */}
                  {(quantity < 0 || quantity > portfolioQuantity) && (
                    <div style={{ color: 'red' }}>You cannot sell the stocks you don't have!</div>
                  )}
                  <div><hr /></div>  
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <div style={{display: 'flex', justifyContent: 'flex-start', width: '50%'}}>Total: ${(item.currentPrice*quantity).toFixed(2)}</div>
                    <div style={{display: 'flex', justifyContent: 'flex-end', width: '50%'}}><button  disabled={isBuyButtonDisabled()} onClick={handleSell} style={{ backgroundColor: 'green', color: 'white', marginRight: '10px', border: 'none', borderRadius: '5px', padding: '2px', fontSize: '12px', width: '50px', height: '30px', opacity: isSellButtonDisabled() ? '0.5' : '1' }}>Sell</button></div>
                  </div>            
                  </div>
              </div>      
            )}
            <div style={{ marginBottom: '2%' }}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;
