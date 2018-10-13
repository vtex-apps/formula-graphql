import {Logger, VBase} from '@vtex/api'
import {ForbiddenError, UserInputError} from 'apollo-server-errors'
import {pluck} from 'ramda'
import uuidv4 from 'uuid/v4'

export interface Project {
  demoURL?: string
  description?: string
  edition?: string
  id?: string
  name?: string
  owner?: string
  team?: string[]
}

export default class Projects {
  constructor (
    public ctx: ResolverContext,
    public vbase: VBase,
    public logger: Logger,
  ) {}

  public find = async (edition: string, id: string): Promise<Project> => {
    const project = await this.vbase.getJSON<Project>(encodeURIComponent(edition), `${id}.json`, true)
    return project
  }

  public list = async (edition: string): Promise<Project[]> => {
    const projectIds = await this.vbase.listFiles(encodeURIComponent(edition))
    const paths = pluck('path', projectIds.data).map(p => p.replace('.json', ''))
    const projects = await Promise.all(paths.map(p => this.find(edition, p)))
    return projects
  }

  public update = async (edition: string, id?: string, project?: Partial<Project>) => {
    const email = this.ctx.profile.email
    await this.logger.info({edition, id, project, action: 'update', email})

    // Create new project
    if (!id) {
      const generated = uuidv4()
      const newProject = {
        ...project,
        edition,
        id: generated,
        owner: email,
        team: [email],
      }

      console.log(edition, generated, newProject)
      await this.vbase.saveJSON(encodeURIComponent(edition), `${generated}.json`, newProject)
      return newProject
    }

    if (!project || !project.owner || !project.id) {
      throw new UserInputError('Project is invalid.')
    }

    await this.vbase.saveJSON(encodeURIComponent(edition), `${id}.json`, project)

    return project
  }

  public delete = async (edition: string, id: string) => {
    const savedProject = await this.find(encodeURIComponent(edition), id)
    const email = this.ctx.profile.email

    if (!savedProject) {
      return
    }

    if (savedProject.owner !== email) {
      throw new ForbiddenError(`Project ${id} is owned by ${savedProject.owner} and cannot be deleted by ${email}`)
    }

    await this.logger.info({edition, id, action: 'delete', email})
    await this.vbase.deleteFile(encodeURIComponent(edition), `${id}.json`)
    return true
  }
}
