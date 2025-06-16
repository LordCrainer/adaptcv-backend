import { NextFunction, Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { builderAccess } from '@src/api/Builders/permissions/builders.access'

describe('Builder Access Configuration', () => {
  let mockReq: Partial<RequestExtended>
  let mockRes: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockReq = {}
    mockRes = {}
    mockNext = vi.fn()
  })

  describe('create action', () => {
    it('should allow SuperAdmin to create builders', async () => {
      mockReq.requestUser = { currentRole: 50, _id: 'superadmin123' } as any

      await builderAccess.create(
        mockReq as Request,
        mockRes as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should allow regular User to create builders', async () => {
      mockReq.requestUser = { currentRole: 10, _id: 'user123' } as any

      await builderAccess.create(
        mockReq as Request,
        mockRes as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should deny access to unauthorized roles', async () => {
      mockReq.requestUser = { currentRole: 5, _id: 'guest123' } as any

      await builderAccess.create(
        mockReq as Request,
        mockRes as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'forbidden'
        })
      )
    })
  })

  describe('get action (with ownership)', () => {
    it('should allow SuperAdmin to get any builder', async () => {
      mockReq.requestUser = { currentRole: 50, _id: 'superadmin123' } as any
      mockReq.params = {
        createdBy: 'differentUser456'
      }

      await builderAccess.get(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should allow user to get their own builder', async () => {
      const userId = 'user123'
      mockReq.requestUser = { currentRole: 10, _id: userId } as any
      mockReq.params = {
        createdBy: userId
      }

      await builderAccess.get(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
    })

    it("should deny user access to other user's builder", async () => {
      mockReq.requestUser = { currentRole: 10, _id: 'user123' } as any
      mockReq.params = {
        createdBy: 'differentUser456'
      }

      await builderAccess.get(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'forbidden'
        })
      )
    })
  })

  describe('update action (with ownership)', () => {
    it('should allow SuperAdmin to update any builder', async () => {
      mockReq.requestUser = { currentRole: 50, _id: 'superadmin123' } as any
      mockReq.params = {
        createdBy: 'differentUser456'
      }

      await builderAccess.update(
        mockReq as Request,
        mockRes as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should allow user to update their own builder', async () => {
      const userId = 'user123'
      mockReq.requestUser = { currentRole: 10, _id: userId } as any
      mockReq.params = {
        createdBy: userId
      }

      await builderAccess.update(
        mockReq as Request,
        mockRes as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledWith()
    })

    it("should deny user from updating other user's builder", async () => {
      mockReq.requestUser = { currentRole: 10, _id: 'user123' } as any
      mockReq.params = {
        createdBy: 'differentUser456'
      }

      await builderAccess.update(
        mockReq as Request,
        mockRes as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'forbidden'
        })
      )
    })
  })

  describe('delete action (with ownership)', () => {
    it('should allow SuperAdmin to delete any builder', async () => {
      mockReq.requestUser = { currentRole: 50, _id: 'superadmin123' } as any
      mockReq.params = {
        createdBy: 'differentUser456'
      }

      await builderAccess.delete(
        mockReq as Request,
        mockRes as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should allow user to delete their own builder', async () => {
      const userId = 'user123'
      mockReq.requestUser = { currentRole: 10, _id: userId } as any
      mockReq.params = {
        createdBy: userId
      }

      await builderAccess.delete(
        mockReq as Request,
        mockRes as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledWith()
    })

    it("should deny user from deleting other user's builder", async () => {
      mockReq.requestUser = { currentRole: 10, _id: 'user123' } as any
      mockReq.params = {
        createdBy: 'differentUser456'
      }

      await builderAccess.delete(
        mockReq as Request,
        mockRes as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'forbidden'
        })
      )
    })
  })

  describe('list action (with ownership)', () => {
    it('should allow SuperAdmin to list all builders', async () => {
      mockReq.requestUser = { currentRole: 50, _id: 'superadmin123' } as any
      mockReq.params = {
        createdBy: 'differentUser456'
      }

      await builderAccess.list(
        mockReq as Request,
        mockRes as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should allow user to list their own builders', async () => {
      const userId = 'user123'
      mockReq.requestUser = { currentRole: 10, _id: userId } as any
      mockReq.params = {
        createdBy: userId
      }

      await builderAccess.list(
        mockReq as Request,
        mockRes as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledWith()
    })
  })
})
