// @flow
import { combineReducers } from 'redux'

const SIGN_IN_USER = 'SIGN_IN_USER'
const LIST_LAUNDRIES = 'LIST_LAUNDRIES'
const LIST_MACHINES = 'LIST_MACHINES'
const FLASH = 'FLASH'
const UPDATE_USER = 'UPDATE_USER'
const CREATE_LAUNDRY = 'CREATE_LAUNDRY'
const UPDATE_LAUNDRY = 'UPDATE_LAUNDRY'
const CREATE_MACHINE = 'CREATE_MACHINE'
const UPDATE_MACHINE = 'UPDATE_MACHINE'
const DELETE_MACHINE = 'DELETE_MACHINE'
const DELETE_LAUNDRY = 'DELETE_LAUNDRY'
const UPDATE_BOOKING = 'UPDATE_BOOKING'
const DELETE_BOOKING = 'DELETE_BOOKING'
const CREATE_BOOKING = 'CREATE_BOOKING'
const LIST_BOOKINGS = 'LIST_BOOKINGS'
const LIST_BOOKINGS_FOR_USER = 'LIST_BOOKINGS_FOR_USER'
const LIST_USERS = 'LIST_USERS'
const CREATE_INVITATION = 'CREATE_INVITATION'
const LIST_INVITATIONS = 'LIST_INVITATIONS'
const DELETE_INVITATION = 'DELETE_INVITATION'
const UPDATE_INVITATION = 'UPDATE_INVITATION'
const UPDATE_STATS = 'UPDATE_STATS'
const FINISH_JOB = 'FINISH_JOB'
const CONFIGURE = 'CONFIGURE'

export const types = {
  LIST_MACHINES,
  CREATE_MACHINE,
  LIST_LAUNDRIES,
  SIGN_IN_USER,
  FLASH,
  UPDATE_USER,
  CREATE_LAUNDRY,
  UPDATE_MACHINE,
  DELETE_MACHINE,
  DELETE_LAUNDRY,
  UPDATE_LAUNDRY,
  UPDATE_BOOKING,
  CREATE_BOOKING,
  DELETE_BOOKING,
  LIST_BOOKINGS,
  LIST_BOOKINGS_FOR_USER,
  LIST_USERS,
  CREATE_INVITATION,
  LIST_INVITATIONS,
  DELETE_INVITATION,
  UPDATE_INVITATION,
  UPDATE_STATS,
  FINISH_JOB,
  CONFIGURE
}

export type Model = {
  id: string
}

export type Machine = Model

export type Laundry = Model

export type User = Model

export type Booking = Model & {
  owner: string
}

export type Config = {}

export type ListMachinesAction = {
  type: 'LIST_MACHINES',
  payload: Machine[]
}

export type CreateMachineAction = {
  type: 'CREATE_MACHINE',
  payload: Machine
}

export type ListLaundriesAction = {
  type: 'LIST_LAUNDRIES',
  payload: Laundry[]
}

export type SignInUserAction = {
  type: 'SIGN_IN_USER',
  payload: User
}

export type UpdateUserAction = {
  type: 'UPDATE_USER',
  payload: User
}

export type CreateLaundryAction = {
  type: 'CREATE_LAUNDRY',
  payload: Laundry
}

export type UpdateLaundryAction = {
  type: 'UPDATE_LAUNDRY',
  payload: Laundry
}

export type UpdateMachineAction = {
  type: 'UPDATE_MACHINE',
  payload: Machine
}

export type DeleteMachineAction = {
  type: 'DELETE_MACHINE',
  payload: string
}
export type DeleteLaundryAction = {
  type: 'DELETE_MACHINE',
  payload: string
}

export type ConfigureAction = {
  type: 'CONFIGURE',
  payload: Config
}

export type UpdateBookingAction = {
  type: 'UPDATE_BOOKING',
  payload: Booking
}

export type CreateBookingAction = {
  type: 'CREATE_BOOKING',
  payload: Booking
}
export type DeleteBookingAction = {
  type: 'DELETE_BOOKING',
  payload: string
}

export type ListBookingsAction = {
  type: 'LIST_BOOKINGS',
  payload: Booking[]
}

export type ListUsersAction = {
  type: 'LIST_USERS',
  payload: User[]
}

export type UpdateStatsAction = {
  type: 'UPDATE_STATS',
  payload: Stats
}

export type FinishJobAction = {
  type: 'FINISH_JOB',
  payload: number
}

export type FlashAction = {
  type: 'FLASH',
  payload: Flash
}

export type ListBookingsForUserAction = {
  type: 'LIST_BOOKINGS_FOR_USER',
  payload: { bookings: Booking[], user: string }
}

export type Stats = {
  demoLaundryCount: number,
  demoUserCount: number,
  laundryCount: number,
  userCount: number,
  bookingCount: number,
  machineCount: number
}

export type Flash = {
  type: string,
  message: string
}

export type Invite = Model & {
  used: boolean,
  email: string,
  laundry: string
}

export type State = {
  users: { [string]: User },
  userList: string[],
  currentUser: ?string,
  flash: Flash[],
  laundries: { [string]: Laundry },
  laundryList: string[],
  machines: { [string]: Machine },
  bookings: { [string]: Booking },
  userBookings: ?{ bookings: string[], user: string },
  invites: { [string]: Invite },
  stats: ?Stats,
  job: ?number,
  config: ?Config
}

/*
 LIST_BOOKINGS_FOR_USER,
 CREATE_INVITATION,
 LIST_INVITATIONS,
 DELETE_INVITATION,
 UPDATE_INVITATION,
 */
export type Action = ListMachinesAction
  | CreateMachineAction
  | ListLaundriesAction
  | SignInUserAction
  | UpdateUserAction
  | CreateLaundryAction
  | UpdateLaundryAction
  | UpdateMachineAction
  | DeleteMachineAction
  | DeleteLaundryAction
  | ConfigureAction
  | UpdateBookingAction
  | CreateBookingAction
  | DeleteBookingAction
  | ListBookingsAction
  | ListUsersAction
  | UpdateStatsAction
  | FinishJobAction
  | FlashAction
  | ListBookingsForUserAction

function users (s: { [string]: User }, a: Action) {
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

function userList (s: string[], a: Action): string[] {
  switch (a.type) {
    case types.LIST_USERS:
      return a.payload.map(({id}) => id)
    default:
      return s
  }
}
function laundryList (s: string[], a: Action) {
  switch (a.type) {
    case types.LIST_LAUNDRIES:
      return a.payload.map(({id}) => id)
    default:
      return s
  }
}

function job (state: number, action: Action) {
  if (action.type === types.FINISH_JOB) {
    return action.payload
  }
  return state
}

function stats (state: Stats, action: Action) {
  if (action.type === types.UPDATE_STATS) {
    return action.payload
  }
  return state
}

function config (state: {}, action: Action) {
  if (action.type === types.CONFIGURE) {
    return action.payload
  }
  return state
}

function flash (state: Flash[], action: Action) {
  if (action.type === types.FLASH) {
    return [...state, action.payload]
  }
  return state
}

function currentUser (state: string, action: Action): string {
  return action.type === types.SIGN_IN_USER ? action.payload.id : state
}

function laundries (state: { [string]: Laundry }, action: Action): { [string]: Laundry } {
  switch (action.type) {
    case types.UPDATE_LAUNDRY:
    case types.CREATE_LAUNDRY:
      return {...state, [action.payload.id]: action.payload}
    case types.LIST_LAUNDRIES:
      return action.payload.reduce((state, laundry) => ({...state, [laundry.id]: laundry}), state)
    case types.DELETE_LAUNDRY:
      const s = {...state}
      delete s[action.payload]
      return s
    default:
      return state
  }
}
function machines (state: { [string]: Machine }, action: Action): { [string]: Machine } {
  switch (action.type) {
    case types.UPDATE_MACHINE:
    case types.CREATE_MACHINE:
      return {...state, [action.payload.id]: action.payload}
    case types.LIST_MACHINES:
      return action.payload.reduce((state, machine) => ({...state, [machine.id]: machine}), state)
    case types.DELETE_MACHINE:
      const s = {...state}
      delete s[action.payload]
      return s
    default:
      return state
  }
}

function invites (state: { [string]: Invite }, action: Action): { [string]: Invite } {
  switch (action.type) {
    case types.UPDATE_INVITATION:
    case types.CREATE_INVITATION:
      return {...state, [action.payload.id]: action.payload}
    case types.LIST_INVITATIONS:
      return action.payload.reduce((state, machine) => ({...state, [machine.id]: machine}), state)
    case types.DELETE_INVITATION:
      const s = {...state}
      delete s[action.payload]
      return s
    default:
      return state
  }
}

function bookings (state: { [string]: Booking }, action: Action): { [string]: Booking } {
  switch (action.type) {
    case types.UPDATE_BOOKING:
    case types.CREATE_BOOKING:
      return {...state, [action.payload.id]: action.payload}
    case types.LIST_BOOKINGS:
      return action.payload.reduce((state, booking) => ({...state, [booking.id]: booking}), state)
    case types.LIST_BOOKINGS_FOR_USER:
      return action.payload.bookings.reduce((state, booking) => ({...state, [booking.id]: booking}), state)
    case types.DELETE_BOOKING:
      const s = {...state}
      delete s[action.payload]
      return s
    default:
      return state
  }
}

function userBookings (state: ?{ bookings: string[], user: string }, action: Action) {
  switch (action.type) {
    case types.LIST_BOOKINGS_FOR_USER:
      return {user: action.payload.user, bookings: action.payload.bookings.map(({id}) => id)}
    case types.CREATE_BOOKING:
      if (!state) {
        return null
      }
      if (state.user !== action.payload.owner) {
        return state
      }
      return {user: state.user, bookings: [...state.bookings, action.payload.id]}
    case types.DELETE_BOOKING:
      if (!state) {
        return null
      }
      const {user, bookings} = state
      return {user, bookings: bookings.filter(id => id !== action.payload)}
    default:
      return state
  }
}

export const reducer: (State, Action) => State = combineReducers({
  users,
  userList,
  currentUser,
  flash,
  laundries,
  laundryList,
  machines,
  bookings,
  userBookings,
  invites,
  stats,
  job,
  config
})

export const initState: State = {
  bookings: {},
  config: {},
  currentUser: null,
  flash: [],
  laundries: {},
  laundryList: [],
  machines: {},
  userBookings: null,
  invites: {},
  stats: null,
  job: null,
  userList: [],
  users: {}
}
