const key = '&apikey=HBEG3YH190T4G4U4';
// main variables
const update = document.querySelector('.update');
const search = document.querySelector('#search');
let dateHtml = document.querySelector('.date h5');
let timeHtml = document.querySelector('.date h2');
const boxContainer = document.querySelector('.box-container');
const boxes = document.querySelectorAll('.box');
const stockList = ['MSFT', 'AAPL', 'TSLA', 'FB'];
const link = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='

// main event listeners
// update.addEventListener('click', updateData);
// search.addEventListener('keyup', searchCompany);
boxContainer.addEventListener('click', (e) => console.log(e.target));

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

// get the current time
let currentTime = setDateTime();

// function make requests and get promises
function makePromises(){
  Promise.all(stockList.map(item => {
    // only for test on local files
    // const src = `json_files/${item}.json`
    const src = link + item + key;
    getData(src)
      .then(data => setData(data, item))
      .catch(err => console.log(err));
  }))
}

// call make promises function
// makePromises();
// setData function and variables
function setData(data, item){
  let box = boxes[stockList.indexOf(item)].children[0];
  let symbol = data['Global Quote']['01. symbol'];
  let price =  data['Global Quote']['05. price'];
  let change = parseFloat(data['Global Quote']['10. change percent'].replace(/%/, ''));
  let template = `
  <p class="stock-name">${symbol}</p>
  <p class="current-price">${price}</p>
  <p class="change ${change > 0 ? 'up' : 'down'}"><i class="fas fa-arrow-${change > 0 ? 'up' : 'down'}"></i> ${change}</p>
  <p class="updated">Last update at ${currentTime}</p>`
  box.innerHTML = template;
}

getData('hist_data/MSFT.json')
  .then(value => createChart(value))
  .catch(err => console.log(err));

// create chart and add the data from api
function createChart(value) {
  let dataset = [];
    for (const key of Object.keys(value["Time Series (Daily)"])) {
      let open = value["Time Series (Daily)"][key]["1. open"];
      let high = value["Time Series (Daily)"][key]["2. high"];
      let low = value["Time Series (Daily)"][key]["3. low"];
      let close = value["Time Series (Daily)"][key]["4. close"];
      let time = new Date(key);
      series = [time.getTime(), open, high, low, close]
      dataset.push(series);
    }
  let options = {
    series: [{
      data: ''
    }],
    chart: {
      type: 'candlestick',
      height: '95%'
    },
    title: {
      text: 'CandleStick Chart',
      align: 'left'
    },
    xaxis: {
      type: 'datetime'
    },
    yaxis: {
      tooltip: {
        enabled: true
      }
    }
  };
  options.series['0']['data'] = dataset.slice(0,8);
  let chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
  // console.log(dataset);
}




