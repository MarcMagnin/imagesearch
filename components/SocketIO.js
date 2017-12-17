import React from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
//import { SocketProvider,  socketConnect} from 'socket.io-react';
//import socket from 'socket.io-client/socket.io';
//import io from 'socket.io-client';

class SocketIO extends React.Component {


//   constructor(props) {
//     super(props)
//     this.socket = "";
//     console.log(props)
 
//     //this.state = props.state
//     //this.logout = this.logout.bind(this)
//   }

// //   @observable title = props.chart ? props.chart.title : "";
// //   @observable refreshFlag = false;
// //   @observable dcs = null;
// //   @observable dcsSelected = null;
// //   @observable clusters = null;
// //   @observable clustersSelected = null;
// //   @observable hosts = null;
// //   @observable hostsSelected = null;
// //   @observable metrics = [];
// //   @observable metricNameSelected = null;

 



//   componentWillUpdate() {

//   }


//   componentWillReact() {
//     //console.log("I will re-render, since the todo has changed!");
//   console.log("test")
//   }

//   componentWillUnmount() {
//     this.unMount()
//   }
//   componentDidMount = () => {
//      	//socket.on('init', this._initialize);
//         this.socket = io("http://192.168.56.2:8080");
//         this.socket.on('connect', function(){
//              console.log("socket connected!!")
//         });
//         this.socket.on('message', function(message) {
//          console.log('Le serveur a un message pour vous : ' + message)
//         })
//         this.socket.on('togui', function(message) {
//          console.log('message from GO AGENT: ' + JSON.stringify(message))
//         })

//         this.socket.on('disconnect', function(){
//             console.log("socket disconnected!!")
//         });
//   }

// _initialize = (message)=> {
// 		console.log("wOOT from socketIO");
// 		//socket.emit('send:message', message);
// }
// handleMessageSubmit = (message)=> {
// 	/*	var {messages} = this.state;
// 		messages.push(message);
// 		this.setState({messages});*/
// 	//	socket.emit('send:message', message);
// }
// sendMessage =()=>{
//     	console.log("sending message");
//       this.socket.emit('message', 'Salut serveur, ça va ?');
// }
//   // clean subscription in case we leave the page or add other metrics 
//   unMount() {
//     // if (this.poller) {
//     //   this.poller.unsubscribe();
//     // }
//   }


//   componentWillReceiveProps(nextProps) {

//   }

//   render() {

//     return <div>
//             <p>socket test</p>
            
//       <button onClick={this.sendMessage}>send Message</button>

			
//     </div>
//   }
}

export default SocketIO
//<MessageForm
				//	onMessageSubmit={this.handleMessageSubmit}
				//	user={this.state.user}