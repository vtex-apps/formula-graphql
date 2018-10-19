import {map} from 'ramda'
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

async function finalists(_: any, {edition}: ScoresArgs, ctx: ResolverContext): Promise<any[]> {
  const {scores: scoresResource, projects: projectsResource} = ctx.resources
  const scoreData = await scoresResource.getScores(edition)
  const initialCutPosition = Math.min(3, scoreData.length)
  let cutPosition = initialCutPosition
  while (cutPosition < scoreData.length && scoreData[cutPosition].score === scoreData[initialCutPosition-1].score) {
    cutPosition++
  }
  const finalistsData = scoreData.slice(0,cutPosition)
  const finalistsPromises = map(finalist => projectsResource.find(edition, finalist.projectID), finalistsData)
  const finalistProjects = await Promise.all(finalistsPromises)
  return finalistProjects || []
}

export const scoreQueries = {
  finalists,
  scores,
}

export const scoreMutations = {
  updateScores,
}
