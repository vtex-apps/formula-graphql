import {values} from 'ramda'
import {Vote} from '../resources/votes'

interface VotesArgs {
  edition: string
}

interface UpdateVoteArgs {
  edition: string
  projectID: string
  execution: number
  relevance: number
}

async function votes(_: any, {edition}: VotesArgs, ctx: ResolverContext): Promise<Vote[]> {
  const {votes: votesResource} = ctx.resources
  const userVotes = await votesResource.getVotes(edition)
  return values(userVotes)
}

async function updateVote(_: any, {edition,projectID,execution,relevance}: UpdateVoteArgs, ctx: ResolverContext): Promise<Vote> {
  const {votes: votesResource} = ctx.resources
  const vote = await votesResource.setVote(edition, projectID, {execution,relevance})
  return vote
}

export const votesMutations = {
  updateVote,
}

export const votesQueries = {
  votes,
}
