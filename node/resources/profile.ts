import {HttpClient, LRUCache, ServiceContext} from '@vtex/api'

import {AuthenticationError, NotVTEXUserError} from '../errors'

const FIVE_MIN_MS = 5 * 60 * 1000
const VTEX_ID_COOKIE = 'VtexIdclientAutCookie'
const VTEX_EMAIL_REGEX = /\@vtex\.com(\.br)?$/

const profileCache = new LRUCache<string, any>({
  max: 2000,
  maxAge: FIVE_MIN_MS,
  stale: true,
})

metrics.trackCache('profile', profileCache)

export default class Profile {
  private http: HttpClient
  private vtexIdToken: string
  private headers: Record<string, string>
  private path: string

  public constructor(ctx: ServiceContext) {
    this.http = new HttpClient({
      metrics,
      userAgent: process.env.VTEX_APP_ID,
    })

    this.vtexIdToken = ctx.cookies.get(VTEX_ID_COOKIE)

    this.path = `http://${ctx.vtex.account}.vtexcommercestable.com.br/api/license-manager/site/pvt/newtopbar`

    this.headers = {
      'Proxy-Authorization': ctx.vtex.authToken,
      VtexIdclientAutCookie: this.vtexIdToken,
    }
  }

  public getProfile = async () => {
    if (!this.vtexIdToken) {
      throw new AuthenticationError()
    }

    const {profile}: {profile: ProfileData} = await profileCache.getOrSet(this.vtexIdToken, this.fetchProfile)

    if (!profile.email || !VTEX_EMAIL_REGEX.test(profile.email)) {
      throw new NotVTEXUserError()
    }

    return profile
  }

  private fetchProfile = () => this.http.get(this.path, {headers: this.headers})
}
