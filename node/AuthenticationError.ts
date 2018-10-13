import { AuthenticationError as ApolloAuthenticationError } from 'apollo-server-errors'

export class AuthenticationError extends ApolloAuthenticationError {
  constructor() {
    super('User is not authenticated')
  }
}
