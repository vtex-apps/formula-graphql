import {IOContext as ClientsContext} from '@vtex/api'
import {Context} from 'koa'
import {Dictionary} from 'ramda'

import Resources from './resources/index'

declare global {
  type LogLevel = 'info' | 'error' | 'warn' | 'debug'

  interface LicenseManagerUser {
    IsPersisted: boolean,
    IsRemoved: boolean,
    UserId: string,
    Login: string,
    Name: string,
    IsAdmin: boolean,
    IsReliable: boolean,
    IsBlocked: boolean
  }
}
