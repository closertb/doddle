export class UndefinedFactError extends Error {
  public code: string;
  constructor (...props) {
    super(...props)
    this.code = 'UNDEFINED_FACT'
  }
}
