import React, { useState, useEffect, useCallback } from 'react';
import { Form, FormControl, Button } from 'react-bootstrap';
import { BsSearch, BsX } from 'react-icons/bs';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useSearchResults } from './SearchResultContext';
import SearchDetails from './SearchDetails';
import MaterialsTab from './MaterialsTab';

const Home = () => {
  const { searchResults, setSearchResults, setTicker } = useSearchResults(); // Import setTicker
  const [symbol, setSymbol] = useState('');
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const navigate = useNavigate();
  const { ticker } = useParams();
  const [loadingAutocomplete, setLoadingAutocomplete] = useState(false);


  const fetchSearchResults = useCallback(async (query) => {
    try {
      // eslint-disable-next-line
      const [data1Response, data2Response] = await Promise.all([
        axios.get(`https://stock-backend-82502.wl.r.appspot.com/data1?symbol=${query}`),
        axios.get(`https://stock-backend-82502.wl.r.appspot.com/data2?symbol=${query}`)
      ]);

      const combinedData = {
        ...data1Response.data,
        ...data2Response.data
      };
      console.log("home:", combinedData);
      setSearchResults(combinedData);
      setTicker(query); // Update ticker in context
      setSearchError(null);
      localStorage.setItem('previousSymbol', query);
      localStorage.setItem('searchResults', JSON.stringify(combinedData));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [setSearchResults, setTicker]);

  useEffect(() => {
    if (ticker) {
      setSymbol(ticker);
      fetchSearchResults(ticker);
    } else if (ticker === null) {
      // If ticker is null, don't perform any search
      setSymbol('');
      setSearchResults(null);
      setAutocompleteResults([]);
    }
  }, [ticker, fetchSearchResults, setSearchResults]);

  useEffect(() => {
    const targetTime = new Date();
    targetTime.setHours(13, 15, 0); // Set the target time to 13:15:00
  
    const interval = setInterval(() => {
      const currentTime = new Date();
      // Check if the current time is before 13:15:00
      if (currentTime.getTime() < targetTime.getTime()) {
        if (ticker) {
          fetchSearchResults(ticker);
        }
      } else {
        clearInterval(interval); // Clear interval after 13:15:00
      }
    }, 15000); // Fetch data every 15 seconds
  
    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, [ticker, fetchSearchResults]);  


  const handleInputChange = async (event) => {
    const { value } = event.target;
    setSymbol(value);
  
    if (value.trim() !== '') {
      try {
        setLoadingAutocomplete(true); // Set loading state to true
        const response = await axios.get(`https://stock-backend-82502.wl.r.appspot.com/autocomplete?query=${value}`);
        setAutocompleteResults(response.data);
      } catch (error) {
        console.error('Error fetching autocomplete results:', error);
        setAutocompleteResults([]);
      } finally {
        setLoadingAutocomplete(false); // Set loading state to false after fetching
      }
    } else {
      setAutocompleteResults([]);
    }
  };
  

  const handleSubmit = async (event) => {
    event.preventDefault();
    const capitalizedSymbol = symbol.toUpperCase(); // Convert symbol to uppercase
    await fetchSearchResults(capitalizedSymbol);
    setAutocompleteResults([]); // Clear autocomplete results
    navigate(`/search/${capitalizedSymbol}`);
};

  const handleClear = () => {
    localStorage.removeItem('previousSymbol');
    localStorage.removeItem('searchResults');
    setSearchResults(null);
    setSymbol('');
    setTicker(null); // Set ticker to null
    setAutocompleteResults([]); // Clear autocomplete results
    // Use a setTimeout to ensure that state updates are applied before navigation
    setTimeout(() => {
      navigate('/search/home');
    }, 0);
  };
  
  const handleAutocompleteSelection = async (selectedSymbol) => {
    setSymbol(selectedSymbol);
    setAutocompleteResults([]);
    await fetchSearchResults(selectedSymbol);
    const route = `/search/${selectedSymbol}`;
    navigate(route);
  };

  return (
    <div className="search-page">
      <div style={{ fontSize: '40px', fontWeight: '350' }}>STOCK SEARCH</div>
      <div className="search-bar-container">
        <Form onSubmit={handleSubmit} className="search-bar" style={{ border: '2.5px solid darkblue', borderRadius: '30px', padding: '3px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', width: '450px' }}>
            <FormControl
              type="text"
              value={symbol}
              onChange={handleInputChange}
              placeholder="Enter stock ticker symbol"
              className="mr-2 rounded-start"
              style={{ border: 'none', flexGrow: '1' }}
            />
            <Button type="submit" variant="primary" className="rounded-0" style={{ backgroundColor: 'white', color: 'darkblue', border: 'none', padding: '5px', outline: 'none' }}>
              <BsSearch />
            </Button>
            <Button type="button" onClick={handleClear} variant="secondary" className="rounded-end" style={{ backgroundColor: 'white', color: 'darkblue', border: 'none', paddingLeft: '1px', paddingRight: '7.5px', outline: 'none' }}>
              <BsX style={{ fontSize: '1.5em' }} />
            </Button>
          </div>
        </Form>

        {loadingAutocomplete && (
          <div className="autocomplete-container" style={{ maxHeight: '200px', overflowY: 'scroll' }}>
            <ul className="autocomplete-list">
              <div className="spinner-border" role="status" style={{color: 'blue'}}>
                <span className="sr-only"></span>
              </div>
            </ul>
          </div>
        )}

        {!(loadingAutocomplete) && autocompleteResults.length > 0 && (
          <div className="autocomplete-container" style={{ maxHeight: '200px', overflowY: 'scroll' }}>
            <ul className="autocomplete-list">
              {loadingAutocomplete && (
                <div className="spinner-border" role="status">
                  <span className="sr-only"></span>
                </div>
              )}
              {autocompleteResults.map((result) => (
                <li key={result.displaySymbol} onClick={() => handleAutocompleteSelection(result.displaySymbol)}>
                  {result.displaySymbol} | {result.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className='Container'>
        {searchError && <div className="error-message">{searchError}</div>}
        {/* Render SearchDetails */}
        {searchResults && <SearchDetails data={searchResults} />}
        {/* Render MaterialsTab */}
        {/* Pass the appropriate data to the MaterialsTab component */}
        {searchResults && <MaterialsTab data={searchResults} />}
      </div>
    </div>
  );
};

export default Home;
