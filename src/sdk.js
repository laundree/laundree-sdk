// @flow

import request from 'superagent'
import EventEmitter from 'events'
import type { Store } from 'redux'
import type { Action, State } from './redux'
import type { MachineType as MT, UserRole as UR, LocaleType as LT, LaundryRules as LR, Time as T } from './types'

export type Time = T
export type MachineType = MT
export type UserRole = UR
export type LocaleType = LT
export type LaundryRules = LR

let jobId = 1

type Name = {
  familyName?: string,
  givenName?: string,
  middleName?: string
}

type Socket = {
  emit: () => void
}

export type DateTimeObject = {
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
}

export type Summary = { id: string, href: string }

export type User = {|
  id: string,
  photo: string,
  displayName: string,
  name: Name,
  href: string,
  locale: LocaleType,
  lastSeen?: string,
  laundries: Summary[],
  tokens: Summary[],
  demo: boolean,
  role: UserRole
|}

export type Booking = {|
  id: string,
  href: string,
  from: DateTimeObject,
  to: DateTimeObject
|}

export type Token = {|
  id: string,
  href: string,
  name: string,
  owner: Summary
|}

export type TokenWithSecret = {|
  id: string,
  href: string,
  name: string,
  owner: Summary,
  secret: string
|}

export type Laundry = {|
  id: string,
  href: string,
  name: string,
  owners: Summary[],
  users: Summary[],
  machines: Summary[],
  invites: Summary[],
  timezone: string,
  googlePlaceId: string,
  demo: boolean,
  rules: LaundryRules
|}

export type Machine = {|
  id: string,
  href: string,
  name: string,
  type: MachineType,
  broken: boolean
|}

export type LaundryInvitation = {|
  id: string,
  href: string,
  email: string,
  laundry: Summary
|}

export type Resource = User | Booking | Token | Laundry | Machine | Booking | LaundryInvitation

export type ValidateCredentialsResult = {| userId: string, emailVerified: boolean |}

export type CreateDemoLaundryResult = {| email: string, password: string |}

export type CreateInviteCodeResult = {| key: string, href: string |}

export type ApiResult =
  Resource
  | TokenWithSecret
  | ValidateCredentialsResult
  | CreateDemoLaundryResult
  | CreateInviteCodeResult
  | Summary[]

export type ListOptions = { q?: string, showDemo?: boolean, skip?: number, limit?: number }

export type CreateUserBody = { displayName: string, email: string, password: string }

export type CreateBookingBody = { from: DateTimeObject, to: DateTimeObject }

export type UpdateBookingBody = { from?: DateTimeObject, to?: DateTimeObject }

export type ContactBody = { message: string, subject: string, name?: string, email?: string, locale?: LocaleType }

export type CreateLaundryBody = { name: string, googlePlaceId: string }

export type InviteUserByEmailBody = { email: string, locale?: LocaleType }

export type UpdateLaundryBody = {
  name?: string,
  googlePlaceId?: string,
  rules?: LaundryRules
}

export type AddUserFromCodeBody = { key: string }

export type CreateMachineBody = { broken: boolean, type: MachineType, name: string }

export type UpdateMachineBody = { broken?: boolean, type?: MachineType, name?: string }

export type TokenType = 'auth' | 'calendar'

export type CreateTokenBody = { name: string, type: TokenType }

export type VerifyTokenBody = { token: string, type: TokenType }

export type CreateTokenFromEmailPasswordBody = { name: string, email: string, password: string }

export type StartPasswordResetBody = { locale?: LocaleType }

export type PasswordResetBody = { token: string, password: string }

export type StartEmailVerificationBody = { email: string, locale?: LocaleType }

export type VerifyEmailBody = { email: string, token: string }

export type UpdateUserBody = { name?: string, locale?: LocaleType }

export type ChangeUserPasswordBody = { currentPassword: string, newPassword: string }

export type AddOneSignalPlayerIdBody = { playerId: string }

export type ValidateCredentialsBody = { email: string, password: string }

export type VerifyInviteCodeBody = { key: string }

export type CreateUserFromProfileBody = {
  provider: string,
  id: string,
  displayName: string,
  name: Name,
  emails: { value: string, type?: string }[],
  photos?: { value: string }[]
}

export type DateObject = {
  year: number,
  month: number,
  day: number
}

type AuthenticatorStrategy = { type: 'bearer', token: string }
  | { type: 'basic', username: string, password: string }
  | { type: 'unauthenticated' }

type Authenticator = () => Promise<AuthenticatorStrategy>

export class Sdk {
  api: {
    user: UserSdk,
    machine: MachineSdk,
    laundry: LaundrySdk,
    invite: InviteSdk,
    booking: BookingSdk,
    token: TokenSdk,
    contact: ContactSdk
  }
  baseUrl: string
  socket: any
  jobEventEmitter = new EventEmitter()
  authenticator: Authenticator

  constructor (baseUrl: string = '/api', authenticator: Authenticator = () => Promise.resolve({type: 'unauthenticated'})) {
    this.baseUrl = baseUrl
    this.api = {
      user: new UserSdk(this),
      machine: new MachineSdk(this),
      laundry: new LaundrySdk(this),
      invite: new InviteSdk(this),
      booking: new BookingSdk(this),
      token: new TokenSdk(this),
      contact: new ContactSdk(this)
    }
    this.authenticator = authenticator
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

  emit (action: string, ...args: mixed[]): Promise<void> {
    const jId = jobId++
    const opts = {jobId: jId}
    const newArgs = [action, opts].concat(args)
    return new Promise(resolve => {
      this.jobEventEmitter.once(jId.toString(), resolve)
      this.socket.emit(...newArgs)
    })
  }

  listBookingsInTime (laundryId: string, from: DateObject, to: DateObject) {
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
    let req = request[method](`${this.baseUrl}${path}`)
    const authStrategy = await this.authenticator()
    switch (authStrategy.type) {
      case 'unauthenticated':
        break
      case 'basic':
        req = req.set('Authorization', `Basic ${Buffer.from(`${authStrategy.username}:${authStrategy.password}`).toString('base64')}`)
        break
      case 'bearer':
        req = req.set('Authorization', `Bearer ${authStrategy.token}`)
    }
    if (this.auth) {
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

class ResourceSdk<R: Resource | void = void> {
  sdk: Sdk
  resourcePath: string

  constructor (resourcePath: string, sdk: Sdk) {
    this.resourcePath = resourcePath
    this.sdk = sdk
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

  async get (id: string): Promise<R> {
    const res = await this.sdk._get(`/${this.resourcePath}/${id}`)
    return res.body
  }

  async del (id: string) {
    await this.sdk._del(`/${this.resourcePath}/${id}`)
  }
}

class UserSdk extends ResourceSdk<User> {
  constructor (sdk: Sdk) {
    super('users', sdk)
  }

  async createToken (userId: string, b: CreateTokenBody): Promise<TokenWithSecret> {
    const res = await this._post(`/users/${userId}/tokens`, b)
    return res.body
  }

  async verifyToken (userId: string, b: VerifyTokenBody): Promise<void> {
    await this._post(`/users/${userId}/tokens/verify`, b)
  }

  async verifyEmail (id: string, b: VerifyEmailBody): Promise<void> {
    await this._post(`/users/${id}/verify-email`, b)
  }

  async validateCredentials (b: ValidateCredentialsBody): Promise<ValidateCredentialsResult> {
    const res = await this._post('/users/validate-credentials', b)
    return res.body
  }

  async createUserFromProfile (b: CreateUserFromProfileBody): Promise<User> {
    const res = await this._post('/users/profile', b)
    return res.body
  }

  async fromEmail (email: string): Promise<?User> {
    const {body} = await this._get(`/users?email=${encodeURIComponent(email)}`)
    if (!body) return null
    if (body.length !== 1) return null
    return body[0]
  }

  async createUser (b: CreateUserBody): Promise<User> {
    const {body} = await this._post('/users', b)
    return body
  }

  async signUpUser (b: { displayName: string, email: string, password: string, locale?: LocaleType }): Promise<User> {
    const {displayName, email, password, locale} = b
    const user = await this.createUser({displayName, email, password})
    if (!user) {
      throw new Error('Failed to create user')
    }
    await this._startEmailVerification(user.id, {email, locale})
    return user
  }

  async startEmailVerification (b: StartEmailVerificationBody): Promise<void> {
    const user = await this.fromEmail(b.email)
    if (!user) throw new Error('User not found')
    await this._startEmailVerification(user.id, b)
  }

  async forgotPassword (p: { email: string, locale?: LocaleType }): Promise<void> {
    const user = await this.fromEmail(p.email)
    if (!user) throw new Error('User not found')
    await this.startPasswordReset(user.id, p.locale ? {locale: p.locale} : {})
  }

  async resetPassword (id: string, body: PasswordResetBody): Promise<void> {
    return this._post(`/users/${id}/password-reset`, body)
  }

  async listEmails (id: string): Promise<string[]> {
    const res = await this._get(`/users/${id}/emails`)
    return res.body
  }

  async addOneSignalPlayerId (id: string, body: AddOneSignalPlayerIdBody): Promise<void> {
    await this._post(`/users/${id}/one-signal-player-ids`, body)
  }

  async updateUser (id: string, body: UpdateUserBody): Promise<User> {
    const {body: b} = await this._put(`/users/${id}`, body)
    return b
  }

  async changePassword (id: string, body: ChangeUserPasswordBody): Promise<void> {
    await this._post(`/users/${id}/password-change`, body)
  }

  async startPasswordReset (id: string, b?: StartPasswordResetBody): Promise<void> {
    await this._post(`/users/${id}/start-password-reset`, b)
  }

  async _startEmailVerification (id: string, body: StartEmailVerificationBody): Promise<void> {
    await this._post(`/users/${id}/start-email-verification`, body)
  }
}

class MachineSdk extends ResourceSdk<Machine> {
  constructor (sdk: Sdk) {
    super('machines', sdk)
  }

  updateMachine (id: string, params: UpdateMachineBody): Promise<Machine> {
    return this._put(`/machines/${id}`, params)
  }

  createBooking (id: string, body: CreateBookingBody): Promise<Booking> {
    return this._post(`/machines/${id}/bookings`, body)
  }
}

class TokenSdk extends ResourceSdk<Token> {
  constructor (sdk: Sdk) {
    super('tokens', sdk)
  }

  async createTokenFromEmailPassword (b: CreateTokenFromEmailPasswordBody): Promise<Token> {
    const res = await this._post('/tokens/email-password', b)
    return res.body
  }
}

class LaundrySdk extends ResourceSdk<Laundry> {
  constructor (sdk: Sdk) {
    super('laundries', sdk)
  }

  async createLaundry (b: CreateLaundryBody): Promise<Laundry> {
    const res = await this._post('/laundries', b)
    return res.body
  }

  /**
   * Create a demo landry
   * @returns {Promise.<{email: string, password: string}>}
   */
  async createDemoLaundry (): Promise<CreateDemoLaundryResult> {
    const res = await this._post('/laundries/demo')
    return res.body
  }

  async updateLaundry (id: string, params: UpdateLaundryBody): Promise<Laundry> {
    const res = await this._put(`/laundries/${id}`, params)
    return res.body
  }

  async createMachine (id: string, b: CreateMachineBody): Promise<Machine> {
    const res = await this._post(`/laundries/${id}/machines`, b)
    return res.body
  }

  async inviteUserByEmail (id: string, b: InviteUserByEmailBody): Promise<void> {
    await this._post(`/laundries/${id}/invite-by-email`, b)
  }

  async removeUserFromLaundry (id: string, userId: string): Promise<void> {
    return this._del(`/laundries/${id}/users/${userId}`)
  }

  async createInviteCode (id: string): Promise<CreateInviteCodeResult> {
    const res = await this._post(`/laundries/${id}/invite-code`)
    return res.body
  }

  async verifyInviteCode (id: string, b: VerifyInviteCodeBody): Promise<void> {
    await this._post(`/laundries/${id}/verify-invite-code`, b)
  }

  async addOwner (id: string, userId: string): Promise<void> {
    await this._post(`/laundries/${id}/owners/${userId}`)
  }

  async addUser (id: string, userId: string): Promise<void> {
    await this._post(`/laundries/${id}/users/${userId}`)
  }

  async removeOwner (id: string, userId: string): Promise<void> {
    await this._del(`/laundries/${id}/owners/${userId}`)
  }

  async addFromCode (id: string, b: AddUserFromCodeBody): Promise<void> {
    await this._post(`/laundries/${id}/users/add-from-code`, b)
  }
}

class ContactSdk extends ResourceSdk {
  constructor (sdk: Sdk) {
    super('contact', sdk)
  }

  async sendMessage (b: ContactBody): Promise<void> {
    await this._post('/contact', b)
  }
}

class InviteSdk extends ResourceSdk<LaundryInvitation> {
  constructor (sdk: Sdk) {
    super('invites', sdk)
  }
}

class BookingSdk extends ResourceSdk<Booking> {
  constructor (sdk: Sdk) {
    super('bookings', sdk)
  }

  async updateBooking (id: string, dates: UpdateBookingBody): Promise<Booking> {
    const res = await this._put(`/bookings/${id}`, dates)
    return res.body
  }
}
