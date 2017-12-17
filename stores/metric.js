import { action, extendObservable,observable, toJS } from 'mobx';
import 'isomorphic-fetch'; 
// Import the fast-filter library
import createFilterOptions from 'react-select-fast-filter-options'

class Metric {
    constructor(name) {
    extendObservable(this, {
      name
    });
  }
}

export class Filter {
    constructor() {
      this.clusters;
      this.dcs;
      this.zones;
      this.regions;
  }
}

export default class MetricStore {

  static fromJS(initialState) {
    var store ;
    if(initialState){
          store = new MetricStore(initialState);
    }else{
      store= new MetricStore();
    }
    return store;
  }

 constructor(initialState) {
    extendObservable(this, {
      metrics: [],
      metricNamesFilterOptions: ""
    });
    
    if(initialState){
      this.metrics = observable(initialState.metrics)
      // Create a search index optimized to quickly filter options.
      // The search index will need to be recreated if your options array changes.
      // This index is powered by js-search: https://github.com/bvaughn/js-search
      var options = initialState.metrics
      // JSON.stringify(options)
      // var myWorker = new Worker("worker.js");

      // myWorker.onmessage = function(e) {
      //   result.textContent = e.data;
      //   console.log('Message received from worker');
      // }

      // myWorker.postMessage({options, labelKey:"name", valueKey:"name"} );

      this.metricNamesFilterOptions = createFilterOptions( {options, labelKey:"name", valueKey:"name"} )
    }
  }

async fetchMetricNames() {
  try {
      const res = await fetch('http://localhost:9200/metametrics/metric/_search', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            size: 0,
            aggs: {
              metric: {
                terms:{
                  field :"metric_name",
                  size: 0
                }
              }
            }

          })
        });

      var res = await res.json();
    
      for(var k in res.aggregations.metric.buckets) {
          this.metrics.push({name: res.aggregations.metric.buckets[k].key});
      }
       console.log("METRIC NUMBER:"+ this.metrics.length)
     
    } catch (e) {
       console.log('onError: %s', e);
    }  
  }

 async fetchClusters () {
  try {
      const res = await fetch('http://localhost:9200/metametrics/metric/_search', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            size: 0,
            aggs: {
              metric: {
                terms:{
                  field :"cluster",
                  size: 0
                }
              }
            }
          })
        });

      var res = await res.json();
    
      for(var k in res.aggregations.metric.buckets) {
          this.metrics.push({value:res.aggregations.metric.buckets[k].key  , label:k+":"+res.aggregations.metric.buckets[k].key});
      }
     
    } catch (e) {
       console.log('onError: %s', e);
    }  
  }


  static async fetch(fieldToFetch, filter) {
  try {

    var query = new function(){
      this.size = 0;
      this.query = {};
      this.query.filtered = {}
      this.query.filtered.filter= {};
      this.query.filtered.filter.terms = {};
      if(filter && filter.dcs){
        this.query.filtered.filter.terms.dc = dcs;
      }
      if(filter && filter.clusters){
        this.query.filtered.filter.terms.cluster = clusters;
      } 
      if(filter && filter.zones){
        this.query.filtered.filter.terms.zone = zones;
      } 
      if(filter && filter.regions){
        this.query.filtered.filter.terms.region = regions;
      } 

      this.aggs ={}
      this.aggs.metric ={}
      this.aggs.metric.terms = {
          field : fieldToFetch,
          size:0
      }
    }
      console.log( JSON.stringify(query))
    
      const res = await fetch('http://localhost:9200/metametrics/metric/_search', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(query)
        });

      var res = await res.json();
      var result = []
      for(var k in res.aggregations.metric.buckets) {
          result.push({value:k, label:res.aggregations.metric.buckets[k].key});
      }
      return result;
    } catch (e) {
       console.log('onError: %s', e);
    }  
 }
  

  

  toJS= () => { return toJS({metrics : this.metrics})}

}