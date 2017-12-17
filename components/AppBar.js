import React from 'react';
import { observable, observe, autorun, action, computed } from 'mobx';
import EventListener from 'react-event-listener';
import { observer, inject } from 'mobx-react';
import TimePicker from 'material-ui/TimePicker';
import DatePicker from 'material-ui/DatePicker';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import moment from 'moment';
import TimeSelector from '../components/TimeSelector';
import FontIcon from 'material-ui/FontIcon';
import { Tabs, Tab } from 'material-ui/Tabs';

@inject('ChartStore', 'UiState')
@observer
class AppBar extends React.Component {
    // Time range

    @observable toolBarMenuOpen = false

    @observable applicationBarMaskStyle = {
        position: 'fixed',
        height: '100%',
        width: '100%',
        top: 0,
        left: '-100%',
        opacity: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.54)',
        willChange: 'opacity',
        transform: 'translateZ(0px)',
        transition: 'left 0ms cubic-bezier(0.23, 1, 0.32, 1) 400ms, opacity 400ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        zIndex: 1200,
        pointerEvents: 'none'
    }

    @observable subToolbarStyle = {
        display: 'flex',
        overflow: 'hidden',
        willChange: 'max-height',
        transition: 'max-height 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        paddingRight: '424px',
        maxHeight: 0,
    }

    @observable timeRangeSelectionIconStyle = {
        willChange: 'opacity',
        transition: 'opacity 400ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        opacity: 1,
        pointerEvents: 'auto',
    }
    @observable timeRangeSelectionTextStyle = {
        color: 'white', textAlign: 'right', marginRight: '-35px', fontWeight: '500', verticalAlign: 'super',
        willChange: 'opacity',
        transition: 'opacity 400ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        opacity: 0,
        cursor: 'pointer',
        pointerEvents: 'none',
        textOverflow: 'ellipsis',
        visibility:'hidden',
        whiteSpace: 'nowrap'
    }

    constructor(props) {
        super(props)

        // set listeners
        this.observers = []
        this.observers.push(observe(this.props.UiState, "isCustomTimeSelected", (change) => {
            if (this.props.UiState.isCustomTimeSelected) {
                this.props.ChartStore.predefinedTime = null
                this.timeRangeSelectionIconStyle = {
                    ...this.timeRangeSelectionIconStyle,
                    opacity: 0,
                    pointerEvents: 'none',
                }
                this.timeRangeSelectionTextStyle = {
                    ...this.timeRangeSelectionTextStyle,
                    opacity: 1,
                     visibility:'visible',
                    pointerEvents: 'auto',
                }
            } else {

                this.timeRangeSelectionTextStyle = {
                    ...this.timeRangeSelectionTextStyle,
                    opacity: 0,
                    visibility:'hidden',
                    pointerEvents: 'none',
                }
                this.timeRangeSelectionIconStyle = {
                    ...this.timeRangeSelectionIconStyle,
                    opacity: 1,
                    pointerEvents: 'auto',
                }

            }

        }))
    }

    static propTypes = {
        onMenuButtonClick: React.PropTypes.func.isRequired
    };

    handleKeyUp = (e) => {
        if (e.keyCode === 27 && this.toolBarMenuOpen) {
            this.closeTimeSelection()
        }
    }

    @action onMenuButtonClick = (e) => {
        this.closeTimeSelection()
        this.props.onMenuButtonClick(e);
    }

    componentWillUnmount() {
        // unregister observers
        this.observers.map(observer => {
            observer()
        })
    }

    @action handleTimeRange = (tab) => {
        this.closeTimeSelection()
        this.props.ChartStore.predefinedTime = tab.props['value']

    };

    @action openTimeSelection = () => {
        if (this.props.UiState.navDrawerOpen) {
            this.onMenuButtonClick()
        }

        this.toolBarMenuOpen = !this.toolBarMenuOpen
        if (this.toolBarMenuOpen == false) {
            this.closeTimeSelection()

        } else {
            this.applicationBarMaskStyle = {
                ...this.applicationBarMaskStyle,
                transition: 'left 0ms cubic-bezier(0.23, 1, 0.32, 1) 0ms, opacity 400ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
                left: '0%',
                opacity: 1,
                pointerEvents: 'auto'
            }
            this.subToolbarStyle = {
                ...this.subToolbarStyle,
                maxHeight: '290px'
            }
        }
    };

    @action closeTimeSelection = () => {
        this.toolBarMenuOpen = false
        this.applicationBarMaskStyle = {
            ...this.applicationBarMaskStyle,
            left: '-100%',
            opacity: 0
        }
        this.subToolbarStyle = {
            ...this.subToolbarStyle,
            maxHeight: 0
        }
    };

    @computed get customTimeText() {
        let ret = ""
        if (this.props.ChartStore.renderedFromDateTime != null) {
            let momentTime = moment(this.props.ChartStore.renderedFromDateTime);
            ret = momentTime.format("YYYY-MM-DD HH:mm")
            ret += " to "
            let momentToTime = moment(this.props.ChartStore.renderedToDateTime);
            ret += momentToTime.format("YYYY-MM-DD HH:mm")
        }
        return ret
    }

    // create the picker's wrapper component
    // shouldComponentUpdate returns false, so this is only called once
    render() {
        const {
            location,
            children,
            loggedUser,
            isAuthenticated
        } = this.props;

        const timeRangeTabHeadline = {
            textTransform: 'none',
            minWidth: 33,
        }
        const tabs = [
            { label: "5m", value: 5, style: timeRangeTabHeadline },
            { label: "30m", value: 30, style: timeRangeTabHeadline },
            { label: "1h", value: 60, style: timeRangeTabHeadline },
            { label: "3h", value: 180, style: timeRangeTabHeadline },
            { label: "6h", value: 360, style: timeRangeTabHeadline },
            { label: "12h", value: 720, style: timeRangeTabHeadline },
            { label: "1d", value: 1440, style: timeRangeTabHeadline },
            { label: "2d", value: 2880, style: timeRangeTabHeadline },
            { label: "4d", value: 5760, style: timeRangeTabHeadline },
            { label: "7d", value: 10080, style: timeRangeTabHeadline },
            { label: "1M", value: 43800, style: timeRangeTabHeadline },
            { label: "2M", value: 87600, style: timeRangeTabHeadline },
            { label: "6M", value: 262800, style: timeRangeTabHeadline },
            { label: "1Y", value: 525600, style: timeRangeTabHeadline },
        ]

        return (
            <div>
                <EventListener target="window" onKeyUp={this.handleKeyUp} />
                <div className="appBar">
                    <div className="newAppToolbar">
                        <IconButton style={{ height: '48px', padding:0 }}
                            onTouchTap={this.onMenuButtonClick} >
                             <img draggable="false" onmousedown="return false" style="user-drag: none" src="/static/digitalis_icon_white_s.png" />
                        </IconButton>
                        
                        <h1 className="appToolbarTitle">{this.props.UiState.currentPage}</h1>
                        <div className="appToolbarRightContainer">
                            <div className="appToolbarRight">
                                <div>
                                    <span onClick={this.openTimeSelection} style={this.timeRangeSelectionTextStyle}>{this.customTimeText}</span>
                                    <IconButton style={this.timeRangeSelectionIconStyle} onTouchTap={this.openTimeSelection}>
                                        <FontIcon className="material-icons" color="white">access_time</FontIcon>
                                    </IconButton>

                                </div>
                                <Tabs style={{ marginRight: 20 }}
                                    value={this.props.ChartStore.predefinedTime}
                                    tabItemContainerStyle={{ background: 'transparent' }}
                                    inkBarStyle={{ backgroundColor: '#b9eaff' }}>
                                    {tabs.map(t => <Tab disableFocusRipple disableTouchRipple key={t.value} value={t.value} label={t.label} style={t.style} onActive={this.handleTimeRange} />)}
                                </Tabs>
                                {isAuthenticated ? <Logged {...this.props} /> : <FlatButton {...this.props} label="Login" labelStyle={{ color: 'white' }} onTouchTap={this.handleOpen} />}
                            </div>
                        </div>
                    </div>
                    <div className="subToolbarContainer">
                        <div style={this.subToolbarStyle}>
                            <div className="timeSelectionMenu">
                                <TimeSelector {...this.props}></TimeSelector>
                            </div>
                        </div> </div>
                </div>
                <div onClick={this.openTimeSelection} style={this.applicationBarMaskStyle} />
                <style jsx>{`


          
             .subToolbarContainer{
                 display:flex;
                 flex-direction: row;
                 justify-content: flex-end;
                 width:100%
             }
              .timeSelectionMenu{
                  margin-bottom: 15px;
              }
              
              .appBar{
                position:fixed;
         
                z-index: 1300;
                width:100%;
                background-color: #5899fb;
                box-shadow: 0 1px 6px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.12);
                transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
              }
              .newAppToolbar{
                display: flex;
            align-items: center;
            justify-content: center;
            padding-left:8px;
              }
              .appToolbarRightContainer{
                  margin-left:auto;
              }

              .appToolbarRight{
                    display: inline-flex;
                margin-left:auto;
              }
            .appToolbarTitle{
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              margin: 0;
              padding-left:5px;
              letter-spacing: 0;
              font-size: 24px;
              font-weight: 400;
              color: #ffffff;
              height: auto;
              line-height: initial;
               user-select: none;
            }
         
        `}</style>

            </div>);
    }
}
  //           <div className="menuButton">
            //                  <img id="icon"  className="menuButtonIcon" src="/static/digitalis_icon_s.png" />
            //                  <img id="whiteIcon"  className="menuButtonIcon" src="/static/digitalis_icon_white_s.png" />
                             
            //                 </div>
            //  .menuButton:hover  #whiteIcon{
            //      opacity:0
            //  }
         
             
            //  .menuButtonIcon{
            //      position:absolute;
            //      top:8px;
            //      left:10px;
            //      transition: opacity 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
            //  }
export default AppBar