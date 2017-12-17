import React from 'react';
import { observer } from 'mobx-react';

class AddChart extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      metric: ''
    }
  }

  handleFormSubmit = (e) => {
   e.preventDefault();
    if(this.state.title === "") {
      this.state.title ="untitled chart"
    }
    this.props.ChartStore.addChart(this.state.title);
    this.setState({
        title: '',
        metric: ''
      });
  }

  handleUserInput = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    this.setState({
      [name]: value
    });
  }

  render () {
    return <form onSubmit={ this.handleFormSubmit }>
      <input name="title" type="text" onChange={ this.handleUserInput } value={ this.state.title } />
      <button type="submit">+</button>
    </form>
  }
}

export default observer(['ChartStore'], AddChart);