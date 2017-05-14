// @flow
import { combineReducers } from 'redux'
import { setupSingleton, setupList, setupCollection } from './reducers/helpers'
import { types } from './actions'
import userBookings from './reducers/userBookings'
import type { UsersState, Action, UserListState } from './actions'

function users (s: UsersState, a: Action): UsersState {
  switch (a.type) {
    case types.SIGN_IN_USER:
    case types.UPDATE_USER:
      return {...s, [a.payload.id]: a.payload}
    case types.LIST_USERS:
      return a.payload.reduce((m, u) => ({...m, [u.id]: u}), s)
    default:
      return s
  }
}

function userList (s: UserListState, a: Action): UserListState {
  switch (a.type) {
    case types.LIST_USERS:
      return a.payload.map(({id}) => id)
    default:
      return s
  }
}


const laundries = setupCollection(
  [types.UPDATE_LAUNDRY, types.CREATE_LAUNDRY],
  [types.DELETE_LAUNDRY],
  [types.LIST_LAUNDRIES])

const machines = setupCollection(
  [types.UPDATE_MACHINE, types.CREATE_MACHINE],
  [types.DELETE_MACHINE],
  [types.LIST_MACHINES])

const mappers = {}
mappers[types.LIST_BOOKINGS_FOR_USER] = ({bookings}) => bookings

const bookings = setupCollection(
  [types.UPDATE_BOOKING, types.CREATE_BOOKING],
  [types.DELETE_BOOKING],
  [types.LIST_BOOKINGS, types.LIST_BOOKINGS_FOR_USER],
  mappers)

const invites = setupCollection(
  [types.CREATE_INVITATION, types.UPDATE_INVITATION],
  [types.DELETE_INVITATION],
  [types.LIST_INVITATIONS])

export default combineReducers({
  users,
  userList,
  userListSize: setupSingleton(types.UPDATE_USER_LIST_SIZE),
  currentUser: setupSingleton(types.SIGN_IN_USER, null, p => p.id),
  flash: setupSingleton(types.FLASH, [], (payload, state) => state.concat([payload])),
  laundries,
  laundryList: setupList(types.LIST_LAUNDRIES),
  laundryListSize: setupSingleton(types.UPDATE_LAUNDRY_LIST_SIZE),
  machines,
  bookings,
  userBookings,
  invites,
  stats: setupSingleton(types.UPDATE_STATS),
  jobs: setupSingleton(types.FINISH_JOB),
  config: setupSingleton(types.CONFIGURE)
})
