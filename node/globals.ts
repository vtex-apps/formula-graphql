import {MetricsAccumulator, ServiceContext} from '@vtex/api'
import Resources from './resources'

global.metrics = new MetricsAccumulator()

declare global {
  const metrics: MetricsAccumulator

  type Resolver<A, R, P = any> = (parent: P, args: A, ctx: ResolverContext, info: any) => Promise<R>

  interface ResolverContext extends ServiceContext {
    resources: Resources
  }

  namespace NodeJS {
    interface Global {
      metrics: MetricsAccumulator
    }
  }
}
