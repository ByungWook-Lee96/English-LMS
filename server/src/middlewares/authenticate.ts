import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: { id: number; role: string; teacherId?: number | null }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' })
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    req.user = {
      id: decoded.id,
      role: decoded.role,
      teacherId: decoded.teacherId || null
    }
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
}
