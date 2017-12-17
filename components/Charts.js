import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import MG from 'metrics-graphics';
import 'isomorphic-fetch'
import Chart from './chart/chart';
import $ from 'jquery'; // used by MG charts for tooltips


const Charts = charts => (
  <div
    className={css({
      display: 'flex',
      justifyContent: 'center',
    })}
  >
      // TODO filter server-side when available: https://github.com/graphcool/feature-requests/issues/20
      //.filter(u => u._tracksMeta.count > 0)
      {charts.map(chart => <Chart key={chart.id} {...chart} />)}
  </div>
);


// Charts.propTypes = {
//   todos: PropTypes.arrayOf(PropTypes.shape({
//     id: PropTypes.number.isRequired,
//     data: PropTypes.arrayOf(PropTypes.shape({
//     d: PropTypes.date.isRequired,
//     v: PropTypes.float.isRequired
//   }).isRequired)
//   }).isRequired).isRequired,
// }


export default Charts;

// class Chart extends Component {
//   static async getInitialProps ({ req }) {
//       const isServer = !!req
//        console.log( "isServer");
//          console.log( isServer);
       
//     const res = await fetch('http://localhost:2222/home/metrics?time=240&interval=5')
//     const data = await res.json()
//     const metrics = new Array();
       
//         Object.keys(data.Values).forEach((key)=>{
//         metrics.push({"d": new Date(key), "v": data.Values[key]});
        
//     })
//      console.log( metrics);
//     return { data: metrics }
//   }

//   componentDidMount() {
//     // alert(this.props.data)
//     // MG.convert.date(this.props.data, 'd', '%Y-%m-%dT%H:%M:%S.%LZ');
//     //   MG.data_graphic({
//     //   title: "Line Chart",
//     //   description: "This is a simple line chart.",
//     //   data: this.props.data,
//     //   width: 600,
//     //   height: 200,
//     //   right: 40,
//     //   target: this.elem,
//     //   x_accessor: 'd',
//     //   y_accessor: 'v'
//     // });    
    
//     //ReactDOM.render(<Chart data = {this.props.data } />,  document.getElementById("root"));
//   }

//   render() {
//     return <div ref={el => {if (el){this.elem = el}}}></div>;
//   }
// }

// export default Chart;


