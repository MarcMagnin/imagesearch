import { observable, autorun } from 'mobx';


export default class UiState {
  @observable selectedChart = undefined;
  @observable currentPage = undefined;
  @observable navDrawerOpen = false;
  @observable isModalVisible = false;
  @observable isCustomTimeSelected = false;


  static fromJS(initialState) {
    const state = new UiState(initialState);
    state.isCustomTimeSelected = initialState.isCustomTimeSelected
    return state;
  }

  constructor(initialState, env) {
    if (initialState) {
      this.isCustomTimeSelected = observable(initialState.isCustomTimeSelected)
    }
    this.focusedItem = null
  }
  toJS = () => {
    return {
      isCustomTimeSelected: this.isCustomTimeSelected,
    }
  }

  // required to unfocus some input while clicking on a chart
  forceUnfocus = () => {
    if (this.focusedItem != null) {
      this.focusedItem.blur()
    }
  }
}