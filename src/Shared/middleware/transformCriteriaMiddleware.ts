import { parseQueryParamsToCriteria } from '../utils/query.utils'

export const transformCriteriaMiddleware: IController = (req, res, next) => {
  try {
    if (req?.query) {
      req.query = parseQueryParamsToCriteria(req.query) as any
    }
    next()
  } catch (error: any) {
    console.log('error', error.message)
    throw new Error(error.message)
  }
}
