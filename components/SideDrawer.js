import React from 'react'
import Drawer from 'material-ui/Drawer'
import List from 'material-ui/List'
import Subheader from 'material-ui/Subheader'
import ListItem from 'material-ui/List'
import ContentInbox from 'material-ui/svg-icons/content/inbox';
import ActionGrade from 'material-ui/svg-icons/action/grade';
import ContentSend from 'material-ui/svg-icons/content/send';
import ContentDrafts from 'material-ui/svg-icons/content/drafts';

class SideDrawer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            drawerOpen: true
        };

        this.switchDrawer = this.switchDrawer.bind(this);
    }

    switchDrawer() {
        this.setState({
            drawerOpen: !this.state.drawerOpen
        })
    }

    render() {
        return (
            <Drawer
                docked={true}
                open={this.props.drawerOpen}
                onRequestChange={this.props.switchDrawer}
            >
                <List>
                    <Subheader>The MENU</Subheader>
                </List>
            </Drawer>
        );
    }
}

export default SideDrawer;