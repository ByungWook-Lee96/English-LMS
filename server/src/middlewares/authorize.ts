import type { Response, NextFunction } from 'express'
import express from 'express'
import type { AuthRequest } from './authenticate.js'

export const authorize = (...roles: string[]) =>
        (req: AuthRequest, res: Response, next: NextFunction) => {
          if (!req.user || !roles.includes(req.user.role))
            return res.status(403).json({ success: false, message: 'Forbidden' })
          next()
        }
