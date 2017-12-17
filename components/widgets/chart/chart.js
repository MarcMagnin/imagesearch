import React from 'react';
import { observer, inject } from 'mobx-react';
import { observable, observe, action } from 'mobx';
//import 'rxjs/add/observable/dom/ajax'
// import Autocomplete from 'react-autocomplete'
import moment from 'moment';
import _ from 'lodash';
import sizeMe from 'react-sizeme';

import ReactHighcharts from 'react-highcharts';
//import MetricsGraphics from 'react-metrics-graphics';
import Paper from 'material-ui/Paper';

import * as widgetConstants from '../../../stores/models/constants'

import { Observable } from 'rxjs/Rx';


@inject('ChartStore', 'UiState')
@observer
class Chart extends React.Component {

    static initInterval = 5000;
    interval = widgetConstants.pollInitInterval;
    static maxInterval = 100000;

  @observable refreshFlag = false;
  @observable dcs = null;
  @observable dcsSelected = null;
  @observable clusters = null;
  @observable clustersSelected = null;
  @observable hosts = null;
  @observable hostsSelected = null;
  @observable metrics = [];
  @observable metricNameSelected = null;
  @observable title;
  @observable isResizing = false;
  
  constructor(props) {
    super(props)

    this.series = null;
    this.props = props


    // TODO set it only once
    // ReactHighcharts.Highcharts.setOptions({
    //   global: {
    //     useUTC: this.props.ChartStore.timeZone == "UTC"
    //   }
    // });
    this.chart = props.context
    this.config = props.context.config
    this.queryingData = false
    this.isAlive = true
    // set defaults to configs
    this.config.credits = { enabled: false }
    // this.config.tooltip = {
    //   //crosshairs: [true, true],
    //   //backgroundColor: 'rgba(55, 55, 55, 0.9)',
    //   borderColor: 'black',
    //   borderRadius: 3,
    //   borderWidth: 1,
    //   shadow: false,
    //   pointFormat: '<span style="color:{series.color}">\u25CF {series.name}</span>: <b style="color:white">{point.y}</b><p style="color:white">({point.change}%)</p><br/>',
    //   //split: true

    //   //   useHTML: true,
    //   // backgroundColor: null,
    //   // borderWidth: 0,
    //   // shadow: false,
    //   // formatter: function(){
    //   //     return '<div style="background-color:' + this.series.color + '" class="tooltip"> ' +
    //   //             this.series.name + '<br>' + this.key + '<br>' + this.y +
    //   //         '</div>';
    // }
    
    this.config.chart.reflow = false // must be set to false otherwise resize will blank the chart
    this.config.plotOptions.series.animation = true // must be set to enable resize
    this.config.plotOptions.series.compare = 'percent'
    this.config.plotOptions.series.showInNavigator = true

    this.metricbyIdURL = `http://${this.props.ChartStore.apiEndpoint}:${this.props.ChartStore.apiPort}/${this.props.ChartStore.apiVersion}/getMetricsById`
    this.metricbyNameURL = `http://${this.props.ChartStore.apiEndpoint}:${this.props.ChartStore.apiPort}/${this.props.ChartStore.apiVersion}/getMetricsByName`

    this.from = this.props.ChartStore.fromDateTime != undefined ? this.props.ChartStore.fromDateTime.valueOf() : moment.utc().valueOf()
    this.lastRequestTime = moment.utc().valueOf()
    this.getInitialData(this.lastRequestTime)

   
    this.observers = []
    this.observers.push(observe(this.props.ChartStore, "fromDateTime", (change) => {
      this.from = this.props.ChartStore.fromDateTime.valueOf()
      this.lastRequestTime = moment.utc().valueOf()
      this.getInitialData(this.lastRequestTime)
    }))

    this.observers.push(observe(this.props.ChartStore, "toDateTime", (change) => {
      this.to = this.props.ChartStore.toDateTime.valueOf()
      this.lastRequestTime = moment.utc().valueOf()
      this.getInitialData(this.lastRequestTime)
    }))

    this.observers.push(observe(this.props.ChartStore, "timeZone", (change) => {
      ReactHighcharts.Highcharts.setOptions({
        global: {
          useUTC: this.props.ChartStore.timeZone == "UTC"
        }
      })
      this.chartView.redraw()
    }))

    this.observers.push(observe(this.props.ChartStore, "selectedDCs", (change) => {
      this.lastRequestTime = moment.utc().valueOf()
      this.getInitialData(this.lastRequestTime)
    }))
    this.observers.push(observe(this.props.ChartStore, "selectedRacks", (change) => {
      this.lastRequestTime = moment.utc().valueOf()
      this.getInitialData(this.lastRequestTime)
    }))
    this.observers.push(observe(this.props.ChartStore, "selectedHosts", (change) => {
      this.lastRequestTime = moment.utc().valueOf()
      this.getInitialData(this.lastRequestTime)
    }))

  }

  buildFilterPredicates = () => {
    var predicates = []
    if (this.props.ChartStore.selectedDCs.length > 0) {
      predicates.push({
        name: "dc",
        values: _.flatMap(this.props.ChartStore.selectedDCs.map(dc => JSON.parse(dc).name))
      })
    }
    if (this.props.ChartStore.selectedRacks.length > 0) {
      predicates.push({
        name: "rack",
        values: _.flatMap(this.props.ChartStore.selectedRacks.map(rack => JSON.parse(rack).name))
      })
    }
    if (this.props.ChartStore.selectedHosts.length > 0) {
      predicates.push({
        name: "hostname",
        values: _.flatMap(this.props.ChartStore.selectedHosts.map(host => JSON.parse(host).name))
      })
    }

    if (this.props.context.predicates != null) {
      this.props.context.predicates.map(p => predicates.push(p))
    }
    return predicates
  }


  async getInitialData(lastRequestTime) {
    this.unMount()
    this.queryingData = true
    this.realTime = moment.duration(moment.utc().diff(this.from)).asMinutes() < 59 && this.props.UiState.isCustomTimeSelected == false
    if (this.realTime) {
      this.maxPointOnChart = moment.duration(moment.utc().diff(this.from)).asMinutes() < 6 ? 60 : 360
    }

    this.body = {
        locator:{
          customerId:this.props.ChartStore.customerId,
          componentId:this.props.ChartStore.componentId,
          clusterId:this.props.ChartStore.clusterId
        },
      identities: [this.chart.pattern],
      from: this.from,
      to: this.props.ChartStore.toDateTime != undefined ? this.props.ChartStore.toDateTime.valueOf() : moment.utc().valueOf(),
      humanFrom: new Date(this.from),
      humanTo: new Date(this.to),
      predicates: this.buildFilterPredicates()
    };

    if(this.props.context.proc != undefined){
        this.body.proc = this.props.context.proc
    }


    var res = await fetch(this.metricbyNameURL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.body)
    });
    this.queryingData = false

    if (lastRequestTime != this.lastRequestTime)
      return

    var result = await res.json();
    /*
    {
      "metric_id": -38313022,
      "rows": "[[Mon May 22 18:41:20 CEST 2017, 8.0], [Mon May 22 18:41:17 CEST 2017, 22.0]]
    }
    */

    //for (var k in res.aggregations.metric.buckets) {
    //  result.push({ name: res.aggregations.metric.buckets[k].key });
    //}
    if (this.chartView.series) {
      while (this.chartView.series.length > 0)
        this.chartView.series[0].remove(false);
    }
    this.series = []
    this.metricIds = []


    if (this.realTime) {
      this.chartView.xAxis[0].setExtremes(moment(this.from).toDate(), moment(this.to).toDate(), false)
      this.chartView.xAxis[0].setExtremes(null, null)
    } else {
      if (this.from) {
        this.chartView.xAxis[0].setExtremes(moment(this.from).toDate(), moment(this.to).toDate(), false)
      }
    }

    result.entries[0].entries.map((serie, i) => {
        if (lastRequestTime != this.lastRequestTime)
          return
        //serie.data.reverse()
        this.metricIds.push(serie.metadata._id)
        this.series.push({
          options: {
            metricId: serie.metadata._id,
            dc: serie.metadata.dc,
            cluster: serie.metadata.cluster,
            rack: serie.metadata.rack,
            region: serie.metadata.region,
            zone: serie.metadata.zone,
          },

          name: serie.metadata.hostname + " - " + (this.props.context.legend ? serie.metadata[this.props.context.legend] : ""),

          legendField: serie.metadata[this.props.context.legendField],
          data: serie.data.dataPoints,
          lineWidth: 1,
                marker: {
                    enabled: false,
                },
          })
        //this.chartView.addSeries(this.series[i])
      // redraw charts
      this.forceUpdate()
    })


    // prevent refresh for old data
    if (this.realTime) {
      this.moveTimeRangeWindow(this.body)
      setTimeout(function (obj) {
        // secure predefined time selection spamming or page change
        if (obj.lastRequestTime != obj._this.lastRequestTime || obj._this.isAlive == false) {
          return
        }
        console.log("START POLLING")
        obj._this.startPolling()
      }, 5000, { _this: this, lastRequestTime: this.lastRequestTime });
    }
  }

  // clean subscription in case we leave the page or add other metrics 
  unMount() {
    if (this.pollSubscriber) {
      this.pollSubscriber.unsubscribe();
    }
  }


  getData() {
    this.queryingData = true
    return Observable.ajax({
      url: this.metricbyIdURL,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.body),
      responseType: 'json'
    })
  }

  moveTimeRangeWindow(body) {
    body.from = body.to
    body.to = moment.utc().valueOf()
    body.humanFrom = new Date(body.to)
    body.humanTo = moment.utc()
    //   console.log(moment.utc(body.from).format() + "->" + moment.utc(body.to).format())

  }

  startPolling = action(function () {
    this.unMount()

    this.body.identities = this.metricIds


    var rcv = this
    // creates a wrapper observable object
    let wrapperObservable = Observable.create((observer) => {

      // fetches records
      rcv.getData().retryWhen(function (errors) {
        return errors.scan(function (acc, x) { return acc + x; }, 0)
          .flatMap(function (x) {
            return Observable.timer(rcv.computeInterval(true));
          });
      }).subscribe((response) => {
        // notifies wrapperObservable subscribers
        observer.next(response.response.entries);
        observer.complete();
      });
    });
    // subscribes to the wrapper observable and repeats.
    rcv.pollSubscriber = wrapperObservable.repeatWhen(function (notification) {
      return notification
        .scan(function (acc, x) {
          return acc + x;
        }, 0)
        .flatMap(function (x) {
          return Observable.timer(rcv.computeInterval());
        });
    }).subscribe(
      (response) => {
        this.queryingData = false
        this.moveTimeRangeWindow(rcv.body)
        //   console.log( "From:     "+moment.utc(rcv.body.from).format() +" -> To:"+ moment.utc(rcv.body.to).format())
        let lastSerie = _.last(response)
        response.map((serie, i) => {
          if (this.queryingData)
            return
          let targetedSerie = _.find(this.chartView.series, (s) => s.options.options.metricId == serie.metadata.id);
          
          if (targetedSerie == null)
            return
          let shift = targetedSerie.data.length >= this.maxPointOnChart; // shift if the series is 
          serie.data.dataPoints.map(dataPoint => {
            if (this.queryingData)
              return
            // if(shift ){
            //   console.log("DAMN: ", this.chartView.xAxis[0])
            //   this.chartView.xAxis[0].setExtremes(null, null)
            // }
            //console.log("Received: "+ moment.utc(dataPoint[0]).format("DD/MM hh:mm:ss.SSS ZZ")+":"+dataPoint[1])
            //console.log("Received: "+ moment.utc(dataPoint[0]).format("ss"))
            // console.log("Setting: "+ moment.utc(dataPoint[0]).format("ss.SSS"))
            // only make the last one redraw the chart to sync the refresh and prevent UI glitch
            targetedSerie.addPoint(dataPoint, false, shift);

          })
        })
        this.chartView.redraw();



      }
      )

  })


  // backoff logic
  computeInterval(error) {
    if (error) {
      // double until maximum interval on errors
      this.interval = this.interval < Chart.maxInterval ? this.interval * 2 : Chart.maxInterval;
    } else {
      // anytime the poller succeeds, make sure we've reset to
      // default interval.. this also allows the initInterval to 
      // change while the poller is running
      this.interval = Chart.initInterval;
    }
    return this.interval;
  }

  componentWillUpdate() {

  }


  componentWillReact() {

  }

  componentWillUnmount() {
    this.unMount()
    this.observers.map(observer => {
      observer()
    })
    this.isAlive = false
  }



  componentDidMount = () => {
  }







  componentWillReceiveProps(nextProps) {

  }

  afterRender = (chart) => {
    this.chartView = chart

  };

  // other focused component don't unfocus so we need to add this logic 
  @action handleChartTap = (event) => {
    this.props.UiState.forceUnfocus()
  }

  render() {

         

    // <input type="button" onClick={this.addMetric} value="Click Me!" />
    //         {this.metrics.map( metric => <button>{metric}</button> )}
    //<div ref={el => {if (el){this.elem = el}}} data={this.props.chart? this.props.chart.data: undefined} />

    // <ol>

    //   {this.props.chart ? this.props.chart.metrics.map(metric => <button>{metric.name}</button>) : "No metric yet"}
    // </ol>

    const { width, height } = this.props.size;
    //const isResizing = this.chart ? this.chart.isResizing : false
    this.config.chart.width = width
    this.config.chart.height = height - 18
    this.config.series = this.series
    if (this.series) {
      // console.log("RESIZIN!!!", isResizing)
      // if (isResizing) {
      //   this.config.series.map(serie => {
      //     serie.animation = false
      //   })
      //  }
      // else {
      // this.config.series.map(serie => {
      //   serie.animation = true
      // })
      //}
      this.config.plotOptions.series.animation = false
    }
 
        return <div className="containerOC" onMouseDown={this.handleChartTap} style={this.containerStyle}>
            <div className="topSectionOC" style={this.titleSectionStyle}>
                <div className="title">
                    <div className="innerTitleSectionOC">
                        <div dangerouslySetInnerHTML={{ __html: this.props.context.title }}>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bodyOC">
                <ReactHighcharts
                    config={this.config} callback={this.afterRender}
                    />
            </div>

            <div className="counterFooterOC">
              
            </div>
            <style jsx>{`
                    .slaContainer{
                        
                        position: absolute;
                        top: -15px;
                    }

                    .topSectionOC{
                         z-index:5;
                        flex: 0 0 auto;
                        font-size: 0.9em;
                        background-color: rgba(229, 229, 229, 0.7);
                        padding:0 0 0 3px;
                        cursor: default;
                    }

                    .textButton{
                       cursor : pointer;
                       transition: 0.1s;
                        background-color: rgba(61, 61, 61, 0.1);
                        border-radius: 2px;
                        padding: 1px 3px;
                        width: fit-content;
                        font-size: 0.7em; 
                    }
                    .textButton:hover{
                       background-color: rgba(61, 61, 61, 0.3);
                    }
                    .title{
                        display:flex;
                        justify-content: space-between;
                        color:#878787;
                       
                    }
                    .bodyOC{
                        display:flex;align-items:center;
                        flex: 1;
                        width:100%;
                    }
                    .topRightSection{
                        margin:3px;
                          display:flex;
                         flex-direction: column;
                        align-items: flex-end;
                    }
                      .titleTextButton{
                       cursor : pointer;
                       transition: 0.1s;
                        border-radius: 2px;
                        margin: 2px;
                        padding: 0px 3px;
                        width: fit-content;
                        font-size: 0.9em; 
                    }
                    .titleTextButton:hover{
                       background-color: rgba(255, 255, 255, 0.7);
                    }
                    .innerTitleSectionOC{
                        display:flex;
                    }
          .containerOC {
              cursor: default;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
     
         
  .counterFooterOC{
      position:relative;
              flex: 0 0 auto;
          }
        `}</style>


        </div>

    }
}


export default sizeMe({ monitorHeight: true })(Chart);