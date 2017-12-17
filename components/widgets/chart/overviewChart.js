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


import Popover, { PopoverAnimationVertical } from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

import * as widgetConstants from '../../../stores/models/constants'
import { Observable } from 'rxjs/Rx';


const bucketTimeMargin = 10

@inject('ChartStore', 'UiState')
@observer
class OverviewChart extends React.Component {

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


    @observable frequencyMenuOpen = false
    @observable timeRangeMenuOpen = false
    @observable selectedPercentile = widgetConstants.PERCENTILES.P99
    @observable selectedTimeRange = widgetConstants.TIME_RANGES.m5


    titleSectionStyle = {
        fontSize: '0.9em',
        padding: '0 0 0 3px'
    }
    titleTextButtonStyle = {
        margin: '2px'
    }
    textButtonStyle = {
        padding: '1px 3px'
    }
    topRightSectionStyle = {
        margin: '3px'
    }

    constructor(props) {
        super(props)


        this.series = null;
        this.props = props
        this.maxY = 0;
        this.selectedPercentile = this.props.context.percentile
        // load this from some cache
        this.selectedFrequency = widgetConstants.FREQUENCY.min

        if (this.props.context.conversionFunction != undefined) {
            this.convert = this.convertToUnit
        } else {
            this.convert = () => { }
        }
        if (this.props.context.invert != undefined) {
            this.invert = this.invertData
        } else {
            this.invert = () => { }
        }


        // TODO set it only once
        // ReactHighcharts.Highcharts.setOptions({
        //     global: {
        //         useUTC: this.props.ChartStore.timeZone == "UTC"
        //     }
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

        this.selectedFrequency = this.props.context.frequency


        this.endpoint = `http://${this.props.ChartStore.apiEndpoint}:${this.props.ChartStore.apiPort}/${this.props.ChartStore.apiVersion}/${this.props.context.endpoint}`

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

    buildProc = () => {
        return [{
            name: this.props.context.proc[0].name,
            params: {
                timeBucketLength: this.selectedFrequency.timeBucketSize
            }
        }]
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



    invertData(dataPoint, scope) {
        if (this.maxY < dataPoint[1]) {
            this.maxY = dataPoint[1]
        }
        if (this.props.context.invert != undefined) {
            if (_.includes(this.props.context.invert, scope)) {
                dataPoint[1] *= -1
            }
        }
        return dataPoint
    }

    convertToUnit(dataPoint) {
        dataPoint[1] = this.props.context.conversionFunction(dataPoint[1], this.props.context.conversionFactor)
        return dataPoint
    }


    processData(data, legendField) {
        if (this.props.context.conversionFunction != undefined || this.props.context.invert != undefined) {
            _.each(data, (dataPoint) => {
                this.convert(dataPoint)
                this.invert(dataPoint, legendField)
            })
        }
        return data
    }

    async getInitialData(lastRequestTime) {
        this.unMount()
        this.queryingData = true

        /*   this.realTime = moment.duration(moment.utc().diff(this.from)).asMinutes() < 59 && this.props.UiState.isCustomTimeSelected == false
           if (this.realTime) {
               this.maxPointOnChart = moment.duration(moment.utc().diff(this.from)).asMinutes() < 6 ? 60 : 360
           }*/

        this.maxPointOnChart = this.selectedTimeRange.value * 60 / this.selectedFrequency.refresh

        let now = moment().utc().set('millisecond', 0);
        this.from = now.clone().subtract(this.selectedTimeRange.value, 'minutes')
        let to = now.clone()

        this.body = {
             locator:{
                customerId:this.props.ChartStore.customerId,
                componentId:this.props.ChartStore.componentId,
                clusterId:this.props.ChartStore.clusterId
            },
            identities: [this.chart.pattern],
            from: this.from.valueOf(),
            to: to.valueOf(),
            humanFrom: new Date(this.from),
            humanTo: new Date(to),
            predicates: this.buildFilterPredicates(),
            proc: this.buildProc()
        };
        this.from = to

        var res = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.body),
            responseType: 'json'
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


        this.maxY = 0
        let current = result.entries[0];
        while (current.entries[0] != undefined && current.entries[0].data == undefined) {
            current = current.entries[0];
        }

        //let cluster = entry.metadata.cluster
        current.entries.map((serie, i) => {
            if (lastRequestTime != this.lastRequestTime)
                return
            //serie.data.reverse()

            this.metricIds.push(serie.metadata._id)
            console.log("PUSHING SERIE", serie.metadata[this.props.context.legendField])
            this.series.push({
                options: {
                    metricId: serie.metadata._id,
                    dc: serie.metadata.dc,
                    cluster: this.props.context.legendField,
                    rack: serie.metadata.rack,
                    region: serie.metadata.region,
                    zone: serie.metadata.zone,
                },

                name: (this.props.context.legendField ? serie.metadata[this.props.context.legendField] : ""),
                legendField: serie.metadata[this.props.context.legendField],

                data: this.processData(serie.data.dataPoints, serie.metadata[this.props.context.legendField]),
                lineWidth: 1,
                marker: {
                    enabled: false,
                },
                //this.chartView.addSeries(this.series[i])
            })

        })
        // redraw charts
        this.forceUpdate()

        // prevent refresh for old data
        // if (this.realTime) {
        setTimeout(function (obj) {
            // secure predefined time selection spamming or page change
            if (obj.lastRequestTime != obj._this.lastRequestTime || obj._this.isAlive == false) {
                return
            }
            console.log("START POLLING")
            obj._this.startPolling()
        }, this.selectedFrequency.refresh * 1000/*5000*/, { _this: this, lastRequestTime: this.lastRequestTime });
        //  }
    }

    // clean subscription in case we leave the page or add other metrics 
    unMount() {
        if (this.pollSubscriber) {
            this.pollSubscriber.unsubscribe();
        }
    }


    getData() {
        this.queryingData = true
        this.moveTimeRangeWindow(this.body)
        return Observable.ajax({
            url: this.endpoint,
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
        // clone is required as substract mutate
        // let from = now.clone().subtract(this.selectedFrequency.refresh, 'seconds').subtract(bucketTimeMargin, 'seconds')
        let to = this.from.clone().add(this.selectedFrequency.refresh, 'seconds')
        body.from = this.from.valueOf()
        body.to = to.valueOf()
        body.humanFrom = new Date(this.from)
        body.humanTo = new Date(to)
        body.proc = this.buildProc()
        this.from = to
    }

    startPolling = action(function () {
        this.unMount()

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
                console.log(response)
                observer.next(response.response);
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
                  let current = response.entries[0];
                while (current.entries[0] != undefined && current.entries[0].data == undefined) {
                    current = current.entries[0];
                }

                this.queryingData = false
                //   console.log( "From:     "+moment.utc(rcv.body.from).format() +" -> To:"+ moment.utc(rcv.body.to).format())
                let lastSerie = _.last(current.entries)
                current.entries.map((serie, i) => {
                    if (this.queryingData)
                        return
                    let targetedSerie = _.find(this.chartView.series, (s) => s.userOptions.legendField == serie.metadata.scope);
                    if (targetedSerie == null)
                        return
                    let shift = targetedSerie.data.length >= this.maxPointOnChart; // shift if the series is 
                    serie.data = this.processData(serie.data.dataPoints, targetedSerie.userOptions.legendField)
                    serie.data.map(dataPoint => {
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
               
                if (this.props.context.invert != undefined) {
                    this.chartView.yAxis[0].setExtremes(-this.maxY, this.maxY, false)
                }
                this.chartView.redraw();

            })
    })


    // backoff logic
    computeInterval(error) {
        if (error) {
            // double until maximum interval on errors
            this.interval = this.selectedFrequency.refresh * 1000 < widgetConstants.pollMaxInterval ? this.selectedFrequency.refresh * 1000 * 2 : widgetConstants.pollMaxInterval;
        } else {
            // anytime the poller succeeds, make sure we've reset to
            // default interval.. this also allows the initInterval to 
            // change while the poller is running
            this.interval = this.selectedFrequency.refresh * 1000;
        }
        return this.interval;
        //return 5000;
    }

    componentWillUnmount() {
        this.unMount()
        this.observers.map(observer => {
            observer()
        })
        this.isAlive = false
    }


    afterRender = (chart) => {
        this.chartView = chart

    };

    // other focused component don't unfocus so we need to add this logic 
    @action handleChartTap = (event) => {
        this.props.UiState.forceUnfocus()
    }


    @action handleTimeRangeSelection = (event, menuItem, index) => {
        this.selectedTimeRange = menuItem.props.value
        this.timeRangeMenuOpen = false
        this.getInitialData(this.lastRequestTime = moment.utc().valueOf())
    }

    @action handleTimeRangeTap = (event) => {
        this.timeRangeMenuOpen = true

    }
    @action timeRangeMenuClose = () => {
        this.timeRangeMenuOpen = false
    }

    @action handleFrequencySelect = (event, menuItem, index) => {
        this.selectedFrequency = menuItem.props.value
        this.frequencyMenuOpen = false
        this.getInitialData(this.lastRequestTime = moment.utc().valueOf())
    }

    @action handleFrequencyTap = (event) => {
        this.frequencyMenuOpen = true

    }

    @action handleFrequencyMenuClose = () => {
        this.frequencyMenuOpen = false
    }

    render() {
        const { width, height } = this.props.size;

        if (width > 150) {

            this.config.yAxis.labels.style.fontSize = '0.9em'
            this.config.xAxis.labels.style.fontSize = '0.9em'
            this.titleSectionStyle = {
                ...this.titleSectionStyle,
                fontSize: '0.9em',
                padding: '0 0 0 3px'
            }
            this.titleTextButtonStyle = {
                ...this.titleTextButtonStyle,
                margin: '2px'
            }
            this.textButtonStyle = {
                ...this.textButtonStyle,
                padding: '1px 3px'
            }
            this.topRightSectionStyle = {
                ...this.topRightSectionStyle,
                margin: '3px'
            }

        } else {
            this.config.yAxis.labels.style.fontSize = '0.7em'
            this.config.xAxis.labels.style.fontSize = '0.7em'
            this.titleSectionStyle = {
                ...this.titleSectionStyle,
                fontSize: '0.7em',
                padding: '0'
            }
            this.titleTextButtonStyle = {
                ...this.titleTextButtonStyle,
                margin: '1px 0 0 0'
            }
            this.textButtonStyle = {
                ...this.textButtonStyle,
                padding: '0'
            }
            this.topRightSectionStyle = {
                ...this.topRightSectionStyle,
                margin: '1px'
            }
        }

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

        if (this.props.context.invert != undefined) {
            this.config.yAxis.max = this.maxY
            this.config.yAxis.min = -this.maxY

        }


        return <div className="containerOC" onMouseDown={this.handleChartTap} style={this.containerStyle}>
            <div className="topSectionOC" style={this.titleSectionStyle}>
                <div className="title">
                    <div className="innerTitleSectionOC">
                        <div dangerouslySetInnerHTML={{ __html: this.props.context.title }}>
                        </div>
                        <div className="titleTextButton" style={this.titleTextButtonStyle} ref='frequency' onMouseDown={e => e.stopPropagation()} onClick={this.handleFrequencyTap}>({this.selectedFrequency.label})
                            <Popover
                                open={this.frequencyMenuOpen}
                                anchorEl={this.refs.frequency}
                                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                                targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                                onRequestClose={this.handleFrequencyMenuClose}
                                animation={PopoverAnimationVertical}
                                >
                                <Menu value={this.selectedFrequency} onItemTouchTap={this.handleFrequencySelect}>
                                    {Object.keys(widgetConstants.FREQUENCY).map(key => (
                                        <MenuItem key={widgetConstants.FREQUENCY[key].value} value={widgetConstants.FREQUENCY[key]} primaryText={widgetConstants.FREQUENCY[key].label} />
                                    ))}
                                </Menu>
                            </Popover>
                        </div>
                    </div>
                    <div className="topRightSection" style={this.topRightSectionStyle}>
                        {this.props.context.percentile != undefined ?
                            <div className="textButton" style={this.textButtonStyle} ref='function' onMouseDown={e => e.stopPropagation()} onClick={this.handleFunctionTap}>{this.selectedPercentile.label}%
                         <Popover
                                    open={this.functionMenuOpen}
                                    anchorEl={this.refs.function}
                                    anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                                    targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                                    onRequestClose={this.functionMenuClose}
                                    animation={PopoverAnimationVertical}>
                                    <Menu value={this.selectedPercentile} onItemTouchTap={this.handleFunctionSelection}>
                                        {Object.keys(widgetConstants.PERCENTILES).map(key => (
                                            <MenuItem key={widgetConstants.PERCENTILES[key].value} value={widgetConstants.PERCENTILES[key]} primaryText={widgetConstants.PERCENTILES[key].label} />
                                        ))}
                                    </Menu>
                                </Popover> </div>
                            : null}
                        <div className="textButton" ref='timeRange' onMouseDown={e => e.stopPropagation()} onClick={this.handleTimeRangeTap}>{this.selectedTimeRange.label}
                            <Popover
                                open={this.timeRangeMenuOpen}
                                anchorEl={this.refs.timeRange}
                                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                                targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                                onRequestClose={this.timeRangeMenuClose}
                                animation={PopoverAnimationVertical}>
                                <Menu value={this.selectedTimeRange} onItemTouchTap={this.handleTimeRangeSelection}>
                                    {Object.keys(widgetConstants.TIME_RANGES).map(key => (
                                        <MenuItem key={widgetConstants.TIME_RANGES[key].value} value={widgetConstants.TIME_RANGES[key]} primaryText={widgetConstants.TIME_RANGES[key].label} />
                                    ))}
                                </Menu>
                            </Popover>

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
                {this.props.context.sla != undefined ?
                    <div className="slaContainer">
                        <div className="textButton" style={this.slaTextStyle} onMouseDown={this.handleSlaTextTap}>SLA: {this.sla}ms</div>
                        <ValidatedInput
                            type='text'
                            name='sla'
                            validate='required,isNumeric,isLength:1:5'
                            model={this}
                            errorHelp={{
                                required: 'SLA is required'
                            }}
                            renderFunction={(props) =>
                                <input ref={(ref) => this.refs.slaInput = ref} style={this.slaInputStyle}
                                    id={props.id}
                                    onChange={props.changeHandler}
                                    onBlur={this.handleSlaBlur}
                                    onKeyPress={this.handleSlaKeyPress}
                                    onMouseDown={this.handleSlaInputTap}
                                    value={props.value} />
                            }
                            />

                    </div>
                    : null}

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


export default sizeMe({ monitorHeight: true })(OverviewChart);