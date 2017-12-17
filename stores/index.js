import ChartStore from './chart.js';
import MetricStore from './metric.js';
import UiState from './uistate.js';

const defaultState = {
  ChartStore: null,
  MetricStore: null,
  UiState: null
}

class Stores {
  constructor(initialState, env) {
    this.ChartStore = (initialState && initialState.ChartStore) ? ChartStore.fromJS(initialState.ChartStore) : new ChartStore(null, env);
    this.MetricStore = (initialState && initialState.MetricStore) ? MetricStore.fromJS(initialState.MetricStore) : new MetricStore();
    this.UiState = (initialState && initialState.UiState) ? UiState.fromJS(initialState.UiState) : new UiState();

  }

  getState() {
    return {
      ChartStore: this.ChartStore.toJS(),
      MetricStore: this.MetricStore.toJS(),
      UiState: this.UiState.toJS()
    };
  }
}

export default (isServer, initialState = defaultState, env) => {
  if (isServer) {
    return new Stores(initialState, env);
  }
  else {

    if (!window.__stores__) {
      window.__stores__ = new Stores(initialState, env);

    }
    return window.__stores__;
  }
}
