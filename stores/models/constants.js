export const defaultPlotOptions = {
  series: {
    animation: false,
    states: {
      hover: {
        lineWidthPlus: 0
      }
    },
    marker: {
      enable: false,
    }
  }
}

export const defaultSplinePlotOptions = {
  spline: {
    marker: {
      enable: false,
      radius: 0,
      states: {
        hover: {
          enabled: true
        }
      }
    }
  }
}


export const pollInitInterval = 5000;
export const pollMaxInterval = 100000;

// backoff logic
function computeInterval(interval, error) {
  if (error) {
    // double until maximum interval on errors
    interval = interval < pollMaxInterval ? interval * 2 : pollMaxInterval;
  } else {
    // anytime the poller succeeds, make sure we've reset to
    // default interval.. this also allows the initInterval to 
    // change while the poller is running
    interval = pollInitInterval;
  }
  return interval;
}
export { computeInterval }

export const PERCENTILES = {
  P999: { value: "999thPercentile", label: "999" },
  P99: { value: "99thPercentile", label: "99" },
  P98: { value: "98thPercentile", label: "98" },
  P95: { value: "95thPercentile", label: "95" },
  P75: { value: "75thPercentile", label: "75" },
  P50: { value: "50thPercentile", label: "50" },
}

export const SLA_MARGIN_PERCENT = 10;
export const STYLES = {
  widgetRedColor: 'rgb(189, 101, 101)',
  widgetOrangeColor: 'rgb(189, 166, 101)',
  widgetGreenColor: 'rgb(129, 189, 101)'
}

export const FREQUENCY = {
  sec: { timeBucketSize: "10s", label: "sec", refresh: 10 }, // we need to wait 10 seconds at least to get 2 buckets of data
  min: { timeBucketSize: "30s", label: "min", refresh: 60 },
  hour: { timeBucketSize: "1800s", label: "hour", refresh: 3600 },
  day: { timeBucketSize: "43200s", label: "day", refresh: 86400 },
}

export const TIME_RANGES = {
  m5: { value: 5, label: "5m" },
  m30: { value: 30, label: "30m" },
  h1: { value: 60, label: "1h" },
  h3: { value: 180, label: "3h" },
  h6: { value: 360, label: "6h" },
  h12: { value: 720, label: "12h" },
  h24: { value: 1440, label: "24h" },
}

export const WIDGET_TYPE = {
  CHART: 1,
  OVERVIEWCHART: 2,
  COUNTER: 3,
}

export const CHART_COLORS = {
  a: '#5899fb',
  b: '#69dd4a',
  c: '#f45b5b',
  d: '#7798BF',
  e: '#aaeeee',
  f: '#ff0066',
  g: '#eeaaee',
  h: '#55BF3B',
  i: '#DF5353',
  j: '#7798BF',
  k: '#aaeeee',
}
export const HighchartsTheme = {
  colors: Object.values(CHART_COLORS),
  chart: {
    backgroundColor: 'transparent',
    // backgroundColor: {
    //    linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
    //    stops: [
    //       [0, '#f2f2f2'],
    //       [1, '#f2f2f2']
    //    ]
    // },
    style: {
      fontFamily: '\'Unica One\', sans-serif'
    },
    plotBorderColor: '#606063',

  },
  //  title: {
  //     style: {
  //        color: '#E0E0E3',
  //        textTransform: 'uppercase',
  //        fontSize: '20px'
  //     }
  //  },
  subtitle: {
    style: {
      color: '#E0E0E3',
      textTransform: 'uppercase'
    }
  },
  xAxis: {
    gridLineColor: '#e4e4e7',
    minPadding: 0, // remove the small white space on left and right 
    maxPadding: 0, // remove the small white space on left and right 
    labels: {
      style: {
        color: '#787887',
      },
      y: 20,

      // useHTML: true, // required for the overflow visible
    },
    lineColor: '#e4e4e7',
    minorGridLineColor: '#e4e4e7',
    tickColor: 'transparent',
    title: {
      style: {
        color: '#A0A0A3'

      }
    }
  },
  yAxis: {
    gridLineColor: '#e4e4e7',
    labels: {
      style: {
        color: '#50505b',
      },
      //useHTML: true, // required for the overflow visible
      align: 'left',
      x: 2,
      y: 11,
      zIndex: 10000,
    },
    lineColor: '#e4e4e7',
    minorGridLineColor: '#e4e4e7',
    tickColor: 'transparent',
    title: {
      style: {
        color: '#A0A0A3'

      }
    },
    tickWidth: 1,
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    style: {
      color: '#F0F0F0'
    }
  },
  plotOptions: {
    series: {
      pointPadding: 0,
      groupPadding: 0,
      dataLabels: {
        color: '#B0B0B3'
      },
      marker: {
        lineColor: '#333'
      }
    },
    boxplot: {
      fillColor: '#505053'
    },
    candlestick: {
      lineColor: 'white'
    },
    errorbar: {
      color: 'white'
    }
  },
  legend: {
    verticalAlign: 'top',
    itemStyle: {
      color: '#E0E0E3'
    },
    itemHoverStyle: {
      color: '#FFF'
    },
    itemHiddenStyle: {
      color: '#606063'
    }
  },
  credits: {
    style: {
      color: '#666'
    }
  },
  labels: {
    style: {
      color: '#707073'
    }
  },

  drilldown: {
    activeAxisLabelStyle: {
      color: '#F0F0F3'
    },
    activeDataLabelStyle: {
      color: '#F0F0F3'
    }
  },

  navigation: {
    buttonOptions: {
      symbolStroke: '#DDDDDD',
      theme: {
        fill: '#505053'
      }
    }
  },

  // scroll charts
  rangeSelector: {
    buttonTheme: {
      fill: '#505053',
      stroke: '#000000',
      style: {
        color: '#CCC'
      },
      states: {
        hover: {
          fill: '#707073',
          stroke: '#000000',
          style: {
            color: 'white'
          }
        },
        select: {
          fill: '#000003',
          stroke: '#000000',
          style: {
            color: 'white'
          }
        }
      }
    },
    inputBoxBorderColor: '#505053',
    inputStyle: {
      backgroundColor: '#333',
      color: 'silver'
    },
    labelStyle: {
      color: 'silver'
    }
  },

  navigator: {
    handles: {
      backgroundColor: '#666',
      borderColor: '#AAA'
    },
    outlineColor: '#CCC',
    maskFill: 'rgba(255,255,255,0.1)',
    series: {
      color: '#7798BF',
      lineColor: '#A6C7ED'
    },
    xAxis: {
      gridLineColor: '#505053'
    }
  },

  scrollbar: {
    barBackgroundColor: '#808083',
    barBorderColor: '#808083',
    buttonArrowColor: '#CCC',
    buttonBackgroundColor: '#606063',
    buttonBorderColor: '#606063',
    rifleColor: '#FFF',
    trackBackgroundColor: '#404043',
    trackBorderColor: '#404043'
  },

  // special colors for some of the
  legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
  background2: '#505053',
  dataLabelsColor: '#B0B0B3',
  textColor: '#C0C0C0',
  contrastTextColor: '#F0F0F3',
  maskColor: 'rgba(255,255,255,0.3)'
};
