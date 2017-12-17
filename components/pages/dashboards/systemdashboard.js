import React from 'react'
import Dashboard from './dashboard'
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';

import Highcharts from 'highcharts';
import ChartModel from '../../../stores/models/chartModel'
import * as widgetConstants from '../../../stores/models/constants'


function divide(number, factor) {
  return number / factor
}

const tiles = [
  {
    type: widgetConstants.WIDGET_TYPE.OVERVIEWCHART,
    title: '<span style="color:' + widgetConstants.CHART_COLORS.b + '">Reads</span>/<span style="color:' + widgetConstants.CHART_COLORS.a + '">Writes</span>',
    pattern: "cas_ClientRequest_Latency",
    endpoint: "getMetricsByNameAgg",
    predicates: [{ name: "scope", values: ["Read", "Write"] }, { name: "function", values: ["Count"] }],
    frequency: widgetConstants.FREQUENCY.sec,
    proc: [{
      name: "irate-sum",
    }],
    invert: ["Write"],
    legendField: "scope",
    config: {
      chart: {
        type: "areaspline",
        margin: [0, 0, 25, 0]
      },
      plotOptions: {
        areaspline: {
          fillOpacity: 0.5
        },
      },
      legend: { enabled: false }
    },
  },

  // Latencies are in microseconds => conversionFactor:1000
  { type: widgetConstants.WIDGET_TYPE.COUNTER, title: "Read Latency", pattern: "cas_ClientRequest_Latency", predicates: [{ name: "scope", values: ["Read"] }], percentile: widgetConstants.PERCENTILES.P99, conversionFunction: divide, conversionFactor: 1000, units: "ms" },
  { type: widgetConstants.WIDGET_TYPE.COUNTER, title: "Write Latency", pattern: "cas_ClientRequest_Latency", predicates: [{ name: "scope", values: ["Write"] }], percentile: widgetConstants.PERCENTILES.P99, conversionFunction: divide, conversionFactor: 1000, units: "ms" },
  { type: widgetConstants.WIDGET_TYPE.COUNTER, title: "Max Read Latency", pattern: "cas_Keyspace_ReadLatency", sla: 800, predicates: [{ name: "function", values: ["max"] }], conversionFunction: divide, conversionFactor: 1000, units: "ms" },
  { type: widgetConstants.WIDGET_TYPE.COUNTER, title: "Max Write Latency", pattern: "cas_Keyspace_WriteLatency", sla: 500, predicates: [{ name: "function", values: ["max"] }], conversionFunction: divide, conversionFactor: 1000, units: "ms" },
  {
    type: widgetConstants.WIDGET_TYPE.OVERVIEWCHART,
    title: "Read Latency", 
    pattern: "cas_ClientRequest_Latency", 
    endpoint: "getMetricsByName",
    predicates: [{ name: "scope", values: ["Read"] }],
    percentile: widgetConstants.PERCENTILES.P99, conversionFunction: divide, conversionFactor: 1000, units: "ms",
    frequency: widgetConstants.FREQUENCY.sec,
    proc: [{
      name: "sum", params: {}
    }],
    config: {
      chart: {
        type: "areaspline",
        margin: [0, 0, 25, 0]
      },
      plotOptions: {
        areaspline: {
          fillOpacity: 0.5
        },
      },
      legend: { enabled: false }
    },
  },
   { type: widgetConstants.WIDGET_TYPE.CHART, title: "Mem % usage", pattern: "host_Memory_UsedPercent", yAxis: { min: 0, max: 100 } },
   { type: widgetConstants.WIDGET_TYPE.CHART, title: "load 15", pattern: "host_load15", yAxis: { min: 0 } },
   { type: widgetConstants.WIDGET_TYPE.CHART, title: "CPU usage", pattern: "host_CPU_Percent_Merge", yAxis: { min: 0, max: 100 } },
   { type: widgetConstants.WIDGET_TYPE.CHART, title: "Disk avgqsz", pattern: "host_Disk_avgqsz", yAxis: {
       min: 0, plotLines: [{
         color: '#E05C60',
         value: '15',
         width: '2',
         zIndex: 2 // To not get stuck below the regular plot lines
       }]
     }
   },
]

class SystemDashboard extends React.Component {

  constructor(props) {
    super(props)
    this.tiles = tiles.map(tile => {
      switch (tile.type) {
        case widgetConstants.WIDGET_TYPE.CHART:
        case widgetConstants.WIDGET_TYPE.OVERVIEWCHART:
          tile.config = tile.config || {}
          tile.config.title = { text: '' }
          tile.config.subTitle = { text: '' },
            tile.config.chart = tile.config.chart || {type: "areaspline",  margin: [0, 0, 25, 0]}
          tile.config.yAxis = tile.config.yAxis || {}
          tile.config.xAxis = tile.config.xAxis || {}
          tile.config.xAxis.type = 'datetime'
          // init that in order to be able to set values later without check of existence
          Object.assign(tile.config.xAxis, { labels: { style: {} } })
          Object.assign(tile.config.yAxis, { labels: { style: {} } })
          tile.config.legend =  tile.config.legend  || { enabled: false }
          tile.config.plotOptions = tile.config.plotOptions || {
                                                                areaspline: {
                                                                  fillOpacity: 0.5
                                                                },
                                                              }

          Object.assign(tile.config.plotOptions, widgetConstants.defaultPlotOptions, widgetConstants.defaultSplinePlotOptions),

            tile.config.yAxis.title = {
              text: undefined
            }
          if (tile.invert != undefined) {
            Object.assign(tile.config.yAxis.labels, {
              formatter: function () {
                var label = this.axis.defaultLabelFormatter.call(this);
                // remove the minus
                return label.replace("-", "")
              }
            })
          }
          tile.config.tooltip = {
            shared: true,
            formatter: function () {
              var s = '<b>' + new Date(this.x).toUTCString() + '</b>';
              this.points.map((point) => {
                s += '<br/>' + point.series.name + ': ' +
                  Highcharts.numberFormat(point.y, 0);
              });

              return s.replace("-", "");
            },
          }

          break;
      }

      return tile
    })
  }


  render() {
    return (
      <Dashboard {...this.props}
        layoutStorageKey="systemDashboard"
        tiles={this.tiles}
        title="Welcome"
        message="Thank you for visiting our spacecraft!">
        <Toolbar className="toolbar">
        </Toolbar>
      </Dashboard>
    );
  }
}

export default SystemDashboard

