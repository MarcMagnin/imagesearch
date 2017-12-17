import React from 'react'
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { observable, observe } from 'mobx';
import moment from 'moment';
import { ListItem } from 'material-ui/List';
import { ReactHeight } from 'react-height';

import { List as ImmutableList } from 'immutable'

import { AutoSizer, Column, List, SortDirection } from 'react-virtualized';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';

import MenuItem from 'material-ui/MenuItem';

import { Responsive, WidthProvider } from 'react-grid-layout';
const ResponsiveReactGridLayout = WidthProvider(Responsive);
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';




const APIURL = "192.168.0.10:5000"
const eventsURL = `http://${APIURL}/`

// provide a table for now. Will be removed soon when the API is ready
const SelectFieldIconStyle = { fill: 'rgb(177, 177, 177)' }

const defaultRowHeight = 18
@inject('ChartStore', 'UiState')
@observer
class EventsDashboard extends React.Component {

  @observable eventTypes = []
  @observable eventList = ImmutableList([])
  @observable selectedEventTypes = []

  @observable freeSearchInput = "";

  constructor(props) {
    super(props)
    this.selectedRowIndex = 0
    this.sortBy = 'index'
    this.list = []
    this.selectedRowHeight = 48
    this.previousRowIndex = -1
    this.rowRefs = []
    this.sortDirection = SortDirection.ASC

    this.chartStore = props.ChartStore
    this.logsUrl = `http://${this.chartStore.apiEndpoint}:${this.chartStore.apiPort}/v2/data/getLogs`



    this.fetchFilteringValues()

    this.from = this.chartStore.fromDateTime != undefined ? this.chartStore.fromDateTime.valueOf() : moment.utc().valueOf()
    this.getInitialData()


    this.observers = []
    this.observers.push(observe(this.chartStore, "fromDateTime", (change) => {
      this.from = this.chartStore.fromDateTime.valueOf()
      this.getInitialData()
    }))

    this.observers.push(observe(this.chartStore, "timeZone", (change) => {
      
    }))

    this.observers.push(observe(this.chartStore, "selectedDCs", (change) => {
      this.getInitialData()
    }))
    this.observers.push(observe(this.chartStore, "selectedRacks", (change) => {
      this.getInitialData()
    }))
    this.observers.push(observe(this.chartStore, "selectedHosts", (change) => {
      this.getInitialData()
    }))


  }


  buildFilterPredicates = () => {
    var predicates = []
    if (this.chartStore.selectedDCs.length > 0) {
      predicates.push({
        name: "dc",
        values: _.flatMap(this.chartStore.selectedDCs.map(dc => JSON.parse(dc).name))
      })
    }
    if (this.chartStore.selectedRacks.length > 0) {
      predicates.push({
        name: "rack",
        values: _.flatMap(this.chartStore.selectedRacks.map(rack => JSON.parse(rack).name))
      })
    }
    if (this.chartStore.selectedHosts.length > 0) {
      predicates.push({
        name: "hostname",
        values: _.flatMap(this.chartStore.selectedHosts.map(host => JSON.parse(host).name))
      })
    }
    return predicates
  }


  async fetchFilteringValues() {
    try {

      // const res = await fetch('http://127.0.0.1:5000/v1/logsFacet', {
      //   method: 'POST',
      //   headers: {
      //     'Accept': 'application/json',
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({"keyspace": "cluster_cluster1", "jsonQuery":"{\"q\":\"*:*\",\"facet\":{\"pivot\":\"type\",\"limit\":\"-1\"}}"})
      // });

      const res = await fetch('http://192.168.0.48:8983/solr/cluster_test_cluster.logs/select?q=*%3A*&facet.limit=-1&wt=json&indent=true&facet=true&facet.pivot=type&rows=0', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });




      /*
      [
        {
          "facet_pivot": {
            "type": [
              {
                "field": "type",
                "value": "jmx",
                "count": 2
              }
            ]
          }
        }
      ]
      */
      const eventTypesResponse = await res.json()
      console.log('facetResponse: %s', JSON.stringify(eventTypesResponse));
      /*
      {
        "responseHeader":{
          "status":0,
          "QTime":138},
        "response":{"numFound":18,"start":0,"docs":[]
        },
        "facet_counts":{
          "facet_queries":{},
          "facet_fields":{},
          "facet_ranges":{},
          "facet_intervals":{},
          "facet_heatmaps":{},
          "facet_pivot":{
            "type":[{
                "field":"type",
                "value":"GCwarn",
                "count":1},
              {
                "field":"type",
                "value":"jmx",
                "count":11},
              {
                "field":"type",
                "value":"repair",
                "count":6}]}}}
      */

      eventTypesResponse.facet_counts.facet_pivot.type.map((type) => {
        this.eventTypes.push({ name: type.value })
      });
    } catch (e) {
      console.log('onError: %s', e);
    }
  }


  buildSearchPredicates = () => {
    var predicates = []
    if (this.chartStore.selectedDCs.length > 0) {
      predicates.push({
        name: "dc",
        values: _.flatMap(this.chartStore.selectedDCs.map(dc => JSON.parse(dc).name))
      })
    }
    if (this.chartStore.selectedRacks.length > 0) {
      predicates.push({
        name: "rack",
        values: _.flatMap(this.chartStore.selectedRacks.map(rack => JSON.parse(rack).name))
      })
    }
    if (this.chartStore.selectedHosts.length > 0) {
      predicates.push({
        name: "hostname",
        values: _.flatMap(this.chartStore.selectedHosts.map(host => JSON.parse(host).name))
      })
    }
    if (this.freeSearchInput != "") {
      predicates.push({
        name: "message",
        values: [this.freeSearchInput]
      })
    }
    return predicates
  }



  async getInitialData() {


    this.body = {
      locator:{
          customerId:this.props.ChartStore.customerId,
          componentId:this.props.ChartStore.componentId,
          clusterId:this.props.ChartStore.clusterId
        },
      from: this.from,
      to: this.props.ChartStore.toDateTime != undefined ? this.props.ChartStore.toDateTime.valueOf() : moment.utc().valueOf(),
      predicates: this.buildSearchPredicates()
    };
    if (this.body.predicates.length == 0)
      delete this.body.predicates

    var res = await fetch(this.logsUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.body)
    });


/*
{  
   "metadata":{  
      "_count":"61",
      "_countTotal":"61",
      "_solrQuery":"http://127.0.0.1:8983/solr/cluster_test_cluster.logs/select?q=(time%3A%5B2017-07-19T18%3A51%3A37.981Z+TO+2017-07-19T18%3A56%3A37.987Z%5D)+AND+(message%3Awarn)&wt=json&rows=500"
   },
"data":[  
      {  
         "ip":"127.0.0.1",
         "source":"Cassandra",
         "dc":"Solr",
         "_uniqueKey":"[\"3e3af598-a075-4471-80f5-ebcd9048360e\",\"201707\",\"1500490422985\"]",
         "node_id":"3e3af598-a075-4471-80f5-ebcd9048360e",
         "host":"MarcUbuntu16",
         "cluster":"Test Cluster",
         "rack":"rack1",
         "message":"WARN  [Solr TTL scheduler-0] 2017-07-19 20:53:42,985  AbstractSolrSecondaryIndex.java:1692 - Cannot find core cluster_test_cluster.logs\n",
         "time":"2017-07-19T18:53:42.985Z",
         "type":"Log",
         "day":"201707"
      },*/

    const rawLogs = await res.json();
    var logs = []
    rawLogs.data.logs.map((event) => {

      // this enable the cell rendered to wrap the text of the cell
      //logs.push({ type: event.type, time: event.timestamp, tags: event.tags, message: event.message.replace(/,/g, ", ") })
      logs.push(event)
    });

    this.eventList = ImmutableList(logs)
    this.rowCount = this.eventList.size


  }

  handlefreeSearchChange = (event) => {
    this.freeSearchInput = event.target.value
    this.getInitialData()
  }

  handleSelectedEventTypes = (event, key, values) => {
    this.selectedEventTypes = values
    this.getInitialData()
  }

  generateEventTypesMenuItems() {
    return this.eventTypes.map((eventType) => (
      <MenuItem
        key={eventType.name}
        insetChildren={true}
        checked={this.selectedEventTypes && this.selectedEventTypes.indexOf(eventType.name) > -1}
        value={eventType.name}
        primaryText={eventType.name}
        />
    ));
  }


  componentWillUnmount() {
    this.observers.map(observer => {
      observer()
    })
  }


  render() {
    // Table data as a array of objects
    const rowCount = this.eventList.size
    return (
      <div className="eventsPageContainer">
        <div className="eventToolbar rowContainer">
          <SelectField
            multiple={true}

            floatingLabelText="Types"
            hintText="Filter by types"
            value={this.selectedEventTypes.length > 0 ? this.selectedEventTypes : null}
            onChange={this.handleSelectedEventTypes}
            menuStyle={{
              width: 'auto',
            }}
            iconStyle={SelectFieldIconStyle}
            >
            {this.generateEventTypesMenuItems()}
          </SelectField>
          <TextField
            fullWidth={true}
            value={this.freeSearchInput}
            onChange={this.handlefreeSearchChange}
            floatingLabelText="Search..."
            />
        </div>
        <AutoSizer >
          {({  width, height }) => (
            <List
              className="list"
              width={width}
              height={height - 80}
              overscanRowCount={10}
              noRowsRenderer={this._noRowsRenderer}
              rowClassName={this._rowClassName}
              rowHeight={this._getRowHeight}
              rowCount={rowCount}
              rowRenderer={this._rowRenderer}
              ref={e => { this.virtList = e } }
              />
          )}
        </AutoSizer>
        <style jsx>{`
 
           .eventsPageContainer{
              height: calc(100% - 100px);
              padding: 0 0 0 1rem;
           }
          .list{
            color: #333;
            #color: #ddd;
               
          }
          .eventToolbar{
              padding : 0 1rem 0 0 !important;
          }
        
        `}</style>
        <style jsx global>{`
          .rowContainer {
            display: flex;
           
            }
          .event{
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
             line-height: 18px;
            white-space: nowrap;
            padding-right: 16px;
             font-size:12px;
            #border-style: solid;
            #border-width: 1px;
          }
          .eventText{
            margin-right: 7px;
           font-family: monospace;
          }
          .eventType{
            color: #2783a0;
            background-color: #dadada;
          }
          .eventTimestamp{
            color: #2783a0;
            background-color: #dadada;
          }
          .timeStampCell{
            max-width: 150px;
          }
          .typeCell{
             max-width: 100px;
          }
          div[role="presentation"]{
                      width: auto !important;
           }
          div[role="menu"]{
              width: auto !important;
          }        
          
          .hostCell{
             max-width:200px;
          }
          
        .selected {
         /* text-indent: -5px;*/
           text-overflow: initial;
           overflow:initial;
            white-space: pre-line;
            word-wrap: break-word;
          }
          `}</style>
      </div>
    )
  }

  handleEventItemTap = (e, index) => {
    e.stopPropagation()
    this.selectedRowIndex = index
    this.virtList.recomputeRowHeights();
    //this.virtList.forceUpdateGrid();
  }

  handleEventClick = (e, index) => {
    e.stopPropagation()
    this.eventList.get(index).selected = this.eventList.get(index).selected ? !this.eventList.get(index).selected : true
    this.virtList.recomputeRowHeights();
    this.virtList.forceUpdateGrid();
  }

  _noRowsRenderer() {
    return (
      <div >
        No rows
      </div>
    )
  }

  _rowRenderer = ({ index, isScrolling, key, style }) => {
    let item = this.eventList.get(index)
    return <div key={key}
      style={style}
      onClick={() => this.handleEventClick(event, index)}>
      <ReactHeight
        className={item.selected ? 'event selected' : 'event'}
        onHeightReady={(height) => {
          item.height = height;
          this.virtList.recomputeRowHeights();
          //this.handleEventItemTap(null, index)
        } }
        >
        <span className="eventText eventTimestamp">{item.time}</span><span className="eventText eventType">{item.type}</span><span className="eventText">{item.message}</span>
      </ReactHeight>

    </div>
  }
  _getDatum(list, index) {
    if (list.size != this.eventList.size) {
      list = this.eventList
    }
    return list.get(index % list.size)
  }

  _getRowHeight = ({index}) => {
    let item = this.eventList.get(index)
    return (item.selected && item.height) ? item.height : defaultRowHeight
  }

  _rowClassName({ index }) {
    if (index < 0) {
      return 'headerRow'
    } else {
      return index % 2 === 0 ? 'evenRow' : 'oddRow'
    }
  }


  _headerRenderer({
    columnData,
    dataKey,
    disableSort,
    label,
    sortBy,
    sortDirection
  }) {
    return (
      <div>
        type
        {sortBy === dataKey &&
          <SortIndicator sortDirection={sortDirection} />
        }
      </div>
    )
  }
}

EventsDashboard.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  loggedUser: PropTypes.object,
}


export default EventsDashboard

