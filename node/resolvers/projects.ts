import {concat, difference, uniq} from 'ramda'

import {Project} from '../resources/projects'

interface ProjectArgs {
  edition: string
  id?: string
  demoURL?: string
  description?: string
  name?: string
}

interface ProjectsArgs {
  edition: string
}

async function project(_: any, {edition, id}: ProjectArgs, ctx: ResolverContext): Promise<Project> {
  return ctx.resources.projects.find(edition, id)
}

async function projects(_: any, {edition}: ProjectsArgs, ctx: ResolverContext): Promise<Project[]> {
  return ctx.resources.projects.list(edition)
}

async function updateProject(_: any, {edition, id, demoURL, description, name}: ProjectArgs, ctx: ResolverContext): Promise<Project> {
  if (!id) {
    return ctx.resources.projects.update(edition, id, {demoURL, description, name})
  }

  const saved = await ctx.resources.projects.find(edition, id)

  const updated = {
    ...saved,
    demoURL,
    description,
    edition,
    id,
    name,
  }

  await ctx.resources.projects.update(edition, id, updated)

  return updated
}

async function deleteProject(_: any, {edition, id}: ProjectArgs, ctx: ResolverContext): Promise<boolean> {
  return ctx.resources.projects.delete(edition, id)
}

async function joinProject(_: any, {edition, id}: ProjectArgs, ctx: ResolverContext): Promise<Project> {
  const email = ctx.profile.email
  const saved = await ctx.resources.projects.find(edition, id)

  const updated = {
    ...saved,
    team: uniq(concat([email], saved.team)),
  }

  return ctx.resources.projects.update(edition, id, updated)
}

async function leaveProject(_: any, {edition, id}: ProjectArgs, ctx: ResolverContext): Promise<Project> {
  const email = ctx.profile.email
  const saved = await ctx.resources.projects.find(edition, id)

  const updated = {
    ...saved,
    team: difference(saved.team, [email]),
  }

  return ctx.resources.projects.update(edition, id, updated)
}

export const projectsMutations = {
  deleteProject,
  joinProject,
  leaveProject,
  updateProject,
}

export const projectsQueries = {
  project,
  projects,
}
