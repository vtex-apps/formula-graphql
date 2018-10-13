import {
  AuthenticationError as ApolloAuthenticationError,
  ForbiddenError as ApolloForbiddenError
} from 'apollo-server-errors'

export class AuthenticationError extends ApolloAuthenticationError {
  constructor() {
    super('User is not authenticated')
  }
}

// tslint:disable-next-line
export class NotVTEXUserError extends ApolloForbiddenError {
  constructor() {
    super('VTEX Formula is only available to VTEX employees - sorry!')
  }
}
