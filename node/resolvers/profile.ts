function profile(_: any, __: any, ctx: ResolverContext): ProfileData {
  return ctx.profile
}

export const profileQueries = {
  profile,
}
