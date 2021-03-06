import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, useStaticRendering } from 'mobx-react';
import { observable, action } from 'mobx';
import Head from 'next/head'
import Stores from '../../stores/index.js';
import AppNavDrawer from '../AppNavDrawer'
import FullWidthSection from '../FullWidthSection';
import withWidth, { MEDIUM, LARGE } from '../utils/withWidth';
import Router from 'next/router'

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import Avatar from 'material-ui/Avatar';
import List from 'material-ui/List/List';
import ListItem from 'material-ui/List/ListItem';
import SignIn from '../auth/sign-in';

import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';

import { getUserFromCookie, getUserFromLocalStorage } from '../../utils/auth'
import spacing from 'material-ui/styles/spacing';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin'
import dynamic from 'next/dynamic'
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';

import { green100, green500, green700, darkWhite, lightWhite, grey900 } from 'material-ui/styles/colors';

import { Provider } from 'mobx-react';
import styled from 'styled-components'
// Make sure react-tap-event-plugin only gets injected once
// Needed for material-ui
if (!process.tapEventInjected) {
  injectTapEventPlugin()
  process.tapEventInjected = true
}

useStaticRendering(!process.browser)
const appBarHeight = 40

const muiTheme = {
  palette: {
    primary1Color: green500,
    primary2Color: green700,
    primary3Color: green100,
  },
  appBar: {
    height: appBarHeight,
  },
  toolbar: {
    height: appBarHeight
  },
  ripple: {
    color: '#78CDF0',
  },
  focusRippleColor: "darkRed"
}


const Body = styled.div`
 background-color: #edecec;
    display: block;
    overflow-Y: hidden;
    overflow-X: hidden;
    height:100%;
    
`;
const StyledProvider = styled(Provider) `
    height:100%;
`;


@observer
class Logged extends Component {
  @observable openMenu = false
  constructor(props) {
    super(props);
  }


  handleOpenMenu = () => {
    this.openMenu = true
  }
  handleOnRequestChange = (value) => {
    this.openMenu = value
  }
  signOff = (value) => {
    Router.push('/auth/sign-off')
  }

  render() {
    return (
      <IconMenu
        iconButtonElement={
          <ListItem
            onTouchTap={this.handleOpenMenu}
            disabled={false}
            rightAvatar={
              <Avatar src={this.props.loggedUser.picture} />
            }>
            <div className="avatarText"> {this.props.loggedUser.email}</div>
          </ListItem>}
        open={this.openMenu}
        onRequestChange={this.handleOnRequestChange}>
        <MenuItem value="1" primaryText="Help" />
        <MenuItem value="2" primaryText="Sign out" onTouchTap={this.signOff} />
      </IconMenu>
    )
  }
}


const Components = [
  { text: 'Dashboards', component: dynamic(import('../pages/dashboards')),  authRequired: false},
{ text: 'Events', component : dynamic(import('../pages/events')), authRequired: false },
{ text: 'Inventory', component : dynamic(import('../pages/inventory')), authRequired: false },
{ text: 'Operations', component : dynamic(import('../pages/operations')), authRequired: false },
{ text: 'Alerts', component : dynamic(import('../pages/alerts')), authRequired: false },
]

export default Page => {
  class DefaultPage extends Component {
    @observable navDrawerOpen = false

    static async getInitialProps(ctx) {
      // Ensures material-ui renders the correct css prefixes server-side
      let userAgent
      if (process.browser) {
        userAgent = navigator.userAgent
      } else {
        userAgent = ctx.req.headers['user-agent']
      }

      const loggedUser = process.browser ? getUserFromLocalStorage() : getUserFromCookie(ctx.req)
      const pageProps = await Page.getInitialProps && await Page.getInitialProps(ctx)
      const isServer = ctx.req != undefined;
      const stores = Stores(isServer, null, process.env);

      const query = ctx.query.p !== undefined ? ctx.query.p : 'Dashboards'
      if (isServer) {
        //await stores.MetricStore.fetchMetricNames();
        await stores.ChartStore.getInitialData();
      }
      return {
        ...pageProps,
        userAgent,
        loggedUser,
        currentUrl: ctx.pathname,
        isAuthenticated: !!loggedUser,
        initialState: stores.getState(),
        isServer,
        query
      }
    }



    constructor(props, context) {
      super(props, context)
      this.stores = Stores(props.isServer, props.initialState);
      this.logout = this.logout.bind(this)
      this.userAgent = props.userAgent
      this.query = props.query
      this.content = this.query

      // Router.prefetch('../pages/dashboards')
      // Router.prefetch('../pages/events')
    }


    getComponent(item) {
      if (this.stores)
        this.stores.UiState.currentPage = item;
      return Components.find((c) => c.text === item).component
    }

    static propTypes = {
      width: PropTypes.number.isRequired,
    };
    state = {
      navDrawerOpen: false,
    };

    getStyles() {
      const styles = {
        appBar: {
          position: 'fixed',
          // Needed to overlap the examples
          zIndex: 30,
          top: 0,
          backgroundColor: '#78cdf0'
        },
        content: {
          marginTop: appBarHeight,
          height: '100%',
          // height: `calc(100% - ${appBarHeight}px)`,
          overflow: 'auto'
          //     flex: '1 0 auto',
          // display: 'flex',
          // flexDirection: 'row',
          // flexWrap: 'wrap',

          //marginTop: spacing.desktopGutter,
        },
        contentWhenMedium: {
        },
        footer: {
          backgroundColor: grey900,
          textAlign: 'center',
        },
        a: {
          color: darkWhite,
        },
        p: {
          margin: '0 auto',
          padding: 0,
          color: lightWhite,
          maxWidth: 356,
        },
        browserstack: {
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          margin: '25px 15px 0',
          padding: 0,
          color: lightWhite,
          lineHeight: '25px',
          fontSize: 12,
        },
        browserstackLogo: {
          margin: '0 3px',
        },
        iconButton: {
          color: darkWhite,
        },
      };

     

      return styles;
    }
    logout(eve) {
      if (eve.key === 'logout') {
        console.log("LOGGING OUT!")
        alert("test")
        this.props.url.pushTo(`/?logout=${eve.newValue}`)
      }
    }

    componentDidMount() {
      window.addEventListener('storage', this.logout, false)
    }

    componentWillUnmount() {
      window.removeEventListener('storage', this.logout, false)
    }



    @action handleTouchTapLeftIconButton = () => {
      this.navDrawerOpen = !this.navDrawerOpen
      console.log(this.navDrawerOpen)
      // this.setState({
      //   navDrawerOpen: !this.state.navDrawerOpen,
      // });
    };

    handleChangeRequestNavDrawer = (open) => {
      this.setState({
        navDrawerOpen: open,
      });
    };

    handleChangeList = (value) => {
      console.log(value)
      this.content = value
      this.query = value
      Router.push('/?p=' + value, '/?p=' + value, { shallow: true })
    };

    handleOpen = () => {
      this.setState({ open: true });
    };

    handleClose = () => {
      this.setState({ open: false });
    };

    render() {
      const styles = this.getStyles();
      const cssFiles = [
        //'/static/material-datetime-picker.css',
        'https://unpkg.com/normalize.css@5.0.0/normalize.css',
        // 'https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css',
        '/static/react-grid-layout.css',
        '/static/react-resizable.css',
        //  '/static/react-select.css',
        //  '/static/react-select-virtualized.css',
        '/static/react-virtualized.css',
        //  '/static/metricsgraphics.css',
        //  '/static/bootstrap-overrides.css',
        '/static/react-virtualized-cellmeasurer.css',
        //  '/static/logview.css'
      ]
      console.log(this.props)
      const { userAgent } = this.props.userAgent
      const {
        location,
        children,
        loggedUser,
        isAuthenticated
      } = this.props;

      let {
        navDrawerOpen,
      } = this.state;


      let docked = false;
      let showMenuIconButton = true;
      // if (this.props.width === LARGE) {

      //   docked = true;
      //   navDrawerOpen = true;
      //   showMenuIconButton = false;

      //   styles.navDrawer = {
      //     zIndex: styles.appBar.zIndex - 1,
      //   };
      //   styles.content.paddingLeft = 256;
      //   styles.footer.paddingLeft = 256;
      // }
      const actions = [
        <FlatButton
          label="Cancel"
          primary={true}
          onTouchTap={this.handleClose}
          />,
      ];
      const DynamicComponent = this.getComponent(this.content)

      return (

        <StyledProvider { ...this.stores }>
          <MuiThemeProvider muiTheme={getMuiTheme({ userAgent, ...muiTheme })}>
            <div className="container">
              <Body>
                <Head>
                  <meta name='viewport' content='width=device-width, initial-scale=1' />
                  {cssFiles.map((c, i) => <link key={i} href={c} rel='stylesheet' />)}
                  <style>
                    {`html, 
                      body {
                          height: 100%;
                      }
                      
                      body > div:first-child{
                          height: 100%;
                      }
                  
              
                      * {
                      margin: 0;
                      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
                    }`}
                  </style>
                  <title>Digitalis.io Möbius</title>
                </Head>
                <AppBar {...this.props}
                  onLeftIconButtonTouchTap={this.handleTouchTapLeftIconButton}
                  title={this.stores.UiState.currentPage}
                  zDepth={0}
                  iconElementRight={
                    isAuthenticated ? <Logged {...this.props} /> : <FlatButton {...this.props} label="Login" onTouchTap={this.handleOpen} />
                  }
                  style={styles.appBar}
                  showMenuIconButton={showMenuIconButton}
                  />
                <AppNavDrawer  {...this.props}
                  query={this.query}
                  components={Components}
                  docked={docked}
                  onRequestChangeNavDrawer={this.handleChangeRequestNavDrawer}
                  onChangeList={this.handleChangeList}
                  open={this.navDrawerOpen}>

                </AppNavDrawer>


                <div style={styles.content}>
                  <DynamicComponent {...this.props} />
                  <Dialog
                    title=""
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={this.handleClose}
                    >
                    <SignIn />
                  </Dialog>
                </div>



              </Body>
              <style jsx global>{`
                #__next > [data-reactroot] { height: 100% }

        .container {
            height:100%;
          }
          `}</style>
              <style jsx>{`
          .avatarText {
             padding-right:10px;
          }
        `}</style>
            </div>
          </MuiThemeProvider>

        </StyledProvider>
      )

    }

  }
  return withWidth()(DefaultPage)
}