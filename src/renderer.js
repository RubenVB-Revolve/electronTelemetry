const { lightningChart, AxisScrollStrategies, emptyFill, emptyLine, AxisTickStrategies, Themes, synchronizeAxisIntervals, UIElementBuilders, UIOrigins, BarChartTypes, BarChartSorting } = require('@lightningchart/lcjs');
const { ipcRenderer } = require('electron');
const { createProgressiveTraceGenerator } = require('@arction/xydata');

const layoutCharts = document.createElement('div');
document.body.appendChild(layoutCharts);
layoutCharts.style.position = 'absolute';
layoutCharts.style.width = '100%';
layoutCharts.style.height = '100%';
layoutCharts.style.display = 'flex';
layoutCharts.style.flexDirection = 'column';

const lc = lightningChart({
  license: "0002-n96ucKX1C700BOZwz7IAGHHjEuT4KwDfrkmx7QCyIBztfxcK2B2YdzqRkuyh0bv4JWu/viN/aCm4HYmBbVnGHphV-MEUCIQCoAbM5nVG3lu6EAeoZcsrvewNpdn+DEGKL6UpNeDXEbAIgCV8gVBAZ3XKPAkbuQDarCfg/BnBK4sN+L00cqoYMu5E=",
  licenseInformation: {
    appTitle: "LightningChart JS Trial",
    company: "LightningChart Ltd."
  },
});

const charts = [];
const timeWindow = 10;  // 10 seconds

function addGraph(name, eventChannel) {
  // Create a container div for the chart
  const container = document.createElement('div');
  layoutCharts.appendChild(container);
  container.style.width = '100%';
  container.style.height = '100%';  // Initial full height, will be adjusted

  // Create a new chart
  const chart = lc.ChartXY({
    container,
    theme: Themes.turquoiseHexagon,
  }).setTitle(name).setPadding({ top: 0, left: 100 });

  const axisX = chart.getDefaultAxisX();
  axisX.setTickStrategy(AxisTickStrategies.Time)
      .setScrollStrategy(AxisScrollStrategies.progressive)
      .setInterval({ start: 0, end: timeWindow * 100, stopAxisAfter: false });  // Set initial interval for scrolling

  const axisY = chart.getDefaultAxisY().setThickness({ min: 80 });
  const series = chart.addLineSeries({ dataPattern: { pattern: 'ProgressiveX' } });

  let initialTimestamp = null;

  ipcRenderer.on(eventChannel, (event, args) => {
    const { timestamp, yValue } = args;

    if (initialTimestamp === null) {
      initialTimestamp = timestamp;
    }

    const relativeTime = (timestamp - initialTimestamp);
    series.add({ x: relativeTime, y: yValue });
  });

  // Store both the chart and its container for later use
  charts.push({ chart, container, series});
  updateChartLayout();
}

function addGGDiagram(name, eventChannel) {
  const container = document.createElement('div');
  layoutCharts.appendChild(container);
  container.style.width = '100%';
  container.style.height = '100%';  // Initial full height, will be adjusted

  const chart = lc.ChartXY({
    container,
    theme: Themes.darkGold
  }).setTitle(name).setPadding({ top: 0, left: 100 });

  const axisX = chart.getDefaultAxisX();

  const axisY = chart.getDefaultAxisY();

  const series = chart.addPointLineAreaSeries({ dataPattern: null })
    .setStrokeStyle(emptyLine)
    .setAreaFillStyle(emptyFill)
    .setPointSize(2);

  ipcRenderer.on(eventChannel, (event, args) => {
    const { xValue, yValue } = args;

    series.add({ x: xValue, y: yValue });
  });

  // Store both the chart and its container for later use
  charts.push({ chart, container, series});
  updateChartLayout();
}

function addBarChart(name, eventChannel) {
  const container = document.createElement('div');
  layoutCharts.appendChild(container);
  container.style.width = '100%';
  container.style.height = '100%';  // Initial full height, will be adjusted

  const chart = lc.BarChart({
    container,
    theme: Themes.lightNature,
    type: BarChartTypes.Vertical
  }).setTitle(name).setPadding({ top: 0, left: 100 })
    .setSorting(BarChartSorting.Alphabetical);

  // const series = chart.addBarSeries({  });

  ipcRenderer.on(eventChannel, (event, args) => {
    const { fr, fl, rl, rr } = args;

    chart.setData([
      { category: "FL", value: fl },
      { category: "FR", value: fr },
      { category: "RL", value: rl },
      { category: "RR", value: rr },
    ]);
  });

  // Store both the chart and its container for later use
  charts.push({ chart, container });
  updateChartLayout();
}

function add3dLineChart(name, eventChannel) {
  const container = document.createElement('div');
  layoutCharts.appendChild(container);
  container.style.width = '100%';
  container.style.height = '100%';  // Initial full height, will be adjusted

  const chart = lc.Chart3D({
    container,
    theme: Themes.darkGold
  }).setTitle(name).setPadding({ top: 0, left: 100 });

  // Create a separate line series for each point along the Z-axis
  const frSeries = chart.addLineSeries();
  const flSeries = chart.addLineSeries();
  const rlSeries = chart.addLineSeries();
  const rrSeries = chart.addLineSeries();

  let initialTimestamp = null;
  const timeWindow = 10; // 10 seconds of data at a time

  ipcRenderer.on(eventChannel, (event, args) => {
    const { timestamp, fr, fl, rl, rr } = args;

    if (initialTimestamp === null) {
      initialTimestamp = timestamp;
    }

    const relativeTime = (timestamp - initialTimestamp) / 1000;  // Convert milliseconds to seconds

    // Add data points to their respective Z-positions
    frSeries.add({ x: relativeTime, y: fr, z: 0 });
    flSeries.add({ x: relativeTime, y: fl, z: 10 });
    rlSeries.add({ x: relativeTime, y: rl, z: 20 });
    rrSeries.add({ x: relativeTime, y: rr, z: 30 });

    // Dynamically adjust the X-axis interval to keep the chart scrolling
    const axisX = chart.getDefaultAxisX();
    if (relativeTime > timeWindow) {
      axisX.setInterval(relativeTime - timeWindow, relativeTime);
    }
  });

  // Store both the chart and its container for later use
  charts.push({ chart, container, frSeries, flSeries, rlSeries, rrSeries });
  updateChartLayout();
}


// Function to update layout dynamically based on number of charts
function updateChartLayout() {
  const parentHeight = document.body.getBoundingClientRect().height;
  const divHeight = parentHeight / charts.length + 'px';

  charts.forEach(({ container }) => {
    container.style.height = divHeight;
  });
}

// Initialize each graph with its specific data channel
addGraph('Pitch Data', 'pitch-data');
addGGDiagram('GG Data', 'gg-data');
addBarChart('Torque Data', 'torque-data');
// add3dLineChart('Torque Data 3d', 'torque-data');

// synchronizeAxisIntervals(charts[0].getDefaultAxisX, charts[1].getDefaultAxisX);