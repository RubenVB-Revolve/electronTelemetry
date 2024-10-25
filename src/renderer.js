const { lightningChart, AxisScrollStrategies, emptyFill, AxisTickStrategies, Themes } = require('@lightningchart/lcjs');
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
  charts.push({ chart, container });
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
addGraph('Ax Data', 'ax-data');
addGraph('Roll Data', 'roll-data');