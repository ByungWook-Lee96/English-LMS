import type { Request, Response } from 'express'
import express from 'express'
import { AuthService } from '../services/authService.js'
import type { AuthRequest } from '../middlewares/authenticate.js'

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    const result = await AuthService.login(username, password)
    res.json({ success: true, data: result })
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message })
  }
}

export const logout = (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' })
}

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error('Unauthorized')
    const result = await AuthService.getMe(req.user.id)
    res.json({ success: true, data: result })
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message })
  }
}
