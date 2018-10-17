import {Logger, VBase} from '@vtex/api'
import {compose, difference, head, keysIn, lensProp, map, mapObjIndexed, mergeWith, min, range, reduce, set, sum, values} from 'ramda'

import Votes, {UserVotes} from './votes'

export interface ScoresByProject {
  [projectID: string]: number
}

export default class Score {
  private static calculateUserScore(votes: UserVotes): ScoresByProject {
    const summedCriteria = mapObjIndexed(compose(sum,values), votes)
    let availableKeys: string[] = keysIn(votes)
    const bestElements = map(
      _ => {
        const best = reduce((a,b) => summedCriteria[a] > summedCriteria[b] ? a : b, head(availableKeys), availableKeys)
        availableKeys = difference(availableKeys, [best])
        return best
      },
      range(0,min(availableKeys.length,3))
    )
    return reduce((result, current) => set(lensProp(current), 3-keysIn(result).length, result), {}, bestElements)
  }

  constructor (
    public ctx: ResolverContext,
    public vbase: VBase,
    public logger: Logger,
  ) {}

  public getScores = async (edition: string): Promise<ScoresByProject> => {
    const voteFiles = await this.vbase.listFiles(Votes.getBucket(edition))
    const votes = await Promise.all(map(
      voteFile => this.vbase.getJSON<UserVotes>(Votes.getBucket(edition), voteFile.path, true) || {},
      voteFiles.data
    ))
    const scoresByUser = map(Score.calculateUserScore, votes)
    return reduce(mergeWith((a,b) => a+b), {}, scoresByUser)
  }
}
