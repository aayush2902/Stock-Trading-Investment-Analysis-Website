//   import React, { useEffect } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from "highcharts/highstock";
import indicators from "highcharts/indicators/indicators-all";
import vbp from "highcharts/indicators/volume-by-price";
indicators(Highcharts);
vbp(Highcharts);

const Chart2 = ({data2}) => {
    // Helper function to format Unix timestamp
    console.log("bc:",data2.chart2Data);

    // Function to process props data and return chart options
    const processChartData = () => {
      let ohlc = [];
      let volume = [];

      data2.chart2Data.results.forEach(item => {
        let tempOhlc = [];
        let tempVolume = [];

        tempOhlc.push(item.t);
        tempOhlc.push(item.o);
        tempOhlc.push(item.h);
        tempOhlc.push(item.l);
        tempOhlc.push(item.c);
        ohlc.push(tempOhlc);

        tempVolume.push(item.t);
        tempVolume.push(item.v);
        volume.push(tempVolume);
      });

      return {
        rangeSelector: { selected: 2 },

        title: { text: data2.profileData.ticker + ' Historical' },
        subtitle: { text: 'With SMA and Volume by Price technical indicators' },
        yAxis: [
          {
            labels: { align: 'right', x: -3 },
            title: { text: 'OHLC' },
            height: '60%',
            lineWidth: 2,
            resize: { enabled: true },
          },
          {
            labels: { align: 'right', x: -3 },
            title: { text: 'Volume' },
            top: '65%',
            height: '35%',
            offset: 0,
            lineWidth: 2,
          },
        ],

      //     yAxis: [{
      //     startOnTick: false,
      //     endOnTick: false,
      //     labels: {
      //       align: 'right',
      //       x: -3
      //     },
      //     title: {
      //       text: 'OHLC'
      //     },
      //     height: '60%',
      //     lineWidth: 2,
      //     resize: {
      //         enabled: true
      //     }
      //     }, {
      //     labels: {
      //         align: 'right',
      //         x: -3
      //     },
      //     title: {
      //         text: 'Volume'
      //     },
      //     top: '65%',
      //     height: '35%',
      //     offset: 0,
      //     lineWidth: 2
      // }],

      xAxis: {
        type: 'datetime',
        range: 6 * 30 * 24 * 3600 * 1000
      },

        tooltip: { split: true },
        plotOptions: {
          series: {
              dataGrouping: {
                  units: [['week',[1]], ['month',[1, 2, 3, 4, 6]]]
              }
          }
      },
        series: [
          {
            type: 'candlestick',
            name: data2.chart2Data.ticker,
            id: 'aapl',
            zIndex: 2,
            data: ohlc
        }, {
            type: 'column',
            name: 'Volume',
            id: 'volume',
            data: volume,
            yAxis: 1
        }, {
            type: 'vbp',
            linkedTo: 'aapl',
            params: {
                volumeSeriesID: 'volume'
            },
            dataLabels: {
                enabled: false
            },
            zoneLines: {
                enabled: false
            }
        }, {
            type: 'sma',
            linkedTo: 'aapl',
            zIndex: 1,
            marker: {
                enabled: false
            }
        }
          
          // Additional series can be defined here
        ],
      };
    };

    // // Effect hook to render chart when data changes
    // useEffect(() => {
    //   const chartOptions = processChartData();
    //   // Here you can initialize the chart using chartOptions
    //   // This example assumes you're managing chart initialization within the useEffect hook or using HighchartsReact component
    // }, [stockData.data]); // Dependency array ensures this runs when props.data changes

    return (
      <div>
        <HighchartsReact
          highcharts={Highcharts}
          constructorType={'stockChart'}
          options={processChartData()}
        />
      </div>
    );
  };

  export default Chart2;