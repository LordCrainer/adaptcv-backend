import { MongoStrategy } from "./mongo"
import { MongoMemoryServerStrategy } from "./mongodb-memory-server"

export interface BaseDb {
  connect(path: string): Promise<void>
  clear(): Promise<void>
  disconnect(): Promise<void>
}

export const dbStrategy = {
  mongo: new MongoStrategy(),
  mongoMemory: new MongoMemoryServerStrategy()
}