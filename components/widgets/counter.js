import React from 'react';
import { observer, inject } from 'mobx-react';
import { observable, observe, action, reaction } from 'mobx';
//import 'rxjs/add/observable/dom/ajax'
import moment from 'moment';
import _ from 'lodash';
import sizeMe from 'react-sizeme';
import ReactHighcharts from 'react-highcharts';

import Popover, { PopoverAnimationVertical } from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

import { ValidatedInput } from 'mobx-input'

import EventListener from 'react-event-listener';

import * as widgetConstants from '../../stores/models/constants'


import { Observable } from 'rxjs/Rx';
import ReactFitText from 'react-fittext';
import { Textfit } from 'react-textfit';


// <MenuItem value="p999" primaryText="999" />
//                             <MenuItem value="p99" primaryText="99" />
//                             <MenuItem value="p98" primaryText="98" />
//                             <MenuItem value="p95" primaryText="95" />
//                             <MenuItem value="p75" primaryText="75" />
//                             <MenuItem value="p50" primaryText="50" />
@inject('ChartStore', 'UiState')
@observer
class Counter extends React.Component {

    @observable functionMenuOpen = false
    @observable timeRangeMenuOpen = false
    @observable selectedPercentile = widgetConstants.PERCENTILES.P99
    @observable selectedTimeRange = widgetConstants.TIME_RANGES.m5
    @observable sla = 0
    @observable counterValue = 0
    @observable slaTextStyle = {
        color: 'white',
        willChange: 'opacity',
        transition: 'opacity 400ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        cursor: 'pointer',
    }
    @observable containerStyle = {
        willChange: 'background-color',
        transition: 'background-color 400ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        backgroundColor: widgetConstants.STYLES.widgetGreenColor
    }

    counterBodyStyle = {
        textAlign: 'left',
    }

    @observable slaInputStyle = {
        width: 'calc(100% - 1px)',
        height: '13px',
        fontSize: '0.7em',
        position: 'absolute',
        top: '0px',
        opacity: '0',
        color: 'black',
        willChange: 'opacity',
        transition: 'opacity 400ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        border: '0px',
        borderRadius: '4px',
        textIndent: '0.3em',
        cursor: 'pointer',
        pointerEvents: 'none',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    }

    constructor(props) {
        super(props)


        this.props = props
        this.interval = widgetConstants.pollInitInterval
        this.chartStore = props.ChartStore
        this.metricsByNameAggURL = `http://${this.props.ChartStore.apiEndpoint}:${this.props.ChartStore.apiPort}/v2/data/getMetricsByNameAgg`

        this.selectedPercentile = this.props.context.percentile
        this.sla = this.props.context.sla
        // this.selectedTimeRange = this.props.....

        // get initial data
        this.getInitialData(this.lastRequestTime = moment.utc().valueOf())

        this.observers = []
        if (this.sla != undefined) {
            const reaction2 = reaction(
                () => this.counterValue,
                counterVal => {
                    this.setWidgetColor()
                })

            const reaction3 = reaction(
                () => this.sla,
                sla => {
                    this.setWidgetColor()
                })

        }
    }

    setWidgetColor = () => {
        if (parseFloat(this.counterValue) > parseFloat(this.sla)) {
            this.containerStyle = {
                ...this.containerStyle,
                backgroundColor: widgetConstants.STYLES.widgetRedColor
            }
        } else {
            if ((parseFloat(this.counterValue) + (parseFloat(this.counterValue) * widgetConstants.SLA_MARGIN_PERCENT / 100) > parseFloat(this.sla))) {
                this.containerStyle = {
                    ...this.containerStyle,
                    backgroundColor: widgetConstants.STYLES.widgetOrangeColor
                }
            }
            else {
                this.containerStyle = {
                    ...this.containerStyle,
                    backgroundColor: widgetConstants.STYLES.widgetGreenColor
                }
            }
        }
    }

    buildFilterPredicates = () => {
        var predicates = []
        if (this.props.context.predicates != undefined) {
            predicates = this.props.context.predicates
        }
        if (this.props.context.percentile != undefined) {
            predicates.push({
                name: "function",
                values: [this.selectedPercentile.value]
            })
        }
        return predicates
    }


    async getInitialData(lastRequestTime) {
        this.unMount()
        let now = moment().utc()
        // clone is required as substract mutate
        let from = now.clone().subtract(this.selectedTimeRange.value, 'minutes')
        let to = now
        this.body = {
             locator:{
                customerId:this.props.ChartStore.customerId,
                componentId:this.props.ChartStore.componentId,
                clusterId:this.props.ChartStore.clusterId
                },
            identities: [this.props.context.pattern],
            from: from.valueOf(),
            to: to.valueOf(),
            humanFrom: from,
            humanTo: to,
            predicates: this.buildFilterPredicates(),
            proc: [{
                name: "avg-excl-zero",
                params: {}
            }]
        };

        this.getData().subscribe(ajax => {
            this.queryingData = false

            if (lastRequestTime != this.lastRequestTime)
                return
            this.processResponse(ajax.response)
            this.moveTimeRangeWindow(this.body)
            setTimeout(function (obj) {
                // secure predefined time selection spamming or page change
                if (obj.lastRequestTime != obj._this.lastRequestTime || obj._this.isAlive == false) {
                    return
                }
                console.log("START POLLING")
                obj._this.startPolling()
            }, 5000, { _this: this, lastRequestTime: this.lastRequestTime });
        }, error => { console.log("error") })
        var res = await fetch(this.metricsByNameAggURL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.body)
        });

        // }
    }

    processResponse(response) {
        if (response.entries[0].entries[0].data.value == null) {
            this.counterValue = "-"
        } else {
            let val = this.props.context.conversionFunction(response.entries[0].entries[0].data.value, this.props.context.conversionFactor)
            this.counterValue = val < 1 ? val.toFixed(2) : val.toFixed(0)
        }
    }

    // clean subscription in case we leave the page or add other metrics 
    unMount() {
        if (this.pollSubscriber) {
            this.pollSubscriber.unsubscribe();
        }
    }

    componentWillUnmount() {
        this.unMount()
        this.observers.map(observer => {
            observer()
        })
    }

    moveTimeRangeWindow(body) {
        let now = moment().utc()
        let from = now.clone().subtract(this.selectedTimeRange.value, 'minutes')
        let to = now
        body.from = from.valueOf()
        body.to = to.valueOf()
        body.humanFrom = from
        body.humanTo = to
    }

    getData() {
        this.queryingData = true
        return Observable.ajax({
            url: this.metricsByNameAggURL,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.body),
            responseType: 'json'
        })
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
                        return Observable.timer(this.interval = widgetConstants.computeInterval(this.interval, true));
                    });
            }).subscribe((ajax) => {
                // notifies wrapperObservable subscribers
                observer.next(ajax.response);
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
                    return Observable.timer(this.interval = widgetConstants.computeInterval(this.interval, false));
                });
        }).subscribe(
            (response) => {
                this.queryingData = false
                this.moveTimeRangeWindow(rcv.body)
                this.processResponse(response)
            }
            )
    })

    @action handleFunctionTap = (event) => {
        this.functionMenuOpen = true

    }
    @action functionMenuClose = () => {
        this.functionMenuOpen = false
    }

    @action handleTimeRangeTap = (event) => {
        this.timeRangeMenuOpen = true

    }
    @action timeRangeMenuClose = () => {
        this.timeRangeMenuOpen = false
    }



    @action handleFunctionSelection = (event, menuItem, index) => {
        this.selectedPercentile = menuItem.props.value
        this.functionMenuOpen = false
        this.getInitialData(this.lastRequestTime = moment.utc().valueOf())
    }

    @action handleTimeRangeSelection = (event, menuItem, index) => {
        this.selectedTimeRange = menuItem.props.value
        this.timeRangeMenuOpen = false
        this.getInitialData(this.lastRequestTime = moment.utc().valueOf())
    }


    @action handleSlaTextTap = (event) => {
        this.slaInputStyle = {
            ...this.slaInputStyle,
            opacity: 1,
            pointerEvents: 'auto',
        }
        this.slaTextStyle = {
            ...this.slaTextStyle,
            opacity: 0,
        }
        this.refs.slaInput.focus()
        this.refs.slaInput.select()
        this.props.UiState.focusedItem = this.refs.slaInput
        // prevent widget drag
        event.preventDefault()
        event.stopPropagation()
    }

    // prevent widget drag
    @action handleSlaInputTap = (event) => {
        event.preventDefault()
        event.stopPropagation()
    }


    @action handleSlaChange = (event) => {
        if (_.isNumber(event.target.value)) {
            this.sla = event.target.value
        }
    }

    @action handleSlaBlur = (event) => {
        this.slaInputStyle = {
            ...this.slaInputStyle,
            opacity: 0,
            pointerEvents: 'none',
        }
        this.slaTextStyle = {
            ...this.slaTextStyle,
            opacity: 1,
        }
        if (_.isNumber(event.target.value)) {
            this.sla = event.target.value
        }

    }

    // TODO prevent it to raise on all the widgets components!!
    handleKeyUp = (e) => {
        if (e.keyCode === 27 && this.refs.slaInput != undefined) {
            this.refs.slaInput.blur()
        }
    }

    @action handleSlaKeyPress = (event) => {
        console.log(event.key)
        if (event.key === 'Enter') {
            console.log('do validate');
            this.refs.slaInput.blur()
        }
        if (_.isNumber(event.target.value)) {
            this.sla = event.target.value
        }

    }




    render() {
        const { width, height } = this.props.size;
        if (width > 150) {
            this.counterBodyStyle = {
                ...this.counterBodyStyle,
                textAlign: 'center'
            }
        } else {
            this.counterBodyStyle = {
                ...this.counterBodyStyle,
                textAlign: 'left'
            }
        }

        let maxFontSize = 0
        maxFontSize = height / 2

        return <div className="counterContainer" style={this.containerStyle}>
            <EventListener target="window" onKeyUp={this.handleKeyUp} />
            <div className="widgetTitle">
                <div className="topSection">
                    <div>
                        {this.props.context.title}
                    </div>
                    <div className="topRightSection">
                        {this.props.context.percentile != undefined ?
                            <div className="textButton" ref='function' onMouseDown={e => e.stopPropagation()} onClick={this.handleFunctionTap}>{this.selectedPercentile.label}%
                         <Popover
                                    open={this.functionMenuOpen}
                                    anchorEl={this.refs.function}
                                    anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                                    targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                                    onRequestClose={this.functionMenuClose}
                                    animation={PopoverAnimationVertical}
                                    >
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
                                animation={PopoverAnimationVertical}
                                >
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
            <div className="counterBody" style={this.counterBodyStyle}>
                <ReactFitText compressor={0.30} maxFontSize={maxFontSize}>
                    <span className="counter">{this.counterValue}<span style={{ fontSize: '40%' }}>{this.props.context.units}</span></span>
                </ReactFitText>
            </div>

            <div className="counterFooter">
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
                    .textButton{
                       cursor : pointer;
                       transition: 0.1s;
                        background-color: rgba(0, 0, 0, 0.1);
                        border-radius: 2px;
                        padding: 1px 3px;
                        width: fit-content;
                        font-size: 0.7em; 
                    }
                    .textButton:hover{
                       background-color: rgba(0, 0, 0, 0.3);
                    }
                    .topSection{
                        display:flex;
                        justify-content: space-between;
                        min-height:36px;
                        color: white;
                        
                    }
                    .topRightSection{
                        margin:3px;
                          display:flex;
                         flex-direction: column;
                        align-items: flex-end;
                    }
          .counterContainer {
              cursor: default;
            height: 100%;
            display: flex;
            flex-direction: column;
          
          }
     
         
  .counterFooter{
      position:relative;
              flex: 0 0 auto;
              margin:0 3px 3px 3px;
          }
        `}</style>
        </div>
    }
}


export default sizeMe({ monitorHeight: true })(Counter);