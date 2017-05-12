// @flow

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
const UPDATE_LAUNDRY_LIST_SIZE = 'UPDATE_LAUNDRY_LIST_SIZE'
const UPDATE_USER_LIST_SIZE = 'UPDATE_USER_LIST_SIZE'
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
  UPDATE_LAUNDRY_LIST_SIZE,
  UPDATE_USER_LIST_SIZE,
  FINISH_JOB,
  CONFIGURE
}

export type Model = {
  id: string
}

export type Machine = Model

export type Laundry = Model

export type User = Model

export type Booking = Model

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

export type State = {
  users: {[string]: User},
  userList: string[],
  userListSize: number,
  currentUser: string,
  flash: ???,
  laundries: {[string]: Laundry},
  laundryList: string[],
  laundryListSize: number,
  machines: {[string]: Machine},
  bookings: {[string]: Booking},
  userBookings: string[],
  invites: {[string]: Invite},
  stats: Stats,
  jobs: number,
  config: Config
}

/*
 LIST_BOOKINGS_FOR_USER,
 CREATE_INVITATION,
 LIST_INVITATIONS,
 DELETE_INVITATION,
 UPDATE_INVITATION,
 UPDATE_STATS,
 UPDATE_LAUNDRY_LIST_SIZE,
 UPDATE_USER_LIST_SIZE,
 FINISH_JOB
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
