import {MetricsAccumulator, ServiceContext} from '@vtex/api'
import Resources from './resources'

global.metrics = new MetricsAccumulator()

declare global {
  const metrics: MetricsAccumulator

  type Resolver<A, R, P = any> = (parent: P, args: A, ctx: ResolverContext, info: any) => Promise<R>

  interface ProfileData {
    name: string
    email: string
    picture: string | null
    id: string
  }

  interface ResolverContext extends ServiceContext {
    resources: Resources
    profile: ProfileData
  }

  namespace NodeJS {
    interface Global {
      metrics: MetricsAccumulator
    }
  }
}
