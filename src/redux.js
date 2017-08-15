// @flow
import { combineReducers } from 'redux'
import type { MachineType as MT, UserRole as UR, LaundryRules as LR, Time as T } from './types'

export type MachineType = MT
export type UserRole = UR
export type Time = T

export type LaundryRules = LR

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

export type Machine = {|
  id: string,
  type: MachineType,
  name: string,
  broken: boolean
|}

export type Laundry = {|
  id: string,
  name: string,
  machines: string[],
  users: string[],
  owners: string[],
  invites: string[],
  timezone: string,
  googlePlaceId: string,
  demo: boolean,
  rules: LaundryRules
|}

export type User = {|
  id: string,
  photo: string,
  displayName: string,
  laundries: string[],
  lastSeen?: string,
  role: UserRole,
  demo: boolean
|}

export type Booking = {|
  id: string,
  owner: string,
  from: string,
  to: string,
  machine: string
|}

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
  type: 'DELETE_LAUNDRY',
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

export type CreateInvitationAction = {
  type: 'CREATE_INVITATION',
  payload: Invite
}

export type UpdateInvitationAction = {
  type: 'UPDATE_INVITATION',
  payload: Invite
}

export type DeleteInvitationAction = {
  type: 'DELETE_INVITATION',
  payload: string
}

export type ListInvitationsAction = {
  type: 'LIST_INVITATIONS',
  payload: Invite[]
}

export type ListBookingsForUserAction = {
  type: 'LIST_BOOKINGS_FOR_USER',
  payload: { bookings: Booking[], user: string }
}

export type Stats = {|
  demoLaundryCount: number,
  demoUserCount: number,
  laundryCount: number,
  userCount: number,
  bookingCount: number,
  machineCount: number
|}

export type Flash = {|
  type: string,
  message: string
|}

export type Invite = {|
  id: string,
  used: boolean,
  email: string,
  laundry: string
|}

export type State = {|
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
  config: Config
|}

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
  | CreateInvitationAction
  | UpdateInvitationAction
  | DeleteInvitationAction
  | ListInvitationsAction

function users (s: { [string]: User } = {}, a: Action) {
  switch (a.type) {
    case SIGN_IN_USER:
    case UPDATE_USER:
      return {...s, [a.payload.id]: a.payload}
    case LIST_USERS:
      return a.payload.reduce((m, u) => ({...m, [u.id]: u}), s)
    default:
      return s
  }
}

function userList (s: string[] = [], a: Action): string[] {
  switch (a.type) {
    case LIST_USERS:
      return a.payload.map(({id}) => id)
    default:
      return s
  }
}

function laundryList (s: string[] = [], a: Action) {
  switch (a.type) {
    case LIST_LAUNDRIES:
      return a.payload.map(({id}) => id)
    default:
      return s
  }
}

function job (state: ?number = null, action: Action) {
  if (action.type === FINISH_JOB) {
    return action.payload
  }
  return state
}

function stats (state: ?Stats = null, action: Action) {
  if (action.type === UPDATE_STATS) {
    return action.payload
  }
  return state
}

function config (state: {} = {}, action: Action) {
  if (action.type === CONFIGURE) {
    return action.payload
  }
  return state
}

function flash (state: Flash[] = [], action: Action) {
  if (action.type === FLASH) {
    return [...state, action.payload]
  }
  return state
}

function currentUser (state: ?string = null, action: Action) {
  return action.type === SIGN_IN_USER ? action.payload.id : state
}

function laundries (state: { [string]: Laundry } = {}, action: Action): { [string]: Laundry } {
  switch (action.type) {
    case UPDATE_LAUNDRY:
    case CREATE_LAUNDRY:
      return {...state, [action.payload.id]: action.payload}
    case LIST_LAUNDRIES:
      return action.payload.reduce((state, laundry) => ({...state, [laundry.id]: laundry}), state)
    case DELETE_LAUNDRY:
      const s = {...state}
      delete s[action.payload]
      return s
    default:
      return state
  }
}

function machines (state: { [string]: Machine } = {}, action: Action): { [string]: Machine } {
  switch (action.type) {
    case UPDATE_MACHINE:
    case CREATE_MACHINE:
      return {...state, [action.payload.id]: action.payload}
    case LIST_MACHINES:
      return action.payload.reduce((state, machine) => ({...state, [machine.id]: machine}), state)
    case DELETE_MACHINE:
      const s = {...state}
      delete s[action.payload]
      return s
    default:
      return state
  }
}

function invites (state: { [string]: Invite } = {}, action: Action): { [string]: Invite } {
  switch (action.type) {
    case UPDATE_INVITATION:
    case CREATE_INVITATION:
      return {...state, [action.payload.id]: action.payload}
    case LIST_INVITATIONS:
      return action.payload.reduce((state, machine) => ({...state, [machine.id]: machine}), state)
    case DELETE_INVITATION:
      const s = {...state}
      delete s[action.payload]
      return s
    default:
      return state
  }
}

function bookings (state: { [string]: Booking } = {}, action: Action): { [string]: Booking } {
  switch (action.type) {
    case UPDATE_BOOKING:
    case CREATE_BOOKING:
      return {...state, [action.payload.id]: action.payload}
    case LIST_BOOKINGS:
      return action.payload.reduce((state, booking) => ({...state, [booking.id]: booking}), state)
    case LIST_BOOKINGS_FOR_USER:
      return action.payload.bookings.reduce((state, booking) => ({...state, [booking.id]: booking}), state)
    case DELETE_BOOKING:
      const s = {...state}
      delete s[action.payload]
      return s
    default:
      return state
  }
}

function userBookings (state: ?{ bookings: string[], user: string } = null, action: Action) {
  switch (action.type) {
    case LIST_BOOKINGS_FOR_USER:
      return {user: action.payload.user, bookings: action.payload.bookings.map(({id}) => id)}
    case CREATE_BOOKING:
      if (!state) {
        return null
      }
      if (state.user !== action.payload.owner) {
        return state
      }
      return {user: state.user, bookings: [...state.bookings, action.payload.id]}
    case DELETE_BOOKING:
      if (!state) {
        return null
      }
      const {user, bookings} = state
      return {user, bookings: bookings.filter(id => id !== action.payload)}
    default:
      return state
  }
}

export const reducer: (s: State, a: Action) => State = combineReducers({
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
