import React from 'react'
import { observer } from 'mobx-react';
import styled from 'styled-components'


const Content = styled.div`
    height:100%;
`;

const Settings = () => (
  <Content>
    <p className="content">
      Settings page!
    </p>
  </Content>
)

export default Settings