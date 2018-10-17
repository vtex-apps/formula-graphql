import {Logger, LRUCache, VBase} from '@vtex/api'

import Profile from './profile'
import Projects from './projects'
import Scores from './scores'
import Votes from './votes'

const vbaseCache = new LRUCache<string, any>({
  max: 200,
})

metrics.trackCache('vbase', vbaseCache)

export default class Resources {
  public logger: Logger
  public profile: Profile
  public projects: Projects
  public votes: Votes
  public scores: Scores

  private vbase: VBase

  constructor (ctx: ResolverContext) {
    this.logger = new Logger(ctx.vtex)
    this.vbase = new VBase(ctx.vtex, {cacheStorage: vbaseCache})

    this.profile = new Profile(ctx)
    this.projects = new Projects(ctx, this.vbase, this.logger)
    this.votes = new Votes(ctx, this.vbase, this.logger)
    this.scores = new Scores(ctx, this.vbase, this.logger)
  }
}
