import React, { PropTypes } from 'react'
import Link from 'next/link'

import styled from 'styled-components'
const SuperSecretDiv = () => (
  <div className="secretDiv">
    This is a super secret div.
  </div>
)

const createLink = (href, text) => (
  <a href={href} className="link">{text}</a>
)
const Container = styled.div`
  height:auto;
`;

const Inventory = ({ isAuthenticated, loggedUser }) => (
  <Container>
    incoming!
  </Container>
)

Inventory.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  loggedUser: PropTypes.object,
}

export default Inventory

