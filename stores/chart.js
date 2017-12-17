import { action, autorun, observable, computed, observe } from 'mobx';
import Uuid from 'uuid';
import 'rxjs/add/observable/dom/ajax'
import { Observable } from 'rxjs/Rx';


const devApiEndpoint = "192.168.0.48"
const devApiPort = "5000"
const devKeyspace = "cluster_test_cluster"
const apiVersion = "v2/data"
const customerId= "customer1"
const componentId="0"
const clusterId="Test Cluster"
      
      
  class Metric {
  @observable name;
  constructor(name) {
    this.name = name
  }
}



class Chart {


  @observable agents = undefined;
  @observable metricNameSelected = [];
  @observable title;
  @observable counter = 0;
  @observable metrics = [];
  @observable metricId = 0
  @observable metricsString = undefined;
  @observable type = "missing-data";
  @observable isResizing = false

  constructor(store, id, title, metricName, metricId, initial) {
    this.store = store;
    this.id = id;
    this.flag = false;
    this.data = [];
    this.metricName = metricName

    this.metricId = metricId
    console.log("INITIAL:", initial)
    if (initial) {
      // must be done from a getInitialProps

    } else {

    }
    // this.init()
    //
    //this.addMetric("14_ClientRequest_Latencyclientrequest=Write,fct=15MinuteRate")
  }




  static fromJS(store, chart) {
    return new Chart(store, chart.id, chart.title, chart.metricName, chart.metricId, false);
  }

  @computed get isLoggedIn() {
    return !!this.data;
  }



  // backoff logic
  computeInterval(error) {
    if (error) {
      // double until maximum interval on errors
      this.interval = this.interval < Chart.maxInterval ? this.interval * 2 : Chart.maxInterval;
    } else {
      // anytime the poller succeeds, make sure we've reset to
      // default interval.. this also allows the initInterval to 
      // change while the poller is running
      this.interval = Chart.initInterval;
    }
    return this.interval;
  }



  static prepareMetricsArray(metricsRaw) {
    const metrics = new Array();
    Object.keys(metricsRaw).forEach((key) => {
      metrics.push({ "d": new Date(key), "v": metricsRaw[key] })
      //console.log("pushing ", JSON.stringify({ "d": new Date(key), "v": metricsRaw[key] }))
    });

    return metrics;
  }

  toJS = () => {
    var js = {
      id: this.id,
      title: this.title,
      metrics: this.metrics,
      metricName: this.metricName,
      metricId: this.metricId,
      data: this.data.slice()
    };
    console.log("TO JS", js)
    return js
  }
  destroy = () => this.store.charts.remove(this)

}

export default class ChartStore {

  @observable charts = []
  @observable fromDateTime = undefined;
  @observable toDateTime = undefined;
  // used for rendering on the UI
  @observable renderedFromDateTime = undefined;
  @observable renderedToDateTime = undefined;

  @observable timeZone = "UTC";
  @observable predefinedTime = 5;

  @observable selectedClusters = [];
  @observable selectedDCs = [];
  @observable selectedRacks = [];
  @observable selectedHosts = [];

  static fromJS(initialState) {
    const chartStore = new ChartStore(initialState);
    chartStore.charts = initialState.charts.map(chart => Chart.fromJS(chartStore, chart));
    chartStore.apiEndpoint = initialState.apiEndpoint
    chartStore.apiPort = initialState.apiPort
    chartStore.keyspace = initialState.keyspace
    chartStore.predefinedTime = initialState.predefinedTime
    chartStore.customerId = initialState.customerId
    chartStore.componentId = initialState.componentId
    chartStore.clusterId = initialState.clusterId


    return chartStore;
  }

  constructor(initialState, env) {
     this.apiVersion = apiVersion

    if (initialState) {
      this.charts = observable(initialState.charts)
      this.fromDateTime = initialState.fromDateTime
      this.toDateTime = initialState.toDateTime
      this.timeZone = initialState.timeZone
      this.clusterSchema = initialState.clusterSchema ? JSON.parse(initialState.clusterSchema) : null
      this.apiEndpoint = initialState.apiEndpoint
      this.apiPort = initialState.apiPort
      this.customerId = initialState.customerId
       this.componentId = initialState.componentId
      this.clusterId = initialState.clusterId

      this.predefinedTime = initialState.predefinedTime

    } else {
      if (env && env.API_ENDPOINT && env.API_PORT) {
        this.apiEndpoint = env.API_ENDPOINT
        this.apiPort = env.API_PORT
        this.customerId = env.CUSTOMER_ID
         this.componentId = env.COMPONENT_ID
        this.clusterId = env.CLUSTER_ID
      }
      else {
        this.apiEndpoint = devApiEndpoint
        this.apiPort = devApiPort
         this.customerId = customerId
         this.componentId = componentId
        this.clusterId = clusterId
      }

      this.charts = [0/*, 1, 2*/].map(function (i, key, list) {
        // store, chart.id, chart.title, chart.metricName, chart.metricId
        return new Chart(this, i, "chart #" + i, "host_cpu_per*", 0, true);
      })
    }
  }

  async getInitialData() {
    this.body = {
      locator:{
         customerId: this.customerId,
         componentId:this.componentId,
         clusterId: this.clusterId,
      } 
    };

    console.log("FETCHInG", this.body)
    try {
      var res = await fetch(`http://${this.apiEndpoint}:${this.apiPort}/${this.apiVersion}/getClusterSchema`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.body)
      });

      var response = await res.json();
      console.log("REQUESTING:")
      console.log(`http://${this.apiEndpoint}:${this.apiPort}/${this.apiVersion}/getClusterSchema`)
      this.clusterSchema = JSON.stringify(response)
    } catch (e) {
      console.log('getClusterSchema Error: %s', e);
    }

  }

  // Implement with some data store for the user
  //   fetchInitialCharts = () => {
  //     if(this.initialFetch == true) {
  //       return true;
  //     }
  //     return fetch('https://jsonplaceholder.typicode.com/charts')
  //     .then(res => res.json())
  //     .then(charts => {
  //       charts.forEach(chart => this.addChart(chart.title))
  //       this.initialFetch = true;
  //     }
  //     )
  //   }

  addChart = action((title) =>
    this.charts.push(new Chart(this, Uuid.v4(), title))
  )

  updateCharts = action(() => {
    this.charts.forEach(chart => chart.title = "YEAH");
  }
  )

  toJS = () => {
    return {
      clusterSchema: this.clusterSchema,
      apiEndpoint: this.apiEndpoint,
      apiPort: this.apiPort,
      apiVersion: this.apiVersion,
      charts: this.charts.map(chart => chart.toJS()),
      timeZone: this.timeZone,
      predefinedTime: this.predefinedTime,
        customerId: this.customerId,
         componentId:this.componentId,
         clusterId: this.clusterId,
    }
  }

}