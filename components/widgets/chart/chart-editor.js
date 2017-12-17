import React from 'react';
import { observer } from 'mobx-react';
import { action, autorun, extendObservable } from 'mobx';
import {Observable} from 'rxjs/Rx'; 


import MetricStore from '../../stores/metric';
import VirtualizedSelect from 'react-virtualized-select'
import sizeMe from 'react-sizeme';
import Chart from './chart'
import {Popover, Tooltip, OverlayTrigger, Button} from 'react-bootstrap';


const popover = (
      <Popover id="modal-popover" title="woot!">
        popover test
      </Popover>
    );
    const tooltip = (
      <Tooltip id="modal-tooltip">
        wow.
      </Tooltip>
    );


class ChartEditor extends React.Component {

  constructor(props) {
    super(props);

    this.metricNames = props.metricNames ? props.metricNames.slice() : ""
    this.metricStore = props.MetricStore
    this.metricNamesFilterOptions= props.MetricStore.metricNamesFilterOptions
    this.agents

    //MetricStore.fetch("host_name")
    
    extendObservable(this, {
      agents: undefined,
      chart: props.chart,
      counter:0,
      title: props.chart ? props.chart.title : "",
      refreshFlag: false,
      dcs: null,
      dcsSelected: null,
      clusters: null,
      clustersSelected: null,
      hosts:null,
      hostsSelected:null,
      metrics: [],
      metricNameSelected: null,
      data:[]
    });

  }
   

 	componentDidMount(){
		this.title="baaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
	}

  handleUserInput = (e) => {
    e.originalEvent.defaultPrevented = true
    const { name, value } = e.target;
    this.setState({
      [name]: value
    });
  }

  addMetric= (e) => {
    this.props.UiState.selectedChart.addMetric("test")
  }
 
 async fetch(fieldToFetch, filter) {
  try {

    var query = new function(){
    this.size = 0;
     
      if(filter){
          this.query = {};
          this.query.filtered = {}
          this.query.filtered.filter= {};
          this.query.filtered.filter.terms = {};
          if(filter.dcs){
            this.query.filtered.filter.terms.dc = filter.dcs;
          }
          if(filter.clusters){
            this.query.filtered.filter.terms.cluster = filter.clusters;
          } 
          if(filter.zones){
            this.query.filtered.filter.terms.zone = filter.zones;
          } 
          if(filter.regions){
            this.query.filtered.filter.terms.region = filter.regions;
          } 
          if(filter.metrics){
            this.query.filtered.filter.terms.metric_name = filter.metrics;
          } 
      }

      this.aggs ={}
      this.aggs.metric ={}
      this.aggs.metric.terms = {
          field : fieldToFetch,
          size:0
      }
    }
    
      const res = await fetch('http://localhost:9200/metametrics/metric/_search', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(query)
        });

      var res = await res.json();
      var result = []
      for(var k in res.aggregations.metric.buckets) {
          result.push({name:res.aggregations.metric.buckets[k].key});
      }
      return result;
    } catch (e) {
       console.log('onError: %s', e);
    }  
 }

  
  async  handleClusterSelectionChange (value)  {
     this.clustersSelected = value;
   //  this.dcs = await this.fetch("dc", filter={clusters:value})
    console.log("DCs: ",JSON.stringify(this.dcs))
	}

  async  handleHostSelectionChange (value)  {
    if(value === ""){
      this.selectAllAgents()
    }else{
     this.props.UiState.selectedChart.agents = value
    }
    this.hostsSelected = value;
    console.log("HOSTs Section changed!: ",JSON.stringify(this.agents))
    this.props.UiState.selectedChart.startPolling()
	}

  selectAllAgents(){
     this.props.UiState.selectedChart.agents = this.hosts.map(val=> val.agent ).join(',');
     console.log("SELECT ALL AGENTS WOOT: ",JSON.stringify(this.props.UiState.selectedChart.agents))
  }

   // Uses Observable.forkJoin() to run multiple concurrent http.get() requests.
   // better than doing multiple await fetch()
   handleMetricSelectionChange (value)  {
   //   this.props.UiState.selectedChart.title = "BALAAAAAAAAAAAAAA"
    // this.metricNameSelected = value;
    // this.metrics =  this.metricNameSelected.split(",")
    this.props.UiState.selectedChart.metrics =  value.split(",")
    this.props.UiState.selectedChart.metricsString = value
   // console.log("Sleecte chart: ", this.props.UiState.selectedChart.type)
    this.props.UiState.selectedChart.metricSelectionChanged()
   
    // var filter = {
    //   metrics: this.metrics
    // }

    // Observable.forkJoin(
    //     this.fetch("cluster", filter),
    //     this.fetch("dc", filter),
    //     this.fetch("host_name", filter),
    //     this.fetch("agent_id", filter),
    // ).subscribe(
    //   data => {
    //     this.clusters = data[0]
    //     this.dcs = data[1]
    //     // hosts comes in the format 'agentID;hostname'. This enable requesting to cassandra using the agentID
    //     this.hosts = data[2].map(val => { 
    //         var tokens = val.name.split(";")
    //         return {
    //             agent:tokens[0],
    //             host:tokens[1]}
    //      })
    //      if(this.hostsSelected == null ||  this.hostsSelected.length == 0){
    //         this.selectAllAgents()
    //      }
    //     this.props.UiState.selectedChart.startPolling()
    //   },
    //   err => console.error(err)
    // );
    

    
	}

  render () {
    // <input type="button" onClick={this.addMetric} value="Click Me!" />
    //         {this.metrics.map( metric => <button>{metric}</button> )}

      const title = this.props.UiState.selectedChart.title
const counter = this.props.counter;
//<p>there is a <OverlayTrigger overlay={tooltip}><a href="#">tooltip</a></OverlayTrigger> here</p>
    return <div>
              
      
<OverlayTrigger overlay={popover}>
<div>
 <button onClick={this.handleMetricSelectionChange.bind(this)}>+</button>
 <p style={{color: 'black', marginRight: '1rem', marginLeft: '1rem'}}>{this.counter}</p>
{title}
            <Chart 
                chart={ this.props.UiState.selectedChart } 
                // metricNames={this.props.MetricStore.metrics.slice()} 
                // metricStore={this.props.MetricStore}
                // metricNamesFilterOptions={this.props.MetricStore.metricNamesFilterOptions} 
                key={ this.props.UiState.selectedChart.id } 
                />
  </div>
</OverlayTrigger> 
           <VirtualizedSelect
             filterOptions={this.props.MetricStore.metricNamesFilterOptions}
              placeholder="Metrics..."
              labelKey='name'
              multi={true}
              onChange={(value) =>{this.handleMetricSelectionChange(value)}}
              options={this.props.UiState.selectedChart.metricsString}
              simpleValue
              value={this.metricNameSelected}
              valueKey='name'
          />
          <VirtualizedSelect
              placeholder="Clusters..."
              labelKey='name'
              multi={true}
              onChange={(value) =>this.handleClusterSelectionChange.bind(this,value) }
              options={this.clusters}
              simpleValue
              value={this.clustersSelected }
              valueKey='name'
          />

          <VirtualizedSelect
              placeholder="DCs..."
              labelKey='name'
              multi={true}
              onChange={(value) =>this.dcsSelected = value }
              options={this.dcs}
              simpleValue
              value={this.dcsSelected }
              valueKey='name'
          />

           <VirtualizedSelect
              placeholder="Hosts..."
              labelKey='host'
              multi={true}
              onChange={(value) =>this.handleHostSelectionChange(value)}
              options={this.hosts}
              simpleValue
              value={this.hostsSelected }
              valueKey='agent'
          />
	  </div>
  }
}

export default observer(['MetricStore', 'UiState'],ChartEditor);
