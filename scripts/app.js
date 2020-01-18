// main variables
const update = document.querySelector('.update');
const btn = document.querySelector('.slide-container');
let dateHtml = document.querySelector('.date h5');
let timeHtml = document.querySelector('.date h2');
let chartContainer = document.querySelector(".chart-container");
const boxContainer = document.querySelector('.box-container');
const boxes = document.querySelectorAll('.box');
const stockList = ['MSFT', 'AAPL', 'TSLA', 'FB'];
const link = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='
const key = '&apikey=HBEG3YH190T4G4U4';

// main event listeners
update.addEventListener('click', makePromises);
boxContainer.addEventListener('click', displayData);
btn.addEventListener('click', switchChart);

// set the time with an interval
timeHtml.textContent = '';
setInterval(() => {
  setDateTime()
}, 1000);

function setDateTime(){
  const dateTime = new Date();
  let date = dateTime.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
  let time = dateTime.toLocaleTimeString();
  dateHtml.textContent = date;
  timeHtml.textContent = time;
  return timeHtml.textContent;
}

// function make requests and get promises
function makePromises(){
  Promise.all(stockList.map(stock => {
    // only for test on local files
    const src = `json_files/${stock}.json`
    // const src = link + stock + key;
    getData(src)
      .then(data => setData(data, stock))
      .catch(err => console.log(err));
  }))
}

// call make promises function
setTimeout(() => makePromises(), 2000);

// setData function and variables
function setData(data, item){
// get the current time
  let currentTime = setDateTime();
  let box = boxes[stockList.indexOf(item)].children[0];
  let symbol = data['Global Quote']['01. symbol'];
  let price =  parseFloat(data['Global Quote']['05. price']);
  let change = parseFloat(data['Global Quote']['10. change percent'].replace(/%/, ''));
  let template = `
  <p class="stock-name">${symbol}</p>
  <p class="current-price">${price.toFixed(2)}</p>
  <p class="change ${change > 0 ? 'up' : 'down'}"><i class="fas fa-arrow-${change > 0 ? 'up' : 'down'}"></i> ${change.toFixed(2)}%</p>
  <p class="updated">Last update at ${currentTime}</p>`
  box.innerHTML = template;
}

// intialise active symbol variable
let activeSymbol = 'MSFT';
// display the data
function displayData(e) {
  if(e.target.classList.contains('stock-name')){
    activeSymbol = e.target.textContent;
    getHistData(activeSymbol);
  }
}

// fetch historical data 
function getHistData(activeSymbol) {
  chartContainer.innerHTML = '<div id="chart"></div>';
  getData(`hist_data/${activeSymbol}.json`)
    .then(value => createChart(value))
    .catch(err => console.log(err));
}

function switchChart(e) {
  if(e.target.id === 'label'){
    if(!e.target.previousElementSibling.checked){
      activeChart = 'candle';
      getHistData(activeSymbol);
    } else {
      activeChart = 'line';
      getHistData(activeSymbol);
    }
  return activeChart;
  }
}

let activeChart = 'line';
// create chart and add the data from api
function createChart(value) {
  let options;
  let dataset = [];
  let price = [];
  let priceRange = [];
  let volume = [];
  let dates = [];
    for (const key of Object.keys(value["Time Series (Daily)"])) {
      let open = parseFloat(value["Time Series (Daily)"][key]["1. open"]);
      let high = parseFloat(value["Time Series (Daily)"][key]["2. high"]);
      let low = parseFloat(value["Time Series (Daily)"][key]["3. low"]);
      let close = parseFloat(value["Time Series (Daily)"][key]["4. close"]);
      let vol = parseFloat(value["Time Series (Daily)"][key]["5. volume"]);
      let time = new Date(key);
      series = [time.getTime(), open, high, low, close]
      dataset.push(series);
      price.push(close);
      volume.push(vol);
      dates.push(time.getTime());
      priceRange.push(high, low);
    }
  // chart options
  if(activeChart === 'line'){
    options = {
      series: [{
        name: 'Price',
        type: 'line',
        data: price
      }, {
        name: 'Volume',
        type: 'bar',
        data: volume
      }],
      chart: {
        height: '95%',
        type: 'line',
        foreColor: '#984f7A',
      },
      plotOptions: {
        bar: {
            columnWidth: '20%',
        },
      },
      stroke: {
        width: [2, 0]
      },
      title: {
        text: value["Meta Data"]["2. Symbol"],
        align: 'left',
      },
    
      labels: dates
      ,
      xaxis: {
        type: 'datetime'
      },
      yaxis: [{
        title: {
          text: 'Price',
        },
        decimalsInFloat: 2,
        min: Math.min.apply(null ,price),
        max: Math.max.apply(null, price),
      }, {
        opposite: true,
        title: {
          text: 'Volume'
        },
        decimalsInFloat: 0
      }]
    };
  } else {
    options = {
          series: [{
            data: dataset.sort(function(a, b){return a[0] - b[0]})

          }],
          chart: {
            type: 'candlestick',
            height: '95%',
            foreColor: '#984f7A',
          },
          title: {
            text: value["Meta Data"]["2. Symbol"],
            align: 'left'
          },
          xaxis: {
            type: 'datetime'
          },
          yaxis: {
            tooltip: {
              enabled: true
            },
            decimalsInFloat: 2,
            min: Math.min.apply(null , priceRange),
            max: Math.max.apply(null, priceRange),
          }
        };
  }
  let chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
}

// initialise chart
setTimeout(() => getHistData('MSFT'), 2200);