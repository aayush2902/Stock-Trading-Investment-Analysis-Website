import React, { useState, useEffect } from 'react';
import './App.css';
import { Chart1, Chart3, Chart4 } from './Charts.js';
import Chart2 from './BigChart.js'
import { useNavigate } from 'react-router-dom';


const MaterialsTab = ({ data }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedNews, setSelectedNews] = useState(null); // State to store the selected news item
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal window
  const navigate = useNavigate();
  
  // useEffect for selectedNews
  useEffect(() => {
  }, [selectedNews]);

  // useEffect for isModalOpen
  useEffect(() => {
  }, [isModalOpen]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const openModal = (news) => {
    setSelectedNews(news);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedNews(null);
    setIsModalOpen(false);
  };

  // Function to aggregate values of a specific key
function aggregateValues(dataArray, key) {
  return dataArray.reduce((total, item) => total + item[key], 0);
}

// Function to aggregate positive values of a specific key
function aggregatePositiveValues(dataArray, key) {
  return dataArray.reduce((total, item) => {
    if (item[key] > 0) {
      return total + item[key];
    } else {
      return total;
    }
  }, 0);
}

// Function to aggregate negative values of a specific key
function aggregateNegativeValues(dataArray, key) {
  return dataArray.reduce((total, item) => {
    if (item[key] < 0) {
      return total + item[key];
    } else {
      return total;
    }
  }, 0);
}


  return (
    <div>
      {/* Tab Buttons */}
      <div className='MaterialsContainer'>
        <div>
          <button
            className="transparent-button"
            style={{
              borderBottom: activeTab === 'summary' ? '2px solid darkblue' : 'none',
              color: activeTab === 'summary' ? 'darkblue' : 'grey'
            }}
            onClick={() => handleTabClick('summary')}>
            Summary
          </button>
        </div>
        <div>
          <button
            className="transparent-button"
            style={{
              borderBottom: activeTab === 'topNews' ? '2px solid darkblue' : 'none',
              color: activeTab === 'topNews' ? 'darkblue' : 'grey'
            }}
            onClick={() => handleTabClick('topNews')}>
            Top News
          </button>
        </div>
        <div>
          <button
            className="transparent-button"
            style={{
              borderBottom: activeTab === 'charts' ? '2px solid darkblue' : 'none',
              color: activeTab === 'charts' ? 'darkblue' : 'grey'
            }}
            onClick={() => handleTabClick('charts')}>
            Charts
          </button>
        </div>
        <div>
          <button
            className="transparent-button"
            style={{
              borderBottom: activeTab === 'insights' ? '2px solid darkblue' : 'none',
              color: activeTab === 'insights' ? 'darkblue' : 'grey'
            }}
            onClick={() => handleTabClick('insights')}>
            Insights
          </button>
        </div>
      </div>

      {/* Content for each tab */}
      {activeTab === 'summary' && (
        <div id='summary-div'>
          {/* Summary content */}
          <br />
          <div className='Summary-container'>
            <div className='PricesAbout-Container'>
              <div className='Prices-container'>
                <div className='Prices'><div style={{ fontWeight: '500' }}>High Price: </div><div>{data.quoteData.h}</div></div>
                <div className='Prices'><div style={{ fontWeight: '500' }}>Low Price: </div><div>{data.quoteData.l}</div></div>
                <div className='Prices'><div style={{ fontWeight: '500' }}>Open Price: </div><div>{data.quoteData.o}</div></div>
                <div className='Prices'><div style={{ fontWeight: '500' }}>Prev. Close: </div><div>{data.quoteData.pc}</div></div>
              </div>
              <div className='About-container'>
                <div style={{textDecoration: 'underline', fontSize: '17.5px', fontWeight: '500', marginBottom: '3vh' }}>About the company</div>
                <div className='About'><div style={{ fontWeight: '500' }}>IPO Start Date:</div><div>{data.profileData.ipo}</div></div>
                <div className='About'><div style={{ fontWeight: '500' }}>Industry:</div><div>{data.profileData.finnhubIndustry}</div></div>
                <div className='About'><div style={{ fontWeight: '500' }}>Webpage:</div><div><a href={data.profileData.weburl} target='blank'>{data.profileData.weburl}</a></div></div>
                <div><div style={{ fontWeight: '500' }}>Company Peers:</div></div>
                <div className='peers'>
                  {data.peersData.map((peer, index) => (
                    <div key={index} onClick={() => navigate(`/search/${peer}`)} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline', fontSize: '12px' }}>
                      {peer}
                    </div>
                   ))}
                </div>
              </div>
            </div>
            <div id='summary-chart' style={{height: '40vh'}}>
              <Chart1 data1={data} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'topNews' && (
        <div className='Topnews-container'>
          <br />
          <div className='Newscard-container'>
            {/* Display cards for each news item with non-empty image */}
            {data.newsData.filter(item => item.image !== "").slice(0, 20).map((item, index) => (
              <div key={index} className="news-card" onClick={() => { openModal(item); }}>
                {/* Render image if available */}
                {item.image && <div id='News-img'><img src={item.image} alt="News" height='60px' width='110px' style={{ borderRadius: '5px' }} /></div>}
                {/* Render title */}
                <div><div>{item.headline}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}
      {isModalOpen && selectedNews && (
        <div className="moda">
          <div className="moda-content">
            <span className="clos" onClick={closeModal}>&times;</span>
            <div style={{ fontSize: '25px', fontWeight: '500' }}>{selectedNews.source}</div>
            {/* Convert Unix timestamp to milliseconds */}
            <div style={{ fontSize: '14px', fontWeight: '400' }}>{new Date(selectedNews.datetime * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <hr />
            <div style={{ fontSize: '17px', fontWeight: '500' }}>{selectedNews.headline}</div>
            {/* <div><strong>API reference:</strong> <a href={selectedNews.source}>{selectedNews.source}</a></div> */}
            <div style={{ fontSize: '12px'}}>{selectedNews.summary}</div>
            <div style={{ fontSize: '12px', color: 'grey'}}>For more details click <a href={selectedNews.url} target='blank'>here</a></div>
            <br />
            <br />
            <div className='Share-social'>
              <div>Share</div>
              <div className='share-buttons'>
                <div>
                  {/* Twitter share button */}
                  <a className="twitter-share-button" href={`https://twitter.com/intent/tweet?text=${selectedNews.headline}&url=${selectedNews.url}`} target="_blank" rel="noopener noreferrer"><img src="https://logos-world.net/wp-content/uploads/2023/08/X-Logo.png" alt='Twitter logo' style={{height: '25px', width: '40px'}}/></a>
                </div>
                <div>
                  {/* Facebook share button */}
                  <a className="fb-share-button" href={`https://www.facebook.com/sharer/sharer.php?u=${selectedNews.url}`} target="_blank" rel="noopener noreferrer"><img src="https://i.pinimg.com/originals/ce/d6/6e/ced66ecfc53814d71f8774789b55cc76.png" alt='Facebook logo' style={{height: '30px', width: '30px'}}/></a>
                </div>              
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'charts' && (
        <div id='charts-container'>
          <div id='charts'>
            {/* Charts content */}
            <br />
            <div style={{height: '100vh'}}>
              <Chart2 data2={data} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div id='insights-container'>
          <div id='insights'>
            {/* Insights content */}
            <br />
            <div style={{ fontSize: '20px', fontWeight: '500', textAlign: 'center', marginBottom: '2vh'}}>Insider Sentiments</div>
            <div className='insider-table'>
              <div className='insider-rows'>
                <div className='insider-heading'>{data.profileData.name}</div>
                <div className='insider-heading'>MSPR</div>
                <div className='insider-heading'>Change</div>
              </div>
              <div className='insider-rows'>
                <div className='insider-heading'>Total</div>
                <div>{parseFloat(aggregateValues(data.insightsData.data, 'mspr')).toFixed(2)}</div>
                <div>{aggregateValues(data.insightsData.data, 'change')}</div>
              </div>
              <div className='insider-rows'>
                <div className='insider-heading'>Positive</div>
                <div>{parseFloat(aggregatePositiveValues(data.insightsData.data, 'mspr')).toFixed(2)}</div>
                <div>{aggregatePositiveValues(data.insightsData.data, 'change')}</div>
              </div>
              <div className='insider-rows'>
                <div className='insider-heading'>Negative</div>
                <div>{parseFloat(aggregateNegativeValues(data.insightsData.data, 'mspr')).toFixed(2)}</div>
                <div>{aggregateNegativeValues(data.insightsData.data, 'change')}</div>
              </div>
            </div>
            <div id='insights-charts'>
              <div className='insightsChart'>
                <Chart3 Data3={data} />
              </div>
              <div className='insightsChart'>
                <Chart4 Data4={data} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsTab;