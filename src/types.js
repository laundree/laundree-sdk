// @flow
export type Time = {
  hour: number,
  minute: number
}

export type UserRole = 'user' | 'admin'

export type MachineType = 'wash' | 'dry'

export type LocaleType = 'en' | 'da'

export type LaundryRules = {
  limit?: number,
  dailyLimit?: number,
  timeLimit?: {
    from: Time,
    to: Time
  }
}
