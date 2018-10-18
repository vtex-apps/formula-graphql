import {ScoreData} from '../resources/scores'

interface ScoresArgs {
  edition: string
}

async function updateScores(_: any, {edition}: ScoresArgs, ctx: ResolverContext): Promise<ScoreData[]> {
  const {scores: scoresResource} = ctx.resources
  const projectScores = await scoresResource.updateScores(edition)
  return projectScores
}

async function scores(_: any, {edition}: ScoresArgs, ctx: ResolverContext): Promise<ScoreData[]> {
  const {scores: scoresResource} = ctx.resources
  const scoreData = await scoresResource.getScores(edition)
  return scoreData
}

export const scoreQueries = {
  scores,
}

export const scoreMutations = {
  updateScores,
}
