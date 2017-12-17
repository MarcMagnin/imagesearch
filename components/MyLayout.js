import layout from 'next/layout';

const MyLayout = layout(() => {
    return (
        <div>
       <h1> Header </h1>
       {this.props.children}
       </div>
    )
})