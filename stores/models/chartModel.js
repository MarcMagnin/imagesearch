import { action, autorun, observable, computed,observe } from 'mobx';
import Uuid from 'uuid';
import 'rxjs/add/observable/dom/ajax'
import { Observable } from 'rxjs/Rx';

export default class ChartModel {


  @observable agents = undefined;
  @observable metricNameSelected = [];
  @observable title;
  @observable counter = 0;
  @observable metrics = [];
  @observable metricId = 0
  @observable metricsString = undefined;
  @observable type = "missing-data";
  @observable isResizing = false
 
  constructor(store, id, title, metricName, config, initial) {
    this.store = store;
    this.id = id;
    this.flag = false;
    this.data = [];
    this.metricName = metricName
    this.config = config
      
  }

}