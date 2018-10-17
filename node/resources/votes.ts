import {Logger, VBase} from '@vtex/api'

export interface Vote {
  execution: number
  relevance: number
}

export interface UserVotes {
  [projectID: string]: Vote
}

export default class Votes {
  private static getBucket = (edition: string) => `${edition}-votes`
  private static getUserFile = (id: string) => `${id}.json`

  constructor (
    public ctx: ResolverContext,
    public vbase: VBase,
    public logger: Logger,
  ) {}

  public getVotes = async (edition: string) => {
    const { id } = this.ctx.profile
    const votes = await this.vbase.getJSON<UserVotes>(Votes.getBucket(edition), Votes.getUserFile(id), true) || {}
    return votes
  }

  public setVote = async (edition: string, projectID: string, vote: Vote) => {
    const { id } = this.ctx.profile
    const votes = await this.getVotes(edition)
    votes[projectID] = vote
    await this.vbase.saveJSON<UserVotes>(Votes.getBucket(edition), Votes.getUserFile(id), votes)
    return vote
  }
}
