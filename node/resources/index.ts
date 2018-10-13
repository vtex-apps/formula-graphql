import {Logger, LRUCache, ServiceContext, VBase} from '@vtex/api'

import Projects from './projects'

const cacheStorage = new LRUCache<string, any>({
  max: 200,
})

metrics.trackCache('resources', cacheStorage)

const withCache = {cacheStorage}

export default class Resources {
  public logger: Logger
  public projects: Projects

  private vbase: VBase

  constructor (ctx: ServiceContext) {
    this.logger = new Logger(ctx.vtex)
    this.vbase = new VBase(ctx.vtex, withCache)

    this.projects = new Projects(ctx, this.vbase, this.logger)
  }
}
