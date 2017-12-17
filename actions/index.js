import { CALL_API } from '../middleware/api'

export const USER_REQUEST = 'USER_REQUEST'
export const USER_SUCCESS = 'USER_SUCCESS'
export const USER_FAILURE = 'USER_FAILURE'

const fetchData = endpoint => ({
    [CALL_API]: {
        types: [DATA_FETCH_BEGIN, DATA_FETCH_SUCCESS, DATA_FETCH_ERROR],
        endpoint: endpoint
    }
})

// Fetches data unless it is cached.
// Relies on Redux Thunk middleware.
export const loadData = (endpoint, requiredFields = []) => (dispatch, getState) => {
//   const user = getState().entities.users[login]
//   if (user && requiredFields.every(key => user.hasOwnProperty(key))) {
//     return null
//   }
  return dispatch(fetchUser(login))
}
