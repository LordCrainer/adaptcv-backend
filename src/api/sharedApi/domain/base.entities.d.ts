export interface BaseEntity {
  id: string
  createAt: Date
  updateAt: Date
  deleteAt?: Date | null
}
