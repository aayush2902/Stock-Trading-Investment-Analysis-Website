import React, { createContext, useContext, useState } from 'react';

const SearchResultContext = createContext();

export const SearchResultProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState(null);
  const [ticker, setTicker] = useState(null); // Add ticker state

  return (
    <SearchResultContext.Provider value={{ searchResults, setSearchResults, ticker, setTicker }}>
      {children}
    </SearchResultContext.Provider>
  );
};

export const useSearchResults = () => useContext(SearchResultContext);
