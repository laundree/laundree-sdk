/**
 * Created by budde on 21/10/2016.
 */

const request = require('superagent')
const EventEmitter = require('events')

let jobId = 1

function setupF (f, instance, functionName) {
  f[functionName] = function () {
    return instance[functionName].apply(instance, arguments)
  }
}

function sanitizeUrl (url) {
  if (!url.endsWith('/')) return url
  return sanitizeUrl(url.substr(0, url.length - 1))
}

class Sdk {

  constructor (baseUrl = '') {
    this.baseUrl = sanitizeUrl(baseUrl)
  }

  get user () {
    const f = (id) => new UserSdk(this, id)
    const user = new UserSdk(this)
    setupF(f, user, 'fromEmail')
    setupF(f, user, 'createUser')
    setupF(f, user, 'signUpUser')
    setupF(f, user, 'startEmailVerification')
    setupF(f, user, 'forgotPassword')
    return f
  }

  get machine () {
    return (id) => new MachineSdk(this, id)
  }

  get laundry () {
    const f = (id) => new LaundrySdk(this, id)
    const laundry = new LaundrySdk(this)
    setupF(f, laundry, 'createDemoLaundry')
    setupF(f, laundry, 'createLaundry')
    return f
  }

  get invite () {
    return (id) => new InviteSdk(this, id)
  }

  get booking () {
    return (id) => new BookingSdk(this, id)
  }

  get token () {
    const f = id => new TokenSdk(this, id)
    const token = new TokenSdk(this)
    setupF(f, token, 'createTokenFromEmailPassword')
    return f
  }

  contact ({name, email, subject, message}) {
    return post(this.baseUrl + '/api/contact', {name, email, subject, message})
  }

  setupRedux (store, socket) {
    this.socket = socket
    this.jobEventEmitter = new EventEmitter()
    store.subscribe(() => this.jobEventEmitter.emit(store.getState().jobs))
  }

  emit (action) {
    const jId = jobId++
    const args = Array.prototype.slice.call(arguments, 1)
    const opts = {jobId: jId}
    const newArgs = [action, opts].concat(args)
    return new Promise(resolve => {
      this.jobEventEmitter.once(jId, resolve)
      this.socket.emit.apply(this.socket, newArgs)
    })
  }

  updateAuth ({userId, token}) {
    this.auth = !(userId && token) ? null : {userId, token}
  }

  listBookingsInTime (laundryId, from, to) {
    return this.emit('listBookingsInTime', laundryId, from, to)
  }

  listBookingsForUser (laundryId, userId, filter = {}) {
    return this.emit('listBookingsForUser', laundryId, userId, filter)
  }

  listUsersAndInvites (laundryId) {
    return this.emit('listUsersAndInvites', laundryId)
  }

  listUsers (options) {
    return this.emit('listUsers', options)
  }

  listMachines (laundryId) {
    return this.emit('listMachines', laundryId)
  }

  listLaundries (options) {
    return this.emit('listLaundries', options)
  }

  listMachinesAndUsers (laundryId) {
    return this.emit('listMachinesAndUsers', laundryId)
  }

  fetchLaundry (laundryId) {
    return this.emit('fetchLaundry', laundryId)
  }

  fetchUser (userId) {
    return this.emit('fetchUser', userId)
  }

  updateStats () {
    return this.emit('updateStats')
  }

  setupInitialEvents () {
    return this.emit('setupInitialEvents')
  }

  _req (method, path, data = null) {
    const req = request[method](path)
    if (this.auth) {
      req.auth(this.auth.userId, this.auth.token)
    }
    if (!data) return req.then()
    return req
      .send(data)
      .then()
  }

  _post (path, data = null) {
    return this._req('post', path, data)
  }

  _del (path) {
    return this._req('delete', path)
  }

  _put (path, data = null) {
    return this._req('put', path, data)
  }

  _get (path) {
    return this._req('get', path)
  }
}

class ResourceSdk {
  constructor (resourcePath, sdk, id = '') {
    this.resourcePath = resourcePath
    this.sdk = sdk
    this.id = id
  }

  get baseUrl () {
    return this.sdk.baseUrl
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

  get () {
    return this.sdk._get(`${this.baseUrl}/api/${this.resourcePath}/${this.id}`).then(({body}) => body)
  }

  del () {
    return this.sdk._del(`${this.baseUrl}/api/${this.resourcePath}/${this.id}`)
  }
}

class UserSdk extends ResourceSdk {

  constructor (sdk, id) {
    super('users', sdk, id)
  }

  fromEmail (email) {
    return this._get(`${this.baseUrl}/api/users?email=${encodeURIComponent(email)}`)
      .then(({body}) => {
        if (!body) return null
        if (body.length !== 1) return null
        return body[0]
      })
  }

  createUser (displayName, email, password) {
    return this._post(`${this.baseUrl}/api/users`, {displayName, email, password})
      .then(({body}) => {
        if (!body) return null
        return body
      })
  }

  signUpUser (name, email, password) {
    return this
      .createUser(name, email, password)
      .then(({id}) => new UserSdk(this, id)
        .startEmailVerification(email))
  }

  startEmailVerification (email) {
    return this
      .fromEmail(email)
      .then(user => {
        if (!user) throw new Error('User not found')
        return new UserSdk(this, user.id)
          ._startEmailVerification(email)
      })
  }

  forgotPassword (email) {
    return this
      .fromEmail(email)
      .then(user => {
        if (!user) throw new Error('User not found')
        return new UserSdk(this, user.id)
          .startPasswordReset()
      })
  }

  resetPassword (token, password) {
    return this._post(`${this.baseUrl}/api/users/${this.id}/password-reset`, {token, password})
  }

  listEmails () {
    return this._get(`${this.baseUrl}/api/users/${this.id}/emails`).then(({body}) => body)
  }

  updateName (name) {
    return this._put(`${this.baseUrl}/api/users/${this.id}`, {name})
  }

  changePassword (currentPassword, newPassword) {
    return this._post(`${this.baseUrl}/api/users/${this.id}/password-change`, {currentPassword, newPassword})
  }

  startPasswordReset () {
    return this._post(`${this.baseUrl}/api/users/${this.id}/start-password-reset`)
  }

  _startEmailVerification (email) {
    return this._post(`${this.baseUrl}/api/users/${this.id}/start-email-verification`, {email})
  }

}

class MachineSdk extends ResourceSdk {

  constructor (sdk, id) {
    super('machines', sdk, id)
  }

  /**
   * Update machine
   * @param {{name:string=, type: string=}} params
   */
  updateMachine (params) {
    return this._put(`${this.baseUrl}/api/machines/${this.id}`, params)
  }

  /**
   * Create a booking
   * @param {Date} from
   * @param {Date} to
   */
  createBooking (from, to) {
    return this._post(`${this.baseUrl}/api/machines/${this.id}/bookings`, {from, to})
  }
}

class TokenSdk extends ResourceSdk {

  constructor (sdk, id) {
    super('tokens', sdk, id)
  }

  /**
   * @param {string} name
   * @param {string} email
   * @param {string} password
   */
  createTokenFromEmailPassword (name, email, password) {
    return this._post(`${this.baseUrl}/api/tokens/email-password`, {name, email, password}).then(({body}) => body)
  }
}

class LaundrySdk extends ResourceSdk {

  constructor (sdk, id) {
    super('laundries', sdk, id)
  }

  createLaundry (name, googlePlaceId) {
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

  updateLaundry ({name, googlePlaceId, rules}) {
    return this._put(`${this.baseUrl}/api/laundries/${this.id}`, {name, googlePlaceId, rules})
  }

  createMachine (name, type, broken) {
    return this._post(`${this.baseUrl}/api/laundries/${this.id}/machines`, {name, type, broken})
  }

  inviteUserByEmail (email) {
    return this._post(`${this.baseUrl}/api/laundries/${this.id}/invite-by-email`, {email})
  }

  removeUserFromLaundry (userId) {
    return this._del(`${this.baseUrl}/api/laundries/${this.id}/users/${userId}`)
  }

  createInviteCode () {
    return this._post(`${this.baseUrl}/api/laundries/${this.id}/invite-code`).then(({body}) => body)
  }

  addOwner (userId) {
    return this._post(`${this.baseUrl}/api/laundries/${this.id}/owners/${userId}`)
  }

  removeOwner (userId) {
    return this._del(`${this.baseUrl}/api/laundries/${this.id}/owners/${userId}`)
  }
}

class InviteSdk extends ResourceSdk {

  constructor (sdk, id) {
    super('invites', sdk, id)
  }
}

class BookingSdk extends ResourceSdk {

  constructor (baseUrl, id) {
    super('bookings', baseUrl, id)
  }
}

module.exports = Sdk
