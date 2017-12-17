import React from 'react';
import { observable, observe, autorun, action, computed } from 'mobx';
import { observer, inject } from 'mobx-react';
import TimePicker from 'material-ui/TimePicker';
import DatePicker from 'material-ui/DatePicker';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import RaisedButton from 'material-ui/RaisedButton';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import moment from 'moment';


@inject('ChartStore', 'UiState')
@observer
class TimeSelector extends React.Component {
    // Time range
    @observable fromTime;
    @observable fromDate;
    @observable fromDateTime;
    @observable toTime;
    @observable toDate;
    @observable toDateTime;
    @observable predefinedTimeOpen = false;
    @observable predefinedTimeAnchorElement
    @observable timeRangeLabel;
    @observable timeMenuOpen = false;
    @observable timeMenuAnchorElement
    // @observable clearButtonStyle = {
    //     height: 'auto',
    //     marginTop: '25px',
    //     marginLeft: '-15px',
    //     opacity: 0,
    //     willChange: 'opacity',
    //     transition: 'opacity 400ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
    // }

    constructor(props) {
        super(props)
        // set default From date
        this.handlePredefinedTime()

        // set listeners
        this.observers = []
        this.observers.push(observe(this.props.ChartStore, "predefinedTime", (change) => {
            if (this.props.ChartStore.predefinedTime != null) {
                this.handlePredefinedTime()
            }
        }))

     
    }

    componentWillUnmount() {
        // unregister observers
        this.observers.map(observer => {
            observer()
        })
    }


    @action handleFromTime = (event, time) => {
        this.fromTime = time
        this.generateFromDateTime()
        this.props.UiState.isCustomTimeSelected = true
    }

    @action handleFromDate = (event, date) => {
        this.fromDate = date

        this.generateFromDateTime()
        this.refs.fromTimePicker.openDialog()
        this.props.UiState.isCustomTimeSelected = true

    }

    generateFromDateTime() {
        let momentTime = moment(this.fromTime);
        let momentDate = moment(this.fromDate);
        let tempDateTime = moment({
            year: momentDate.year(),
            month: momentDate.month(),
            day: momentDate.date(),
            hour: momentTime.hours(),
            minute: momentTime.minutes()
        });

        // var now = moment().utc()
        // now = this.getZonedTime(now)
        // if (this.fromDateTime > now) {

        //     this.fromDate = now.toDate()
        //     this.fromTime = now.toDate()
        //     this.fromDateTime = moment().utc()
        // }
        this.tempDateTime = this.getZonedTime(tempDateTime)
        this.fromDateTime = tempDateTime

    if (this.props.ChartStore.timeZone == "UTC") {
        this.props.ChartStore.fromDateTime = this.removeZonedTime(this.fromDateTime)
    } else {
        this.props.ChartStore.fromDateTime = this.fromDateTime
    }
 this.refreshRenderedTimeRange()


    }

    @action handleToTime = (event, time) => {
        this.toTime = time
        if (this.toDate == null) {
            this.toDate = moment()
        }
        this.generateToDateTime()
          this.props.UiState.isCustomTimeSelected = true
    }

    @action handleToDate = (event, date) => {
        this.toDate = date
        if (this.toTime != null)
            this.generateToDateTime()
        this.refs.toTimePicker.openDialog()
          this.props.UiState.isCustomTimeSelected = true
    }

    generateToDateTime() {
        //this.props.UiState.isCustomTimeSelected = true

        let momentTime = moment(this.toTime);
        let momentDate = moment(this.toDate);
        let tempDateTime = moment({
            year: momentDate.year(),
            month: momentDate.month(),
            day: momentDate.date(),
            hour: momentTime.hours(),
            minute: momentTime.minutes()
        })

        tempDateTime = this.getZonedTime(tempDateTime)

        let now = moment()
        now = this.getZonedTime(now)
        if (tempDateTime > now) {
            tempDateTime =  this.getZonedTime(moment())
            
            this.toDate = tempDateTime.toDate()
            this.toTime = tempDateTime.toDate()
            this.refs.toTimePicker.setState({ time: this.toTime });
        }
        // else {
        //     this.clearButtonStyle = {
        //         ...this.clearButtonStyle,
        //         opacity: 1
        //     }
        // }
        this.toDateTime = tempDateTime
         this.refreshRenderedTimeRange()
           if (this.props.ChartStore.timeZone == "UTC") {
                this.props.ChartStore.toDateTime = this.removeZonedTime(this.toDateTime)
            } else {
                this.props.ChartStore.toDateTime = this.toDateTime
            }

          
    }


    @action handleClearTo = (event) => {
        //this.toDate = null
        //this.toTime = null
        // bugged, we need to force that state
        //this.refs.toTimePicker.setState({ time: null });
        this.generateToDateTime()
    }


    @action handleTimeMenuOpen = (event) => {
        // This prevents ghost click.
        event.preventDefault();
        this.timeMenuOpen = true;
        this.timeMenuAnchorElement = event.currentTarget
    }

    @action handleTimeMenuClose = () => {
        this.timeMenuOpen = false
    }

    getZonedTime(datetime) {
        if (this.props.ChartStore.timeZone == "UTC") {
            //datetime = moment.utc(datetime).utc()
            let offset = moment().utcOffset()
            if (offset > 0) {
                datetime = datetime.subtract(offset, 'm')
            }
            else {
                datetime = datetime.add(offset, 'm')
            }
        }
        return datetime
    }

     removeZonedTime(datetime) {
        if (this.props.ChartStore.timeZone == "UTC") {
            //datetime = moment.utc(datetime).utc()
            let offset = moment().utcOffset()
            if (offset > 0) {
                datetime = datetime.add(offset, 'm')
            }
            else {
                datetime = datetime.subtract(offset, 'm')
            }
        }
        return datetime
    }



    @action handlePredefinedTime = () => {
        //set FROM
        var now = moment();
        let tempDateTime = now.subtract(this.props.ChartStore.predefinedTime, 'minutes')
        this.fromDateTime = tempDateTime

        this.props.ChartStore.fromDateTime = this.fromDateTime
        // datetime picker doesn't handle timezone so we need the following workaround
        tempDateTime = this.getZonedTime(tempDateTime)
        this.fromDate = tempDateTime.toDate()
        this.fromTime = tempDateTime.toDate()


        if (this.props.ChartStore.timeZone == "UTC") {
            this.props.ChartStore.fromDateTime = this.removeZonedTime(this.fromDateTime)
        } else {
            this.props.ChartStore.fromDateTime = this.fromDateTime
        }


        // set TO
        tempDateTime = moment()
        
        tempDateTime = this.getZonedTime(tempDateTime)
        this.toDate = tempDateTime.toDate()
        this.toTime = tempDateTime.toDate()
        this.toDateTime = tempDateTime
        
          if (this.props.ChartStore.timeZone == "UTC") {
            this.props.ChartStore.toDateTime = this.removeZonedTime(this.toDateTime)
        } else {
            this.props.ChartStore.toDateTime = this.toDateTime
        }


        this.props.UiState.isCustomTimeSelected = false
    }

    @action handleTimeZoneChange = (event, key, value) => {
        if (this.props.ChartStore.timeZone == value)
            return

        let fromDateTime = moment(this.fromDateTime)
        let toDateTime = moment(this.toDateTime)
     
        let offset = moment().utcOffset()
        if (this.props.ChartStore.timeZone == "Local") {
            if (offset > 0) {
                fromDateTime = fromDateTime.subtract(offset, 'm')
                toDateTime = toDateTime.subtract(offset, 'm')
            }
            else {
                fromDateTime = fromDateTime.add(offset, 'm')
                toDateTime = toDateTime.add(offset, 'm')
            }
        }
         else {
            if (offset > 0) {
                fromDateTime = fromDateTime.add(offset, 'm')
                toDateTime = toDateTime.add(offset, 'm')
            }
            else {
                fromDateTime = fromDateTime.subtract(offset, 'm')
                toDateTime = toDateTime.subtract(offset, 'm')
            }
         }
        this.fromDate = fromDateTime.toDate()
        this.fromTime = fromDateTime.toDate()
        this.fromDateTime = fromDateTime

            this.toDate = toDateTime.toDate()
            this.toTime = toDateTime.toDate()
            this.toDateTime = toDateTime
            // this.clearButtonStyle = {
            //     ...this.clearButtonStyle,
            //     opacity: 1
            // }

   
        this.refreshRenderedTimeRange()
        this.props.ChartStore.timeZone = value
    }
    refreshRenderedTimeRange = () =>{
        this.props.ChartStore.renderedFromDateTime = this.fromDateTime;
        this.props.ChartStore.renderedToDateTime = this.toDateTime;
    }
    disableFutureDate = (date) => {
        return date > Date.now()
    }

    disableToDates = (date) => {
        let from = this.fromDate
        from.setHours(0);
        from.setMinutes(0);
        from.setSeconds(0);
        from.setMilliseconds(0);
        return (from ? date < from : true) || date >= Date.now()
    }


    // create the picker's wrapper component
    // shouldComponentUpdate returns false, so this is only called once
    render() {
        const styles = {
            textFieldStyle: {
                width: '95px',
                color: 'white',
                cursor: 'pointer',
            },
            timeTextFieldStyle: {
                width: '75px',
                color: 'white',
                cursor: 'pointer',
            },
            labelStyle: {
                maxWidth: '80px',
                color: 'white'
            },
            hintStyle: {
                maxWidth: '80px',
                color: 'rgba(255, 255, 255, 0.65)'
            }

        }
 
        return (
            <div className="timePickerContainer">
                <div className="dateTimePicker">
                    <DatePicker onChange={this.handleFromDate} value={this.fromDate} container="inline" mode="landscape" autoOk={true} hintText="Date"
                        shouldDisableDate={this.disableFutureDate}
                        hintText="From"
                        floatingLabelText="From"
                        style={styles.textFieldStyle} textFieldStyle={styles.textFieldStyle} inputStyle={styles.textFieldStyle}
                        floatingLabelStyle={styles.hintStyle} />
                    <TimePicker ref='fromTimePicker' onChange={this.handleFromTime} value={this.fromTime} format="24hr" autoOk={true} hintText="Time"
                        hintText=" "
                        floatingLabelText=" "
                        style={styles.timeTextFieldStyle} textFieldStyle={styles.timeTextFieldStyle} inputStyle={styles.timeTextFieldStyle} />
                   {/* <span>{this.fromDateTime.toString()}</span>
    <span>{this.props.ChartStore.fromDateTime != null ? this.props.ChartStore.fromDateTime.valueOf() : ""}</span>*/}

                </div>


                <div className="dateTimePicker">
                    <DatePicker ref='toDatePicker' onChange={this.handleToDate} value={this.toDate} container="inline" mode="landscape" autoOk={true}
                        hintText="To"
                        floatingLabelText="To"
                        shouldDisableDate={this.disableToDates}
                        style={styles.textFieldStyle} textFieldStyle={styles.textFieldStyle} inputStyle={styles.textFieldStyle} hintStyle={styles.labelStyle}
                        floatingLabelStyle={styles.hintStyle} />
                    <TimePicker ref='toTimePicker' defaultTime={Date.Now} onChange={this.handleToTime} value={this.toTime} format="24hr" autoOk={true} hintText="Time"
                        hintText=" "
                        floatingLabelText=" "
                        style={styles.timeTextFieldStyle} textFieldStyle={styles.timeTextFieldStyle} inputStyle={styles.timeTextFieldStyle} />
                    {/*<span>{this.toDateTime.toString()}</span>
    <span>{this.props.ChartStore.toDateTime != null ? this.props.ChartStore.toDateTime.valueOf() : ""}</span>*/}
                </div>

                <SelectField
                    floatingLabelText="Time zone"
                    value={this.props.ChartStore.timeZone}
                    onChange={this.handleTimeZoneChange}
                    style={styles.textFieldStyle} labelStyle={styles.labelStyle} hintStyle={styles.hintStyle} floatingLabelStyle={styles.hintStyle}
                    iconStyle={{ fill: 'rgba(253, 253, 253, 0.75)' }}
                    >
                    <MenuItem value="Local" primaryText="Local" />
                    <MenuItem value="UTC" primaryText="UTC" />
                </SelectField>
                <style jsx>{`
         .timePickerContainer{
             margin-top: 12px;
             display:flex;
             flex-direction:column;
             align-items: flex-start;
         }
          .dateTimePicker{
            margin-right: 8px !important;
            display: inline-flex;
            justify-content: center;
            flex-align: center;
            align-items: center;
          }
          .timeRangeMenu{
            display: inline-flex !important;
          }
          .fromLabel{
            color:white;
            margin-right: 8px
          }
          .toLabel{
            color:white;
            margin-right: 28px
          }
        `}</style>
            </div>);
    }
}

export default TimeSelector