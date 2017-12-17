import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import Drawer from 'material-ui/Drawer';
import Paper from 'material-ui/Paper';
import muiThemeable from 'material-ui/styles/muiThemeable';

import styled from 'styled-components'
import Responsive from './Responsive';

const getWidth = width => (typeof width === 'number' ? `${width}px` : width);

const StyledDrawer = styled(Drawer)`
    height:100%
`;
const StyledPaper = styled(Paper)`
    height:100%
`;
const StyledResponsive = styled(Responsive)`
    height:100%
`;

const getStyles = ({ drawer }) => {
    const width = drawer && drawer.width ? getWidth(drawer.width) : '16em';

    return ({
        sidebarOpen: {
            flex: `0 0 ${width}`,
            marginLeft: 0,
            order: -1,
            transition: 'margin 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        },
        sidebarClosed: {
            flex: `0 0 ${width}`,
            marginLeft: `-${width}`,
            order: -1,
            transition: 'margin 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        },
    });
};

// We shouldn't need PureComponent here as it's connected
// but for some reason it keeps rendering even though mapStateToProps returns the same object
class Sidebar extends PureComponent {
    handleClose = () => {
      //  this.props.setSidebarVisibility(false);
    }

    render() {
        const { open, children } = this.props;
        const styles = getStyles(muiThemeable());
        return (
            <Responsive
                small={
                    <StyledDrawer docked={false} open={open} >
                        {React.cloneElement(children, { onMenuTap: this.handleClose })}
                    </StyledDrawer>
                }
                medium={
                    <StyledPaper  style={true ? styles.sidebarOpen : styles.sidebarClosed}>
                        {children}
                    </StyledPaper>
                }
            />
        );
    }
}

Sidebar.propTypes = {
    children: PropTypes.node.isRequired,
};


export default Sidebar;