import React, { PropTypes } from 'react'

import defaultPage from './defaultPage'

const tabePageHoc = Page => class tabPage extends React.Component {
  static async getInitialProps(ctx) {
    return {
    }
  }

  render() {
    return <Page {...this.props} />
  }
}

export default Page => defaultPage(eventPageHoc(Page))