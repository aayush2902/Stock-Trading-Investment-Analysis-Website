import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// Import necessary Highcharts modules
// import HC_indicators from 'highcharts/indicators/indicators';
// import HC_vbp from 'highcharts/indicators/volume-by-price';
// import HC_candlestick from 'highcharts/modules/stock';

// HC_candlestick(Highcharts);
// HC_indicators(Highcharts);
// HC_vbp(Highcharts);

const Chart1 = ({ data1 }) => {
  // Extract data from data1.chart1Data
  const data = data1.chart1Data.results ? data1.chart1Data.results.map(result => ({
    x: result.t, // Date
    y: result.c // Close price
  })) : [];

  const chartColor = data1.quoteData.c >= data1.quoteData.pc ? 'green' : 'red';

  // Highcharts configuration options for Chart1
  const options = {
    chart: {
      backgroundColor: '#f3f3f3', // Set chart background color to grey
    },
    title: {
      text: `${data1.profileData.ticker} Hourly Price Variation`
    },
    xAxis: {
      type: 'datetime',
    },
    yAxis: {
      title: {
        text: ''
      },
      opposite: true, // Place y-axis on the right side
    },
    series: [{
      data: data,
      showInLegend:false,
      marker: {
        enabled: false // Disable markers (dots)
      },
      color: chartColor, 
    }],
    tooltip: {
      formatter: function() {
        return `<b>${data1.profileData.ticker}</b>: ${this.y}`;
      }
    }
  };

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

const Chart3 = ({ Data3 }) => {
  // if (!Array.isArray(Data3)) {
  //   console.log("Data3:", Data3)
  //   return <div>No data available</div>;
  // }
  // Extract year and month part from the inputData
  const periods = Data3.chart3Data.map(entry => {
    // Extract year and month part of the data.period value
    return entry.period.substr(0, 7); // Get the first 7 characters (yyyy-mm)
  });

  // Initialize series data for each recommendation type
  const seriesData = {
    strongBuy: [],
    buy: [],
    hold: [],
    sell: [],
    strongSell: []
  };

  // Populate seriesData with values for each recommendation type
  Data3.chart3Data.forEach(entry => {
    seriesData.strongBuy.push(entry.strongBuy);
    seriesData.buy.push(entry.buy);
    seriesData.hold.push(entry.hold);
    seriesData.sell.push(entry.sell);
    seriesData.strongSell.push(entry.strongSell);
  });

  // Highcharts configuration options
  const options = {
    chart: {
      type: 'column',
      backgroundColor: '#f3f3f3' // Set chart background color to #f3f3f3
    },
    title: {
      text: 'Recommendation Trends'
    },
    xAxis: {
      categories: periods // Use periods array for x-axis categories
    },
    yAxis: {
      title: {
        text: '#Analysis'
      },
      tickInterval: 10 // Set y-axis interval to 10 units
    },
    legend: {
      reversed: true
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: true,
          format: '{point.y}', // Display the y-value of each point
          color: 'black', // Text color
          style: {
            textOutline: 'none' // Disable text outline
          }
        }
      }
    },
    series: [
      { name: 'Strong Buy', data: seriesData.strongBuy, color: '#006400', 
        dataLabels: {
          color: 'white' // Set text color to white for "Strong Buy" stack
        }
      },
      { name: 'Buy', data: seriesData.buy, color: '#3ecf5b' },
      { name: 'Hold', data: seriesData.hold, color: '#c29b3a' },
      { name: 'Sell', data: seriesData.sell, color: '#e66a7a' },
      { name: 'Strong Sell', data: seriesData.strongSell, color: '#8B0000', 
        dataLabels: {
          color: 'white' // Set text color to white for "Strong Sell" stack
        }
      }
    ]
  };

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

const Chart4 = ({ Data4 }) => {
  // Extract periods and actual/estimate/surprise values from the data
  const categories = Data4.chart4Data.map(entry => `${entry.period} Surprise: ${entry.surprise.toFixed(2)}`);
  let actualValues = Data4.chart4Data.map(entry => entry.actual);
  let estimateValues = Data4.chart4Data.map(entry => entry.estimate);

  // Replace null values with 0
  actualValues = actualValues.map(value => value === null ? 0 : value);
  estimateValues = estimateValues.map(value => value === null ? 0 : value);

  // Highcharts configuration options
  const options = {
    chart: {
      type: 'spline',
      backgroundColor: '#f2f2f2'
    },
    title: {
      text: 'Historical EPS Surprises'
    },
    xAxis: {
      categories: categories,
      title: {
        text: ''
      },
    },
    yAxis: {
      title: {
        text: 'Quarterly EPS'
      }
    },
    series: [
      { name: 'Actual', data: actualValues },
      { name: 'Estimate', data: estimateValues }
    ]
  };

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export { Chart1, Chart3, Chart4 };