import {mapObjIndexed, values} from 'ramda'

interface ScoresArgs {
  edition: string
}

interface Score {
  projectID: string
  score: number
}

async function scores(_: any, {edition}: ScoresArgs, ctx: ResolverContext): Promise<Score[]> {
  const {scores: scoresResource} = ctx.resources
  const projectScores = await scoresResource.getScores(edition)
  return values(mapObjIndexed(
    (score, projectID) => ({score, projectID}),
    projectScores
  ))
}

export const scoreQueries = {
  scores,
}
