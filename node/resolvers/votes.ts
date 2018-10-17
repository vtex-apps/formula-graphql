import {mapObjIndexed,values} from 'ramda'

export interface Vote {
  execution: number
  relevance: number
  projectID: string
  userID: string
}

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
  const {profile: {id}, resources: {votes: votesResource} } = ctx
  const userVotes = await votesResource.getVotes(edition)
  return values(mapObjIndexed((vote,projectID) => ({...vote,projectID,userID:id}), userVotes))
}

async function updateVote(_: any, {edition,projectID,execution,relevance}: UpdateVoteArgs, ctx: ResolverContext): Promise<Vote> {
  const {profile: {id}, resources: {votes: votesResource} } = ctx
  const vote = await votesResource.setVote(edition, projectID, {execution,relevance})
  return {...vote,projectID,userID:id}
}

export const votesMutations = {
  updateVote,
}

export const votesQueries = {
  votes,
}
