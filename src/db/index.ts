import { createDatabase } from 'monarch-orm'
import { client } from './config'
import { Wrapped } from '../modules/wrapped/wrapped.schema'

export const { db, collections } = createDatabase(client.db(), {
  wrapped: Wrapped,
})

