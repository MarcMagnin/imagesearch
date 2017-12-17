import React from 'react'
import sizeMe from 'react-sizeme'

var SizedItem = React.createClass({
    render: function () {
        return (
            <div className="wrapper">
          {this.props.children}
      </div>
        );
    }
});

export default sizeMe({ monitorHeight: true, monitorWidth: false })(SizedItem)