import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSearchResults } from './SearchResultContext';

const NavBar = () => {
  const { ticker } = useSearchResults();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: 'darkblue', paddingLeft: '40px', paddingRight: '40px' }}>
      <div className="container-fluid">
        <div className="navbar-brand">Stock Search</div>
        <button className="navbar-toggler" type="button" onClick={handleToggle}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse justify-content-end ${isExpanded ? 'show' : ''}`}>
          <ul className="navbar-nav">
            <li className="nav-item" style={{fontSize: '13px'}}>
              <NavLink className="nav-link" activeClassName="active" to={ticker ? `/search/${ticker}` : "/search/home"} onClick={() => setIsExpanded(false)}>Search</NavLink>
            </li>
            <li className="nav-item" style={{fontSize: '13px'}}>
              <NavLink className="nav-link" activeClassName="active" to="/watchlist" onClick={() => setIsExpanded(false)}>Watchlist</NavLink>
            </li>
            <li className="nav-item" style={{fontSize: '13px'}}>
              <NavLink className="nav-link" activeClassName="active" to="/portfolio" onClick={() => setIsExpanded(false)}>Portfolio</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
