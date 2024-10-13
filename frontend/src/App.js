import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from './NavBar';
import Home from './Home';
import Watchlist from './Watchlist';
import Portfolio from './Portfolio';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; // Import Navigate
import { SearchResultProvider } from './SearchResultContext'

const App = () => {

  return (
    <Router>
      <SearchResultProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<Navigate to="/search/home" />} /> {/* Use Navigate for redirection */}
          <Route path="/search/home" element={<Home />} />
          <Route path="/search/:ticker" element={<Home />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
        {/* Footer */}
        <div className="footer">
          <div style={{fontSize: '12px', fontWeight: '600'}}>Powered by </div>
          <div style={{fontSize: '12px', fontWeight: '600',color: 'light-blue', textDecoration: 'underline'}}>
            <a href="https://finnhub.io/">Finnhub.io</a>
          </div>
        </div>
      </SearchResultProvider>
    </Router>
  );
};

export default App;
