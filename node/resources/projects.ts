import {Logger, ServiceContext, VBase} from '@vtex/api'

export interface Project {
  demoURL?: string
  description?: string
  edition: string
  id: string
  name?: string
  owner: string
  team: string[]
}

export interface Edition {
  id: string
  projects: Project[]
}

export default class Projects {
  constructor (
    public ctx: ServiceContext,
    public vbase: VBase,
    public logger: Logger,
  ) {}

  public find = async (edition: string, id: string): Promise<Project> => {
    return {edition, id, team: [], owner: ''}
  }

  public list = async (edition: string): Promise<Project[]> => {
    return [{edition, id: '1', team: [], owner: ''}]
  }

  public update = async (edition: string, id: string, changes: any) => {
    await this.logger.info({edition, id, changes, user: this.ctx.headers['X-Vtex-Original-Caller']})
    return {edition, id, team: [], owner: ''}
  }

  public delete = async (edition: string, id: string) => {
    return
  }
}
