import './globals'

import {ServiceContext} from '@vtex/api'
import {mapObjIndexed} from 'ramda'

import {AuthenticationError} from './AuthenticationError'
import {projectsMutations, projectsQueries} from './resolvers/projects'
import Resources from './resources'

const VTEX_ID_COOKIE = 'VtexIdclientAutCookie'

const log = (
  {vtex: {account, workspace}}: ServiceContext,
  resolver: string,
  [sec, ns],
  err?: Error,
) => [
  new Date().toISOString(),
  err ? '❌' : '✅',
  `${account}/${workspace}`,
  resolver,
  Math.trunc(sec * 1e3 + ns / 1e6) + 'ms',
].join('   ')

const statusLabel = (e?: Error) =>
  e ? `error${e.name ? `-${e.name}` : ''}` : 'success'

const prepare = <A, R, P>(resolver: Resolver<A, R, P>) => (parent: P, args: A, ctx: ResolverContext, info: any) => {
  if (!resolver.name) {
    throw new Error('Resolvers must be named')
  }

  let err
  const start = process.hrtime()
  ctx.resources = new Resources(ctx)

  try {
    const VtexIdclientAutCookie = ctx.cookies.get(VTEX_ID_COOKIE)
    if (!VtexIdclientAutCookie) {
      throw new AuthenticationError()
    }

    return resolver(parent, args, ctx, info)
  } catch (e) {
    err = e
    console.error(e)
    ctx.resources.logger.error(e, {resolver: resolver.name})
    throw e
  } finally {
    const end = process.hrtime(start)
    console.log(log(ctx, resolver.name, end, err))
    metrics.batchHrTimeMetricFromEnd(`resolver-${resolver.name}-${statusLabel(err)}`, end, ctx.vtex.production)
  }
}

export default {
  graphql: {
    resolvers: {
      Mutation: mapObjIndexed(prepare, projectsMutations),
      Query: mapObjIndexed(prepare, projectsQueries),
    },
  },
  statusTrack: metrics.statusTrack,
}
