import {Project} from '../resources/projects'

interface ProjectArgs {
  edition: string
  id: string
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

async function updateProject(_: any, {edition, id}: ProjectArgs, ctx: ResolverContext): Promise<Project> {
  return ctx.resources.projects.update(edition, id, {})
}

async function deleteProject(_: any, {edition, id}: ProjectArgs, ctx: ResolverContext): Promise<void> {
  return ctx.resources.projects.delete(edition, id)
}

export const projectsMutations = {
  deleteProject,
  updateProject,
}

export const projectsQueries = {
  project,
  projects,
}
