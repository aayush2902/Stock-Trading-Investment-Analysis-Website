import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, Row, Col } from 'react-bootstrap';

const Watchlist = () => {
  const [watchlistData, setWatchlistData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlistData();
  }, []);

  const fetchWatchlistData = async () => {
    try {
      const response = await axios.get('https://stock-backend-82502.wl.r.appspot.com/watchlistData');
      setWatchlistData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching watchlist data:', error);
    }
  };

  const handleRemoveFromWatchlist = async (symbol) => {
    try {
      await axios.post(`https://stock-backend-82502.wl.r.appspot.com/watchlist/remove/${symbol}`);
      // After successful removal, refetch watchlist data
      fetchWatchlistData();
    } catch (error) {
      console.error('Error removing stock from watchlist:', error);
    }
  };

  const renderWatchlist = () => {
    if (loading) {
      return <div>Loading...</div>;
    } else if (watchlistData.length === 0) {
      return <div>Watchlist empty.</div>;
    } else {
      return (
        <Row className="g-4">
      {watchlistData.map((item) => (
        <Col key={item.symbol} xs={12}>
          <Card className="watchlist-card">
            <span className="close-btn" onClick={() => handleRemoveFromWatchlist(item.symbol)}>&times;</span>
            <Link to={`/search/${item.symbol}`} style={{ textDecoration: 'none' }}>
              <Card.Body>
                <div className="card-content">
                  <div className="info">
                    <Card.Title>{item.symbol}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{item.name}</Card.Subtitle>
                  </div>
                  <div className="values">
                    <h2 style={{ color: item.dailyChange >= 0 ? 'green' : 'red' }}>
                      {parseFloat(item.currentPrice).toFixed(2)}
                    </h2>
                    <div id='arrow'>
                      <span style={{ fontSize: '20px', color: item.dailyChange >= 0 ? 'green' : 'red' }}>
                        {item.dailyChange >= 0 ? '▲' : '▼'}
                      </span>
                      <h4 style={{ color: item.dailyChange >= 0 ? 'green' : 'red' }}>
                        {parseFloat(item.dailyChange).toFixed(2)} ({parseFloat(item.percentChange).toFixed(2)}%)
                      </h4>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Link>
          </Card>
        </Col>
      ))}
    </Row>
      );
    }
  };

  return (
    <div className="Watchlist-container">
      <div className='Watchlist'>
        <h2>My Watchlist</h2>
        {renderWatchlist()}
      </div>
    </div>
  );
};

export default Watchlist;
