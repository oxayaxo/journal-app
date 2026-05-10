export function getJSTDate(): Date {
  const now = new Date()
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return jst
}

export function getJSTDateString(): string {
  return getJSTDate().toISOString().split('T')[0]
}
