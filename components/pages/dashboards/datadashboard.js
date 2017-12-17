import React from 'react'
import Dashboard from './dashboard'
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';

import ChartModel from '../../../stores/models/chartModel'


const charts = [
  {type : "chart", title : "host_cpu", pattern: "host_cpu_per*", yAxis : { min: 0, max: 100 }},
  {type : "chart", title : "host_cpu", pattern: "host_cpu_per*", yAxis : { min: 0, max: 100 }},
  {type : "chart", title : "host_cpu", pattern: "host_cpu_per*", yAxis : { min: 0, max: 100 }},
]
const defaultPlotOptions = {
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
  },
  series: {}
}

class DataDashboard extends React.Component {

  constructor(props) {
    super(props)

    this.charts = charts.map(charts=>{
      return new ChartModel(this, 0, "chart #" + 0, charts.pattern, {
        title: { text:  charts.title },
        chart: { type: 'spline' },
        plotOptions: defaultPlotOptions,
        yAxis: charts.yAxis,
    }, true)})
  }


  render() {
    return (
      <Dashboard {...this.props}
        layoutStorageKey="dataDashboard"
        charts={this.charts}
        title="Welcome"
        message="Thank you for visiting our spacecraft!">

        <Toolbar className="toolbar">
          <SelectField
            floatingLabelText="Keyspace"
            value={1}
            onChange={this.handleChange}
            >
            <MenuItem value={1} primaryText="system" />
            <MenuItem value={2} primaryText="Etc." />
          </SelectField>
          <FontIcon className="muidocs-icon-custom-sort" />
          <ToolbarSeparator />
          <IconMenu
            iconButtonElement={
              <IconButton touch={true}>
                <NavigationExpandMoreIcon />
              </IconButton>
            }
            >
            <MenuItem primaryText="Download" />
            <MenuItem primaryText="More Info" />
          </IconMenu>

        </Toolbar>
      </Dashboard>
    );
  }
}

export default DataDashboard
