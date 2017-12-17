import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link'
import Drawer from 'material-ui/Drawer';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Avatar from 'material-ui/Avatar';
import {spacing, typography, zIndex} from 'material-ui/styles';
import {cyan500} from 'material-ui/styles/colors';
import styled from 'styled-components'
import {GridList, GridTile} from 'material-ui/GridList';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import RaisedButton from 'material-ui/RaisedButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

const SelectableList = makeSelectable(List);

const styles = {
  logo: {
    cursor: 'pointer',
    fontSize: 24,
    color: typography.textFullWhite,
    lineHeight: `${spacing.desktopKeylineIncrement}px`,
    fontWeight: typography.fontWeightLight,
    backgroundColor: cyan500,
    paddingLeft: spacing.desktopGutter,
    marginBottom: 8,
  },
  version: {
    paddingLeft: spacing.desktopGutterLess,
    fontSize: 16,
  },
};


// const BackgroundWrapper = styled.div`
//   background-color: ${p => p.isActive ?  '#1b9df5' : '#fff'};
// `;

const Container = styled.div`
  height:auto;
`;
// const StyledList = styled(List)`
//   color:${p => p.isActive ?  '#0DADD9' : 'black'} !important;
// `;
// const StyledListItem = styled(ListItem)`
//   color:${p => p.isActive ?  '#0DADD9' : 'black'} !important;
// `;

// const NestedStyledListItem = styled(ListItem)`
//  padding-left: 18px !important;
//   color:${p => p.isActive ?  '#0DADD9' : 'black'} !important;
// `;



class AppNavDrawer extends Component {
    
  static propTypes = {
    docked: PropTypes.bool.isRequired,
    onChangeList: PropTypes.func.isRequired,
    onRequestChangeNavDrawer: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    style: PropTypes.object,
    isAuthenticated:PropTypes.bool.isRequired,
    currentUrl :PropTypes.string.isRequired,
    query:PropTypes.string.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
  };

 getAllowedLinks = isAuthenticated => this.props.components.filter(l => !l.authRequired || (l.authRequired && isAuthenticated))
  .filter(l => !isAuthenticated || (isAuthenticated && !l.anonymousOnly))

 isLinkActive = query => this.props.components.filter(c => c.text === query)

  state = {
    muiVersions: [],
  };

  

  onChange = (event, index)=>{
      this.props.onChangeList(index)
  }


  
  handleTouchTapHeader = () => {
    this.context.router.push('/');
    this.props.onRequestChangeNavDrawer(false);
  };

  render() {
    const {
      location,
      docked,
      onRequestChangeNavDrawer,
      onChangeList,
      open,
      style,
      isAuthenticated,
      currentUrl,
      components,
      query
    } = this.props;
    const hoverColor="rgba(150, 150, 150, 0.1)"
    const menuItemStyle = {
            cursor: 'default',
            userSelect:'none'
          }

    return (
      <Drawer
        style={style}
        docked={docked}
        open={open}
        onRequestChange={onRequestChangeNavDrawer}
        containerStyle={{zIndex: zIndex.drawer - 100}}
      >
     
      
        <Toolbar>

        <ToolbarGroup>
       
          <ToolbarTitle text="Digitalis.io" />
          <ToolbarSeparator />
          <IconMenu
            iconButtonElement={
              <IconButton touch={true}>
                <NavigationExpandMoreIcon />
              </IconButton>
            }
          >
            <MenuItem primaryText="Download" />
            <MenuItem primaryText="More Info" />
          </IconMenu>
        </ToolbarGroup>
      </Toolbar>
 


    
        <SelectableList
          value="test"
            onChange={this.onChange}
        >
       

          <ListItem
            primaryText="System"
            primaryTogglesNestedList={true}
            isActive={this.isLinkActive(query).length > 0}
            initiallyOpen={this.isLinkActive(query).length > 0}
            className={ this.isLinkActive(query).length > 0 && 'active' }
            style={menuItemStyle}
            hoverColor={hoverColor}
            nestedItems=
               {this.getAllowedLinks(isAuthenticated).map(l => (
                    <ListItem value={l.text} className={ query === l.text ? 'active' : '' } primaryText={l.text}  style={menuItemStyle}  hoverColor={hoverColor} />
               ))}
          />
           <ListItem
            primaryText="Users"
            style={menuItemStyle}
            primaryTogglesNestedList={true}
            hoverColor={hoverColor}
             nestedItems={[
              <ListItem primaryText="Users" value="/users"  style={menuItemStyle} hoverColor={hoverColor} />
            ]}
            
          />
        
          <ListItem
            primaryText="Settings"
            style={menuItemStyle}
            primaryTogglesNestedList={true}
            hoverColor={hoverColor}
            nestedItems={[
              <ListItem primaryText="mmm nice settings!"   style={menuItemStyle} hoverColor={hoverColor}/>
            ]}
          />
        </SelectableList>
     
           <style jsx>{`
          .active {
             color:#0DADD9 !important;
          }
        `}</style>
      </Drawer>
    );
  }
}

export default AppNavDrawer;