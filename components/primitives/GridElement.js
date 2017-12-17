import React, { PropTypes }  from 'react';

const GridElement =  class GridElement extends React.Component {

    static propTypes = {
        // React-grid-layout injected props
        className: PropTypes.string,
        onMouseDown: PropTypes.func,
        onMouseUp: PropTypes.func,
        onTouchStart: PropTypes.func,
        onTouchEnd: PropTypes.func,
        'data-grid': PropTypes.object,
    };

    static defaultProps = {
        // When element is static, rgl doesn't pass these props
        onMouseDown: () => {},
        onMouseUp: () => {},
        onTouchStart: () => {},
        onTouchEnd: () => {},
    };


 onDragStart = (e) => {
    // e.preventDefault();
    // e.stopPropagation();
    // this.dragFlag = true;
    this.props.onDragStart(e);
  }

  onDragEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // fix for firefox
    setTimeout((obj)=>{obj.dragFlag = false},200, this);
    this.props.onMouseUp(e);
  }

  // enable click on the whole item. Needs to secure the resize action then
  onClick = (e) => {
      // fix for firefox
      //if(!this.dragFlag){
        this.props.onClick(e);      
      //}
  }

  render() {
    // React grid defines some important style, so it needs to be passed
    const { children, style, className } = this.props;

    const child = children[0];
    const dragHandle = children[1]; // always a second element. First element is an array of real children;

    return (
      <div
        draggable
        className={className}
        onDragStart={this.onDragStart}  // this fixes rgl's onClick and onMouseDown
        onMouseUp={this.onDragEnd}  // use onMouseUp because onDragStart prevents default
        onClick={this.onClick}
        style={style}
      >
        {child}
        {dragHandle}
      </div>
    );
  }
}
export default GridElement