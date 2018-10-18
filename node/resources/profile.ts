import {HttpClient, LRUCache, ServiceContext} from '@vtex/api'

import {AuthenticationError, NotVTEXUserError} from '../errors'

interface VtexIdUser {
  userId: string
  user: string
  userType: string
}

const FIVE_MIN_MS = 5 * 60 * 1000
const VTEX_ID_COOKIE = 'VtexIdclientAutCookie'
const VTEX_EMAIL_REGEX = /\@vtex\.com(\.br)?$/

const profileCache = new LRUCache<string, any>({
  max: 2000,
  maxAge: FIVE_MIN_MS,
  stale: true,
})

metrics.trackCache('profile', profileCache)

const capitalizeFirstLetter = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const emailToName = (email: string) => {
  const [user] = email.split('@')
  const maybeWords = user.split('.')
  return maybeWords.map(capitalizeFirstLetter).join(' ')
}

export default class Profile {
  private http: HttpClient
  private vtexIdToken: string
  private headers: Record<string, string>
  private topbarPath: string
  private vtexIdPath: string

  public constructor(ctx: ServiceContext) {
    this.http = new HttpClient({
      metrics,
      userAgent: process.env.VTEX_APP_ID,
    })

    this.vtexIdToken = ctx.cookies.get(VTEX_ID_COOKIE)

    this.topbarPath = `http://${ctx.vtex.account}.vtexcommercestable.com.br/api/license-manager/site/pvt/newtopbar`
    this.vtexIdPath = `http://vtexid.vtex.com.br/api/vtexid/pub/authenticated/user?authToken=${this.vtexIdToken}`

    this.headers = {
      'Proxy-Authorization': ctx.vtex.authToken,
      VtexIdclientAutCookie: this.vtexIdToken,
    }
  }

  public getProfile = async () => {
    if (!this.vtexIdToken) {
      throw new AuthenticationError()
    }

    let profile

    const topbarResponse: {profile: ProfileData} = await profileCache.getOrSet(this.vtexIdToken, this.fetchProfile)

    profile = topbarResponse.profile

    if (!profile) {
      profile = await this.fetchFallbackProfile()
      profileCache.set(this.vtexIdToken, {profile})
    }

    if (!profile || !profile.email || !VTEX_EMAIL_REGEX.test(profile.email)) {
      throw new NotVTEXUserError()
    }

    return profile
  }

  private fetchProfile = () => this.http.get(this.topbarPath, {headers: this.headers})

  private fetchFallbackProfile = () =>
    this.http.get(this.vtexIdPath, {headers: {'Proxy-Authorization': this.headers['Proxy-Authorization']}})
    .then((vtexIdUser: VtexIdUser) => ({
      email: vtexIdUser.user,
      id: vtexIdUser.userId.replace(/\-/g, '').toLowerCase(),
      name: emailToName(vtexIdUser.user),
      picture: null,
    }))
    .catch((e) => {
      console.error(e)
      return null
    })
}
