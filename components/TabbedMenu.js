import React, { PropTypes } from 'react'
import {Tabs, Tab} from 'material-ui/Tabs';
import Router from 'next/router'
import styled from 'styled-components'


const links = [
  { href: '/', text: 'Status' },
  { href: '/dashboards', text: 'Dashboards', authRequired: false },
  { href: '/logs', text: 'Logs', authRequired: false },
 // { href: '/about', text: 'About' },
  { href: '/auth/sign-in', text: 'Sign In', anonymousOnly: true },
  { href: '/auth/sign-off', text: 'Sign Off', authRequired: true }
]

const BackgroundWrapper = styled.div`
  background-color: ${p => p.isActive ?  '#1b9df5' : '#fff'};
`;
const Content = styled.div`
    padding: 2em;
`;

const getAllowedLinks = isAuthenticated => links.filter(l => !l.authRequired || (l.authRequired && isAuthenticated))
  .filter(l => !isAuthenticated || (isAuthenticated && !l.anonymousOnly))

const handleActive = (tab) => Router.push({
  pathname: tab.href,
  query: { name: tab.href }
})


const TabbedMenu = ({ isAuthenticated, currentUrl }) => (
  <Tabs>
 {getAllowedLinks(isAuthenticated).map(l => (
     <Tab
      label={l.href}
      data-route={l.href}
      onActive={handleActive}
    >
      <Content>
        <Page {...this.props} />
        </Content>
    </Tab>
    ))}
  </Tabs>
);

TabbedMenu.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  currentUrl: PropTypes.string.isRequired
}

export default TabbedMenu
