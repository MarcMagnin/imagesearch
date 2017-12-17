import React from 'react';
import _ from 'lodash';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import Chart from './widgets/chart/chart';
import OverviewChart from './widgets/chart/overviewChart';
import Counter from './widgets/counter';
import GridElement from './primitives/GridElement'
import Paper from 'material-ui/Paper';
import * as widgetConstants from '../stores/models/constants'

const ResponsiveReactGridLayout = WidthProvider(Responsive);

@observer
class Masonry extends React.Component {

  constructor(props) {

    super(props)

    this.mounted = false
    this.currentBreakpoint = "lg"
    this.newCounter = 0
    this.className = "layout"
    this.rowHeight = 100
    this.cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }
    this.isDragging = false;
    this.isResizing = false;
    this.items = props.items
    console.log("LAOYTTT", props.layout)
    //this.state = props.state
    //this.logout = this.logout.bind(this)
  }


  static propTypes = {
    onLayoutChange: React.PropTypes.func.isRequired,
    onItemClick: React.PropTypes.func.isRequired
  };


  // getDefaultProps= () =>  {
  //     return {
  //       className: "layout",
  //       cols: 12,
  //       rowHeight: 30
  //     };
  //   }
  //    getInitialState= () => {
  //     return {
  //       layouts: JSON.parse(JSON.stringify(originalLayout))
  //     };
  //   }



  // state = {
  //   // currentBreakpoint: 'lg',
  //   // mounted: false,
  //   // layouts: originalLayout,
  //   // items: [0, 1, 2, 3, 4].map(function(i, key, list) {
  //   //     return {i: i.toString(), x: i * 2, y: 0, w: 2, h: 2, add: i === (list.length - 1).toString()};
  //   //   }),
  //   // newCounter: 0
  // };

  componentDidMount = () => {
    this.mounted = true;
    //  if(originalLayout){
    //    console.log("WOOOOOOOOT")
    //     this.setState({
    //     layouts: originalLayout
    //   });
    //  }
  }


  onBreakpointChange = (breakpoint) => {
    this.currentBreakpoint = breakpoint
  };

  onLayoutChange = (layout, layouts) => {

    // if(this.mounted){
    //   saveToLS('layouts', layouts);
    //  this.layouts= layouts;
    this.props.onLayoutChange(layout, layouts);
    // }
  };


  onItemClick = (e) => {
    // idiomatic way to prevent a click when resizing
    if (!this.isDragging && !this.isResizing)
      this.props.onItemClick(e);


  }

  resetLayout = () => {

  }
  onRemoveItem = (i) => {
    console.log('removing', i);
    this.items = _.reject(this.items, { i: i })
  }

  onDrag = (e) => {
    this.isDragging = true;
  }
  onDragStop = (e) => {
    // HACK: we need to add some delay otherwise a click event is sent
    setTimeout((obj) => { obj.isDragging = false }, 200, this)
  }

  onResizeStart = (layout, oldItem, newItem,
    placeholder, e, element) => {
    // this.props.items[newItem.i].isResizing = true
    this.isResizing = true;
  }
  onResizeStop = (layout, oldItem, newItem,
    placeholder, e, element) => {
    // this.props.items[newItem.i].isResizing = false
    // HACK: we need to add some delay otherwise a click event is sent
    setTimeout((obj) => { obj.isResizing = false }, 200, this)
  }


  createElement = (el) => {
    var removeStyle = {
      position: 'absolute',
      right: '2px',
      top: 0,
      cursor: 'pointer'
    };
    let tile = null
    switch (el.type) {
      case widgetConstants.WIDGET_TYPE.CHART:
        tile = <Chart classname="chart" context={el}  > </Chart>
        break;
      case widgetConstants.WIDGET_TYPE.COUNTER:
        tile = <Counter context={el} />
        break;
      case widgetConstants.WIDGET_TYPE.OVERVIEWCHART:
        tile = <OverviewChart classname="chart" context={el}  > </OverviewChart>
        break;
    }
    return (
      <div key={el.datagrid.i} data-grid={el.datagrid} onClick={() => { this.onItemClick(el.datagrid.i) } } >
        {tile}
        <a href="#">
          <span className="glyphicon glyphicon-remove" style={removeStyle} onClick={this.onRemoveItem.bind(this, el.datagrid.i)} />
        </a>
        <style jsx>{`
          .chart {
             min-width:200px;
          }
        `}</style>
      </div>
    );
  }

  render() {
    //console.log(JSON.stringify(this.props.layout))
    return (
      <div>


        <ResponsiveReactGridLayout
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          className="layout"
          layouts={this.props.layout}
          rowHeight={100}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          onLayoutChange={this.onLayoutChange}
          onDrag={this.onDrag}
          onDragStop={this.onDragStop}
          onResizeStart={this.onResizeStart}
          onResizeStop={this.onResizeStop}
          //onItemClick={this.onItemClick} 
          onBreakpointChange={this.onBreakpointChange}
          // prevent to generate a click and show the modal on resize
          // DON'T inline the function as it will behave differently on different browsers
          // AND this will get executed later than expected as well
          // onResizeStart={(e)=>{this.resizeFlag = true; return  e;}}
          // onResizeStop={(e)=>{setTimeout((obj)=>{obj.resizeFlag = false},200, this); return e;}}
          >

          {_.map(this.props.items, this.createElement)}
        </ResponsiveReactGridLayout>

      </div>
    );
  }
}
// <div key="1" data-grid={{w: 3, h: 3, x: 0, y: 0, minW: 3, minH:3}}><span className="text">1</span></div>
// <div key="2" data-grid={{w: 3, h: 3, x: 2, y: 0, minW: 3, minH:3}}><span className="text">2</span></div>
// <div key="3" data-grid={{w: 3, h: 3, x: 4, y: 0, minW: 3, minH:3}}><span className="text">3</span></div>
// <div key="4" data-grid={{w: 3, h: 3, x: 6, y: 0, minW: 3, minH:3}}><span className="text">4</span></div>
// <div key="5" data-grid={{w: 3, h: 3, x: 8, y: 0, minW: 3, minH:3}}><span className="text">5</span></div>

function getFromLS(key) {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem('rgl-7')) || {};
    } catch (e) {/*Ignore*/ }
  }
  return ls[key];
}

function saveToLS(key, value) {
  if (global.localStorage) {
    global.localStorage.setItem('rgl-7', JSON.stringify({
      [key]: value
    }));
  }
}


export default Masonry;







//     //        return (
//     //             <li className="image-element-class">
//     //                 woohoooo
//     //             </li>
//     //         );
//     //     });




// const styles = {
//   heading: css({
//     fontSize: 50,
//     fontWeight: 200,
//     lineHeight: '40px',
//     color: '#e74c3c'
//   }),
//   content: css({
//     fontSize: 30,
//     fontWeight: 200,
//     lineHeight: '40px',
//     color: '#e74c3c'
//   }),
//   link: css({
//     color: '#e74c3c',
//     paddingBottom: 2,
//     borderBottom: '1px solid #c0392b',
//     textDecoration: 'none',
//     fontWeight: 400,
//     lineHeight: '30px',
//     transition: 'border-bottom .2s',
//     ':hover': {
//       borderBottomColor: '#e74c3c'
//     }
//   })
// }

// export  class GridItem extends React.Component {
//   static getInitialProps (ctx) {
//     return  {_grid:undefined}
//   }
//   static propTypes = {
//     _grid: PropTypes.object
//   }
// }
// export default class Masonry extends React.Component {

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
// //       var layout = [
// //       {i: 'a', x: 0, y: 0, w: 1, h: 2, static: true},
// //       {i: 'b', x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4},
// //       {i: 'c', x: 4, y: 0, w: 1, h: 2}
// //     ];
// //     ReactDOM.render(
// //        <ReactGridLayout className="layout" layout={layout} cols={12} rowHeight={30} width={1200}>
// //         <div key={'a'}>a</div>
// //        
// //       </ReactGridLayout>,  document.getElementById("woot")
// // );
//   }

//   render () {
//      var layout = [
//       {i: 'a', x: 0, y: 0, w: 1, h: 2, static: true},
//       {i: 'b', x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4},
//       {i: 'c', x: 4, y: 0, w: 1, h: 2}
//     ];

//     return (
//   <ReactGridLayout className="layout" layout={layout} cols={12} rowHeight={30} width={1200}>
//         <GridItem key={'a'}>a</GridItem>
//        
//       </ReactGridLayout>

//   //<p id="woot">woot</p>
//     )
//   }
// }