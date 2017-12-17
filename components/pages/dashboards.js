import React from 'react'
import { Tabs, Tab } from 'material-ui/Tabs';
import { observable, observe, autorun, action, computed } from 'mobx';
import { observer, inject } from 'mobx-react';
import Masonry from '../Masonry'
import { Modal, Button } from 'react-bootstrap';
import { List, ListItem } from 'material-ui/List';
import Stores from '../../stores/index.js';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import DropDownMenu from 'material-ui/DropDownMenu';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import Toggle from 'material-ui/Toggle';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Popover from 'material-ui/Popover';
import Subheader from 'material-ui/Subheader';
import Menu from 'material-ui/Menu';
import _ from 'lodash';
import { GridList, GridTile } from 'material-ui/GridList';


import dynamic from 'next/dynamic'

const APIURL = "http://localhost:3000"


const loadLayout = (key) => {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem('rgl-7')) || {};
    } catch (e) {/*Ignore*/ }
  }
  return ls[key];
}




const DashboardComponents = [
  { text: 'System', component: dynamic(import('./dashboards/systemdashboard')),     authRequired: false},
{ text: 'Events', component : dynamic(import('./dashboards/eventsdashboard')), authRequired: false }
]


//@inject('ChartStore', 'MetricStore', 'UiState')
@inject('ChartStore', 'UiState')
@observer
class Dashboard extends React.Component {

  @observable isModalVisible = false;
  @observable newCounter = 0;
  @observable currentDashboard = "System";





  constructor(props) {
    super(props)
    this.state = {
      slideIndex: 0,
    };

   
   
  }

  

  getComponent(item) {
    if (this.stores)
      this.stores.UiState.currentDashboard = item;
    return DashboardComponents.find((c) => c.text === item).component
  }

  @action async startIndexing () {
      var res = await fetch(APIURL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    console.log(res);
  }

  componentWillUnmount() {
    // unregister observers
    this.observers.map(observer => {
      observer()
    })
  }


  render() {

    const DynamicComponent = this.getComponent(this.currentDashboard)
    const SelectFieldIconStyle = { fill: 'rgb(177, 177, 177)' }
   

    return <div className="dashboardMaster">

      <Toolbar className="toolbar">
        <FlatButton {...this.props} label="Index pictures" labelStyle={{ color: 'white' }} onTouchTap={this.startIndexing} />}


      </Toolbar>
      <DynamicComponent {...this.props} />
      <style jsx>{`
          .dashboardMaster{
            height: 100% 
          }
          .toolbar {
             background-color: transparent !important;
             padding : 0 1rem !important;
             #height: 100% !important
             
          }
  

        `}</style>
    </div>
  }
}

export default Dashboard


  //  <div>
  //         <RaisedButton
  //           onTouchTap={this.handleTimeMenuOpen}
  //           label={this.timeRangeLabel}
  //           />
  //         <Popover open={this.timeMenuOpen}
  //           anchorEl={this.timeMenuAnchorElement}
  //           anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
  //           targetOrigin={{ horizontal: 'left', vertical: 'top' }}
  //           onRequestClose={this.handleTimeMenuClose}>
  //           <Menu className="timeRangeMenu">
  //             <GridList
  //               cellHeight={80}

  //               >
  //               <Subheader>Predefined</Subheader>
  //               {timeRanges.map((timeRange, i) => (
  //                 <GridTile
  //                   key={i}
  //                   title={timeRange.label}
  //                   subtitle={<span>by <b>{timeRange.value}</b></span>}

  //                   >
  //                 </GridTile>
  //               ))}
  //             </GridList>
  //             <List className="dateTimePickers">
  //               <div className="dateTimePicker">
  //                 <p className="fromLabel">From:</p>
  //                 <DatePicker className="datepicker" onChange={this.handleFromDate} value={this.fromDate} container="inline" mode="landscape" autoOk={true} hintText="Date"
  //                   shouldDisableDate={this.disableFutureDate}
  //                   style={{ width: '100px' }} textFieldStyle={{ width: '100px' }} />
  //                 <TimePicker className="datepicker" onChange={this.handleFromTime} value={this.fromTime} autoOk={true} hintText="Time"
  //                   style={{ width: '100px' }} />
  //                 <div>
  //                   <RaisedButton
  //                     onTouchTap={this.handlePredefinedTimeOpenTap}
  //                     label="Predefined"
  //                     />
  //                   <Popover
  //                     open={this.predefinedTimeOpen}
  //                     anchorEl={this.predefinedTimeAnchorElement}
  //                     anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
  //                     targetOrigin={{ horizontal: 'left', vertical: 'top' }}
  //                     onRequestClose={this.handlePredefinedTimeClose}
  //                     >
  //                     <Menu onItemTouchTap={this.handlePredefinedFromTap}>
  //                       <MenuItem primaryText="5 minutes" value="5" />
  //                       <MenuItem primaryText="30 minutes" value="30" />
  //                       <MenuItem primaryText="60 minutes" value="60" />
  //                       <MenuItem primaryText="3 hours" value="180" />
  //                       <MenuItem primaryText="6 hours" value="360" />
  //                       <MenuItem primaryText="12 hours" value="720" />
  //                       <MenuItem primaryText="24 hours" value="1440" />
  //                       <MenuItem primaryText="3 days" value="4320" />
  //                       <MenuItem primaryText="7 days" value="10080" />
  //                       <MenuItem primaryText="2 weeks" value="20160" />
  //                       <MenuItem primaryText="1 month" value="43800" />
  //                       <MenuItem primaryText="3 months" value="131400" />
  //                       <MenuItem primaryText="6 months" value="262800" />
  //                       <MenuItem primaryText="1 year" value="525600" />

  //                     </Menu>
  //                   </Popover>
  //                 </div>
  //               </div>
  //               <div className="dateTimePicker">
  //                 <p className="toLabel">To:</p>
  //                 <DatePicker className="datepicker" onChange={this.handleToDate} value={this.toDate} container="inline" mode="landscape" autoOk={true} hintText="Date"
  //                   shouldDisableDate={this.disableToDates}
  //                   style={{ width: '100px' }} textFieldStyle={{ width: '100px' }} />
  //                 <TimePicker className="datepicker" onChange={this.handleToTime} value={this.toTime} autoOk={true} hintText="Time"
  //                   style={{ width: '100px' }} />
  //                 <div>
  //                   <RaisedButton label="Now" onTouchTap={this.handleNowTap} />
  //                 </div>
  //               </div>
  //             </List>
  //           </Menu>
  //         </Popover>
  //       </div>