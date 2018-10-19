enum FormulaStatus {
  REGISTRATION = 'REGISTRATION',
  RUNNING = 'RUNNING',
  VOTING = 'VOTING',
  RESULTS = 'RESULTS',
}

interface FormulaInfo {
  status: FormulaStatus
  timeRemainingSeconds: number
  timeTotalSeconds: number
}

const editions = {
 '2018.10': {
   startDate: new Date('2018-10-18T12:00:00.000Z'),
   timeTotalSeconds: 32 * 60 * 60,
 }
}

const VOTING_PERIOD = 2 * 60 * 60 * 1000

async function info(_: any, {edition}: any, ctx: any): Promise<FormulaInfo> {
  const {startDate, timeTotalSeconds} = editions[edition]
  const {resources: {scores: scoresResource}} = ctx

  const scores = await scoresResource.getScores(edition)
  console.log('scores', scores)

  const nowMillis = (new Date()).getTime()
  const startDateMillis = startDate.getTime()
  const finishDateMillis = startDateMillis + timeTotalSeconds * 1000

  const status = nowMillis < startDateMillis
    ? FormulaStatus.REGISTRATION
    : nowMillis < finishDateMillis
      ? FormulaStatus.RUNNING
      : scores.length === 0
        ? FormulaStatus.VOTING
        : FormulaStatus.RESULTS

  const timeRemainingMillis = status === FormulaStatus.REGISTRATION
    ? startDateMillis - nowMillis
    : status === FormulaStatus.RUNNING
      ? finishDateMillis - nowMillis
      : 0

  return {
    status,
    timeRemainingSeconds: Math.round(timeRemainingMillis / 1000),
    timeTotalSeconds,
  }
}

export const infoQueries = {
  info,
}
