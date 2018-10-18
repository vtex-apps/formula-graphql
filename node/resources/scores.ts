import {Logger, VBase} from '@vtex/api'
import {compose, equals, findIndex, head, keysIn, last, map, mapObjIndexed, mergeWith, reduce, slice, sort, sum, toPairs, values} from 'ramda'

import Votes, {UserVotes} from './votes'

const SCORE_RECEIVING_PROJECTS = 3

interface ScoresByProject {
  [projectID: string]: number
}

export interface ScoreData {
  projectID: string
  score: number
}

export default class Score {
  private static file = 'scores.json'
  private static getBucket = (edition: string) => `${edition}-score`

  private static calculateUserScore(votes: UserVotes): ScoresByProject {
    const summedVotes = mapObjIndexed(compose(sum,values), votes)
    const favouriteProjects = slice(0, SCORE_RECEIVING_PROJECTS, sort((a,b) => summedVotes[a] - summedVotes[b], keysIn(summedVotes)))
    return mapObjIndexed((_, projectID) => {
      const position = findIndex(equals(projectID), favouriteProjects)
      return position === -1 ? 0 : SCORE_RECEIVING_PROJECTS + position
    }, votes)
  }

  constructor (
    public ctx: ResolverContext,
    public vbase: VBase,
    public logger: Logger,
  ) {}

  public updateScores = async (edition: string): Promise<ScoreData[]> => {
    const voteFiles = await this.vbase.listFiles(Votes.getBucket(edition))
    const votes = await Promise.all(map(
      voteFile => this.vbase.getJSON<UserVotes>(Votes.getBucket(edition), voteFile.path, true) || {},
      voteFiles.data
    ))
    const scoresByUser = map(Score.calculateUserScore, votes)
    const scores: ScoresByProject = reduce(mergeWith((a,b) => a+b), {}, scoresByUser)
    const scoreData = values(mapObjIndexed((score, projectID) => ({score,projectID}), scores))
    await this.vbase.saveJSON(Score.getBucket(edition), Score.file, scoreData)
    return scoreData
  }
}
