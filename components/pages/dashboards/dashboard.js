import React from 'react'
import { Tabs, Tab } from 'material-ui/Tabs';
import { observable, autorun, action, computed } from 'mobx';
import { observer, inject } from 'mobx-react';
import Masonry from '../../Masonry'
import { Modal, Button } from 'react-bootstrap';
import Stores from '../../../stores/index.js';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import DropDownMenu from 'material-ui/DropDownMenu';
import RaisedButton from 'material-ui/RaisedButton';

import Toggle from 'material-ui/Toggle';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import styled from 'styled-components'
// From https://github.com/oliviertassinari/react-swipeable-views


const loadLayout = (key, localKey) => {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem(localKey)) || {};
    } catch (e) {/*Ignore*/ }
  }
  return ls[key];
}

const Content = styled.div`
    flex: 1;
    padding: 2em;
`;


//@inject('ChartStore', 'MetricStore', 'UiState')
@inject('ChartStore', 'UiState')
@observer
class Dashboard extends React.Component {

  @observable isModalVisible = false;
  @observable newCounter = 0;




  constructor(props) {
    super(props)
 
    this.tiles = props.tiles


  }



  @action onItemClick = (itemId) => {
    this.props.UiState.selectedChart = this.props.ChartStore.charts[itemId];
    this.showModal()
  }

  addChart = () => {
    /*eslint no-console: 0*/
    console.log('adding', 'n' + this.newCounter);
    this.items = this.items.concat({
      i: 'n' + this.newCounter,
      x: this.items.length * 2 % (this.cols || 12),
      y: Infinity, // puts it at the bottom
      w: 6,
      h: 4
    })

    this.newCounter = this.newCounter + 1
    console.log('this.items', this.items.length);
  }


  @action showModal = () => {
    this.isModalVisible = true
  }

  @action closeModal = () => {
    console.log("woot")
    this.isModalVisible = false
  }


  handleChange = (event, index, value) => console.log(value);

  handleTabChange = (value) => {  
    this.setState({
      slideIndex: value,
    });
  };

  render() {
    return <div className="dashboard">
     
      {this.props.children}
      
      
      <style jsx>{`
          .dashboard {
             display: block;
             height:100%;
             width:100%;
          }
        `}</style>
    </div>

  }
}

export default Dashboard