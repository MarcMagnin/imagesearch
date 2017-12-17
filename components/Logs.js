import React, { PropTypes } from 'react'
import _ from 'lodash';
import { List } from 'immutable'
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import Chart from './chart/chart';
import GridElement from './primitives/GridElement'
import VirtualizedSelect from 'react-virtualized-select'
import { AutoSizer, Column, CellMeasurer, CellMeasurerCache, Table, SortDirection, SortIndicator } from 'react-virtualized';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import styled from 'styled-components'

const ResponsiveReactGridLayout = WidthProvider(Responsive);
import 'isomorphic-fetch'

const Content = styled.div`
    height:100%;
`;

@observer
class Logs extends React.Component {

  @observable message = "";
  @observable selectedLogTypes = [];
  @observable rowCount = 0;
  @observable freeSearchInput = "";
   @observable open = false;

  constructor(props) {
    super(props)

    this.list = List([{ type: 'jmx', message: 'Software engineer' }, { type: 'GC', message: 'Software engineer' }]);
    this.sortBy = 'index'
    this.sortDirection = SortDirection.ASC
    this.rowCount = this.list.size
    console.log("rowCount", this.rowCount)
    this._cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 25
    })

    console.log("FROM LGVIEW", props)

  }


  handleMetricSelectionChange = (values) => {
    console.log("selected log field :", values)
    this.selectedLogTypes = values

    this.fetchLogs()
  }



  async fetchLogs() {

    var searchQuery = ""
    if (this.freeSearchInput != "") {
      searchQuery += "("
      this.freeSearchInput.trim().split(" ").map(val => {
        searchQuery += "message:*" + val + "* AND "
      })
      searchQuery = searchQuery.substring(0, searchQuery.length - 5);
      searchQuery += ")"
      // filter on types too if types are not selected
      if (this.selectedLogTypes == "") {
        searchQuery += " OR ("
        this.freeSearchInput.trim().split(" ").map(val => {
          searchQuery += "type:*" + val + "* AND "
        })
        searchQuery = searchQuery.substring(0, searchQuery.length - 5);
        searchQuery += ")"
      }
    }

    if (this.selectedLogTypes != "") {

      if (searchQuery.length > 0) {
        searchQuery += " AND "
      }
      searchQuery += "(type:" + this.selectedLogTypes + ")"


    }

    if (searchQuery.length == 0) {
      this.list = List([])
      this.rowCount = this.list.size
    } else {
      var body = JSON.stringify({"keyspace": "cluster_cluster1", "jsonQuery":"{\"q\":\""+ searchQuery +"\"}"})
      console.log("SEACH QUERY: ", body)

      try {

        const res = await fetch('http://127.0.0.1:5000/v2/data/logsSearch', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          //{"q":"(type:jmx,GCwarn) AND  message:*275*","fq":["message:*275*"]}
          //{"q":"(type:jmx OR GCwarn) AND  message:*275*","fq":["message:*275*"]}
          body:body
        });

        /* 
        [
          [
            {
              "node_id": "953f4d04-2b25-11e7-93ae-92361f002671",
              "day": "20170508",
              "timestamp": "cc0efaa5-3428-11e7-8adb-080027549560",
              "message": "{\"objectName\":\"org.apache.cassandra.auth:type=CredentialsCache\",\"operationName\":\"invalidateCredentials\",\"params\":\"String\",\"error\":\"\"}",
              "solr_query": null,
              "tags": null,
              "type": "jmx"
            }
          ],
          [
            {
              "node_id": "953f4d04-2b25-11e7-93ae-92361f002671",
              "day": "20170508",
              "timestamp": "d67770ab-3428-11e7-8adb-080027549560",
              "message": "{\"objectName\":\"org.apache.cassandra.auth:type=CredentialsCache\",\"operationName\":\"invalidate\",\"params\":\"\",\"error\":\"\"}",
              "solr_query": null,
              "tags": null,
              "type": "jmx"
            }
          ]
        ]
        */
        const rawLogs = await res.json();
        var logs = []
      rawLogs.map((log) => {
          log = log[0]
          // this enable the cell rendered to wrap the text of the cell
          logs.push({ type: log.type, time: log.timestamp, tags: log.tags, message: log.message.replace(/,/g, ", ") })
        });

        this.list = List(logs)
        this.rowCount = this.list.size

      } catch (e) {
        console.log('onError: %s', e);
      }
    }
    this.forceUpdate()

  }


  searchFilterUpdated = (input, callback) => {
    this.freeSearchInput = input
    this.fetchLogs()
  }



  _getDatum(list, index) {
    if (list.size != this.list.size) {
      list = this.list
    }
    return list.get(index % list.size)
  }

  _getRowHeight({ index }) {
    return this._getDatum(this.list, index).size
  }

handleRequestClose = () => {
    this.open = false
    
  }
 handleTouchTap = () => {
    this.open = true
  }

   logTypeMenuItems(values) {
     if(this.props.logTypes){
return this.props.logTypes.map((log) => (
      <MenuItem
        key={log.name}
        insetChildren={true}
        checked={values && values.includes(log.name)}
        value={log.name}
        primaryText={log.name}
      />
    ));
     }
     return null
    
  }

  render() {
      const standardActions = (
      <FlatButton
        label='Ok'
        primary={Boolean(true)}
        onTouchTap={this.handleRequestClose}
      />
    )

    // Table data as a array of objects
    const sortedList = this.list
      .sortBy(item => item['index'])
      .update(list =>
        this.sortDirection === SortDirection.DESC
          ? list.reverse()
          : list
      )
    const rowGetter = ({ index }) => this._getDatum(sortedList, index)
    const { width } = 500

      // <Dialog
      //       open={this.open}
      //       title='Super Secret Password'
      //       actions={standardActions}
      //       onRequestClose={this.handleRequestClose}
      //     >
      //       1-2-3-4-5
      //     </Dialog>
      //  <RaisedButton
      //       label='Super Secret Password'
      //       secondary={Boolean(true)}
      //       onTouchTap={this.handleTouchTap} 
      //     />
return (
  <p>Logs</p>
)
 /*  return (
      <Content>
 
        <div className='filtercontainer'>
            <SelectField
              multiple={true}
              hintText="Select a type"
              value={this.selectedLogTypes}
              onChange={(event, index, values) => { this.handleMetricSelectionChange(values) } }
            >
              {this.logTypeMenuItems(this.selectedLogTypes)}
            </SelectField>

          <VirtualizedSelect
            placeholder="Type..."
            labelKey='name'
            onChange={(value) => { this.handleMetricSelectionChange(value) } }
            options={this.props.logTypes}
            multi simpleValue
            value={this.selectedLogTypes}
            valueKey='name'
            />

          <VirtualizedSelect
            placeholder="Search..."
            onInputChange={(input, callback) => { this.searchFilterUpdated(input, callback) } }
            simpleValue
            style={{ minWidth: 300 + 'px' }}
            />
        </div>
        <AutoSizer disableHeight>
          {({ width }) => (
            <Table
              ref='Table'
              headerHeight={50}
              height={500}
              rowClassName={this._rowClassName}
              noRowsRenderer={this._noRowsRenderer}
              overscanRowCount={2}
              rowHeight={50}
              rowGetter={rowGetter}
              rowCount={this.rowCount}
              sortBy={this.sortBy}
              sortDirection={this.sortDirection}
              width={width}
              >
              <Column
                className='tableColumn'
                dataKey='type'
                headerRenderer={this._headerRenderer}
                width={90}
                />
              <Column
                className='tableColumn'
                dataKey='time'
                label='time'
                width={120}
                />
              <Column
                className='tableColumn'
                dataKey='tags'
                label='tags'
                width={120}
                />
              <Column
                className='tableColumn'
                width={width - 200}
                disableSort
                label='message'
                dataKey='message'
                cellRenderer={
                  ({ cellData, columnData, dataKey, rowData, rowIndex }) => {
                    return (

                      <CellMeasurer
                        cache={this._cache}
                        columnIndex={0}
                        key={dataKey}
                        parent={parent}
                        rowIndex={rowIndex}
                        >
                        <div
                          style={{
                            whiteSpace: 'normal'
                          }}
                          >
                          {cellData}
                        </div>
                      </CellMeasurer>

                    )
                  }
                }
                />
            </Table>
          )}
        </AutoSizer>


      </Content>
    )*/
  }

  _rowClassName({ index }) {
    if (index < 0) {
      return 'headerRow'
    } else {
      return index % 2 === 0 ? 'evenRow' : 'oddRow'
    }
  }


  _columnCellRenderer({ cellData, columnData, dataKey, parent, rowData, rowIndex }) {
    const { list } = this.props

    const datum = list.get(rowIndex % list.size)
    const content = rowIndex % 5 === 0
      ? ''
      : datum.randomLong

    return (
      <CellMeasurer

        cache={this._cache}
        columnIndex={0}
        key={dataKey}
        parent={parent}
        rowIndex={rowIndex}
        >
        <div
          className='tableColumn'
          style={{
            whiteSpace: 'normal'
          }}
          >
          {content}
        </div>
      </CellMeasurer>
    )
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

Logs.propTypes = {
  logTypes: PropTypes.array.isRequired
}


export default Logs;



