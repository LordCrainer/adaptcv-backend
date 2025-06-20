import { NextFunction, Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Roles } from '@src/api/Roles/roles'
import {
  basePermissionRules,
  checkPermissions,
  PermissionParams,
  superAdminPermissionRules
} from '@src/middleware/permissions.middleware'

// Mock de Roles
vi.mock('@src/api/Roles/roles', () => ({
  Roles: {
    isSuperAdmin: vi.fn(),
    isUser: vi.fn()
  }
}))

describe('Permissions Middleware', () => {
  let mockReq: Partial<RequestExtended>
  let mockRes: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    vi.clearAllMocks()
    mockReq = {}
    mockRes = {}
    mockNext = vi.fn()
  })

  describe('superAdminPermissionRules', () => {
    it('should return true for SuperAdmin', () => {
      const params: PermissionParams = {
        requestUser: { currentRole: 50 } as any
      }
      ;(Roles.isSuperAdmin as any).mockReturnValue(true)

      const result = superAdminPermissionRules(params)

      expect(result).toBe(true)
      expect(Roles.isSuperAdmin).toHaveBeenCalledWith(50)
    })

    it('should return false for regular user', () => {
      const params: PermissionParams = {
        requestUser: { currentRole: 10 } as any
      }
      ;(Roles.isSuperAdmin as any).mockReturnValue(false)

      const result = superAdminPermissionRules(params)

      expect(result).toBe(false)
      expect(Roles.isSuperAdmin).toHaveBeenCalledWith(10)
    })
  })

  describe('basePermissionRules', () => {
    it('should return true for SuperAdmin', () => {
      const params: PermissionParams = {
        requestUser: { currentRole: 50 } as any
      }
      ;(Roles.isSuperAdmin as any).mockReturnValue(true)
      ;(Roles.isUser as any).mockReturnValue(false)

      const result = basePermissionRules(params)

      expect(result).toBe(true)
    })

    it('should return true for regular User', () => {
      const params: PermissionParams = {
        requestUser: { currentRole: 10 } as any
      }
      ;(Roles.isSuperAdmin as any).mockReturnValue(false)
      ;(Roles.isUser as any).mockReturnValue(true)

      const result = basePermissionRules(params)

      expect(result).toBe(true)
    })

    it('should return false for unauthorized role', () => {
      const params: PermissionParams = {
        requestUser: { currentRole: 5 } as any
      }
      ;(Roles.isSuperAdmin as any).mockReturnValue(false)
      ;(Roles.isUser as any).mockReturnValue(false)

      const result = basePermissionRules(params)

      expect(result).toBe(false)
    })
  })

  describe('checkPermissions middleware', () => {
    it('should call next() when permission is granted', async () => {
      const mockPermissionRule = vi.fn().mockReturnValue(true)
      const middleware = checkPermissions(mockPermissionRule, 'params')

      mockReq.requestUser = { currentRole: 10, _id: 'user123' } as any
      mockReq.params = { builderId: 'builder123' }

      await middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(mockPermissionRule).toHaveBeenCalledWith({
        requestUser: mockReq.requestUser,
        resource: mockReq.params
      })
      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should throw forbidden error when permission is denied', async () => {
      const mockPermissionRule = vi.fn().mockReturnValue(false)
      const middleware = checkPermissions(mockPermissionRule, 'params')

      mockReq.requestUser = { currentRole: 10, _id: 'user123' } as any
      mockReq.params = { builderId: 'builder123' }

      await middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'forbidden',
          message: 'You do not have permission to perform this action'
        })
      )
    })

    it('should throw unauthorized error when no user role', async () => {
      const mockPermissionRule = vi.fn()
      const middleware = checkPermissions(mockPermissionRule, 'params')

      mockReq.requestUser = {} as any

      await middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'unauthorized',
          message: 'Authentication required'
        })
      )
      expect(mockPermissionRule).not.toHaveBeenCalled()
    })

    it('should pass resource from params, body, and query', async () => {
      const mockPermissionRule = vi.fn().mockReturnValue(true)
      const middleware = checkPermissions(mockPermissionRule, 'params')

      mockReq.requestUser = { currentRole: 10, _id: 'user123' } as any
      mockReq.params = { builderId: 'builder123' }
      mockReq.body = { name: 'Test Builder' }
      mockReq.query = { filter: 'active' }

      await middleware(mockReq as Request, mockRes as Response, mockNext)

      // Debería usar params primero
      expect(mockPermissionRule).toHaveBeenCalledWith({
        requestUser: mockReq.requestUser,
        resource: mockReq.params
      })
    })
  })
})
