import React from 'react';
import MaterialDateTimePicker from 'material-datetime-picker';

class DateTimePicker extends React.Component {
  
  // this component makes its own DOM updates, so tell React not to make any changes
  shouldComponentUpdate() {
    return false;
  }

  // use any values from `nextProps` to update the picker state, for example:
  componentWillReceiveProps(nextProps) {
    //this.picker.set(nextProps.newDate);
  }

  // the container element has been added to the DOM, so create the picker
  // shouldComponentUpdate returns false, so this is only called once
  componentDidMount() {
    this.picker = new MaterialDateTimePicker({
      el: this.container,
       container:this.container
    });
    this.picker.open()
  }

  // create the picker's wrapper component
  // shouldComponentUpdate returns false, so this is only called once
  render() {
    return <div ref={el => this.container = el} />;
  }
}

export default DateTimePicker