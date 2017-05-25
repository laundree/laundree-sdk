// @flow

import request from 'superagent'
import EventEmitter from 'events'
import url from 'url'
import type { Store } from 'redux'
import type { Action, State } from './redux'

let jobId = 1

type Socket = {
  emit: () => void
}

type ListOptions = { q?: string, showDemo?: boolean, skip?: number, limit?: number }

type LaundryType = 'wash' | 'dry'

type Time = {
  hour: 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
    | 22
    | 23,
  minute: 0
    | 30
}

type LaundryModifier = {
  name?: string,
  googlePlaceId?: string,
  rules?: {
    limit?: number,
    dailyLimit?: number,
    timeLimit?: {
      from: Time,
      to: Time
    }
  }
}

export class Sdk {
  api = {
    user: new UserSdk(this),
    machine: new MachineSdk(this),
    laundry: new LaundrySdk(this),
    invite: new InviteSdk(this),
    booking: new BookingSdk(this),
    token: new TokenSdk(this),
    contact: new ContactSdk(this)
  }
  baseUrl: string
  jobEventEmitter: EventEmitter
  socket: any
  auth: ?{ userId: string, token: string }
  jobEventEmitter = new EventEmitter()

  constructor (baseUrl: string = '') {
    const {protocol, host} = url.parse(baseUrl)
    this.baseUrl = (protocol && host) ? `${protocol}://${host}` : ''
  }

  setupRedux (store: Store<State, Action>, socket: Socket) {
    this.socket = socket
    store.subscribe(() => {
      const job = store.getState().job
      if (!job && job !== 0) {
        return
      }
      this.jobEventEmitter.emit(job.toString())
    })
  }

  emit (action: string, ...args: mixed[]) {
    const jId = jobId++
    const opts = {jobId: jId}
    const newArgs = [action, opts].concat(args)
    return new Promise(resolve => {
      this.jobEventEmitter.once(jId.toString(), resolve)
      this.socket.emit(...newArgs)
    })
  }

  updateAuth ({userId, token}: { userId: string, token: string }) {
    this.auth = !(userId && token) ? null : {userId, token}
  }

  listBookingsInTime (laundryId: string, from: Date, to: Date) {
    return this.emit('listBookingsInTime', laundryId, from, to)
  }

  listBookingsForUser (laundryId: string, userId: string, filter: {} = {}) {
    return this.emit('listBookingsForUser', laundryId, userId, filter)
  }

  listUsersAndInvites (laundryId: string) {
    return this.emit('listUsersAndInvites', laundryId)
  }

  listUsers (options: ?ListOptions) {
    return this.emit('listUsers', options)
  }

  listMachines (laundryId: string) {
    return this.emit('listMachines', laundryId)
  }

  listLaundries (options: ListOptions) {
    return this.emit('listLaundries', options)
  }

  listMachinesAndUsers (laundryId: string) {
    return this.emit('listMachinesAndUsers', laundryId)
  }

  fetchLaundry (laundryId: string) {
    return this.emit('fetchLaundry', laundryId)
  }

  fetchUser (userId: string) {
    return this.emit('fetchUser', userId)
  }

  updateStats () {
    return this.emit('updateStats')
  }

  setupInitialEvents () {
    return this.emit('setupInitialEvents')
  }

  async _req (method: 'get' | 'post' | 'put' | 'delete', path: string, data: ?{} = null) {
    let req = request[method](path)
    if (this.auth) {
      req = req.set('Authorization', `Basic ${Buffer.from(`${this.auth.userId}:${this.auth.token}`).toString('base64')}`)
    }
    if (!data) return req.then()
    return req.send(data)
  }

  _post (path: string, data: ?{} = null) {
    return this._req('post', path, data)
  }

  _del (path: string) {
    return this._req('delete', path)
  }

  _put (path: string, data: ?{} = null) {
    return this._req('put', path, data)
  }

  _get (path: string) {
    return this._req('get', path)
  }
}

class ResourceSdk {
  sdk: Sdk
  resourcePath: string
  baseUrl: string

  constructor (resourcePath: string, sdk: Sdk) {
    this.resourcePath = resourcePath
    this.sdk = sdk
    this.baseUrl = this.sdk.baseUrl
  }

  _get (path) {
    return this.sdk._get(path)
  }

  _del (path) {
    return this.sdk._del(path)
  }

  _put (path, data) {
    return this.sdk._put(path, data)
  }

  _post (path, data) {
    return this.sdk._post(path, data)
  }

  async get (id: string) {
    return this.sdk._get(`${this.baseUrl}/api/${this.resourcePath}/${id}`).then(({body}) => body)
  }

  async del (id: string) {
    return this.sdk._del(`${this.baseUrl}/api/${this.resourcePath}/${id}`)
  }
}

class UserSdk extends ResourceSdk {

  constructor (sdk: Sdk) {
    super('users', sdk)
  }

  async fromEmail (email: string) {
    const {body} = await this._get(`${this.baseUrl}/api/users?email=${encodeURIComponent(email)}`)
    if (!body) return null
    if (body.length !== 1) return null
    return body[0]
  }

  async createUser (displayName: string, email: string, password: string) {
    const {body} = await this._post(`${this.baseUrl}/api/users`, {displayName, email, password})
    if (!body) return null
    return body
  }

  async signUpUser (name: string, email: string, password: string) {
    const user = await this.createUser(name, email, password)
    if (!user) {
      throw new Error('Failed to create user')
    }
    return new UserSdk(this.sdk)._startEmailVerification(user.id, email)
  }

  async startEmailVerification (email: string) {
    const user = await this.fromEmail(email)
    if (!user) throw new Error('User not found')
    return new UserSdk(this.sdk)._startEmailVerification(user.id, email)
  }

  forgotPassword (email: string) {
    return this
      .fromEmail(email)
      .then(user => {
        if (!user) throw new Error('User not found')
        return new UserSdk(this.sdk).startPasswordReset(user.id)
      })
  }

  async resetPassword (id: string, token: string, password: string) {
    return this._post(`${this.baseUrl}/api/users/${id}/password-reset`, {token, password})
  }

  listEmails (id: string) {
    return this._get(`${this.baseUrl}/api/users/${id}/emails`).then(({body}) => body)
  }

  addOneSignalPlayerId (id: string, playerId: string) {
    return this._post(`${this.baseUrl}/api/users/${id}/one-signal-player-ids`, {playerId})
  }

  updateName (id: string, name: string) {
    return this._put(`${this.baseUrl}/api/users/${id}`, {name})
  }

  changePassword (id: string, currentPassword: string, newPassword: string) {
    return this._post(`${this.baseUrl}/api/users/${id}/password-change`, {currentPassword, newPassword})
  }

  startPasswordReset (id: string) {
    return this._post(`${this.baseUrl}/api/users/${id}/start-password-reset`)
  }

  _startEmailVerification (id: string, email: string) {
    return this._post(`${this.baseUrl}/api/users/${id}/start-email-verification`, {email})
  }

}

class MachineSdk extends ResourceSdk {

  constructor (sdk: Sdk) {
    super('machines', sdk)
  }

  updateMachine (id: string, params: { name?: string, type?: LaundryType, broken?: boolean }) {
    return this._put(`${this.baseUrl}/api/machines/${id}`, params)
  }

  createBooking (id: string, from: Date, to: Date) {
    return this._post(`${this.baseUrl}/api/machines/${id}/bookings`, {from, to})
  }
}

class TokenSdk extends ResourceSdk {

  constructor (sdk: Sdk) {
    super('tokens', sdk)
  }

  /**
   * Creates a token
   * @param {String} name
   */
  createToken (name: string) {
    return this
      ._post(`${this.baseUrl}/api/tokens`, {name})
      .then(({body}) => body)
  }

  /**
   * @param {string} name
   * @param {string} email
   * @param {string} password
   */
  createTokenFromEmailPassword (name: string, email: string, password: string) {
    return this
      ._post(`${this.baseUrl}/api/tokens/email-password`, {name, email, password})
      .then(({body}) => body)
  }
}

class LaundrySdk extends ResourceSdk {

  constructor (sdk: Sdk) {
    super('laundries', sdk)
  }

  createLaundry (name: string, googlePlaceId: string) {
    return this._post(`${this.baseUrl}/api/laundries`, {name, googlePlaceId})
      .then(response => response.body || null)
  }

  /**
   * Create a demo landry
   * @returns {Promise.<{email: string, password: string}>}
   */
  createDemoLaundry () {
    return this._post(`${this.baseUrl}/api/laundries/demo`)
      .then(({body}) => body)
  }

  updateLaundry (id: string, params: LaundryModifier) {
    return this._put(`${this.baseUrl}/api/laundries/${id}`, params)
  }

  createMachine (id: string, name: string, type: LaundryType, broken: boolean) {
    return this._post(`${this.baseUrl}/api/laundries/${id}/machines`, {name, type, broken})
  }

  inviteUserByEmail (id: string, email: string) {
    return this._post(`${this.baseUrl}/api/laundries/${id}/invite-by-email`, {email})
  }

  removeUserFromLaundry (id: string, userId: string) {
    return this._del(`${this.baseUrl}/api/laundries/${id}/users/${userId}`)
  }

  createInviteCode (id: string) {
    return this._post(`${this.baseUrl}/api/laundries/${id}/invite-code`).then(({body}) => body)
  }

  addOwner (id: string, userId: string) {
    return this._post(`${this.baseUrl}/api/laundries/${id}/owners/${userId}`)
  }

  removeOwner (id: string, userId: string) {
    return this._del(`${this.baseUrl}/api/laundries/${id}/owners/${userId}`)
  }

  addFromCode (id: string, code: string) {
    return this._post(`${this.baseUrl}/api/laundries/${id}/users/add-from-code`, {key: code})
  }
}

class ContactSdk extends ResourceSdk {
  constructor (sdk: Sdk) {
    super('contact', sdk)
  }

  sendMessage ({name, email, subject, message}: { name?: string, email?: string, subject: string, message: string }) {
    return this._post(this.baseUrl + '/api/contact', {name, email, subject, message})
  }
}

class InviteSdk extends ResourceSdk {

  constructor (sdk: Sdk) {
    super('invites', sdk)
  }
}

class BookingSdk extends ResourceSdk {

  constructor (sdk: Sdk) {
    super('bookings', sdk)
  }
}
