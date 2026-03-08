import type { Response } from 'express'
import express from 'express'
import type { AuthRequest } from '../middlewares/authenticate.js'
import { ScheduleService } from '../services/scheduleService.js'
import { NotificationService } from '../services/notificationService.js'

export const getSchedules = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.role === 'TEACHER' ? req.user.teacherId : (req.query.teacherId ? Number(req.query.teacherId) : undefined)
    
    const queryParams: any = {}
    if (teacherId !== undefined) queryParams.teacherId = teacherId
    if (req.query.studentId !== undefined) queryParams.studentId = Number(req.query.studentId)
    
    const schedules = await ScheduleService.getAll(queryParams)
    res.json({ success: true, data: schedules })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const createSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.role === 'TEACHER' ? req.user.teacherId : req.body.teacherId
    if (!teacherId) return res.status(400).json({ success: false, message: 'Teacher ID is required' })
    
    const schedule = await ScheduleService.create({ ...req.body, teacherId })
    res.json({ success: true, data: schedule })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const schedule = await ScheduleService.update(Number(req.params.id), req.body)
    
    // Notification logic
    NotificationService.sendScheduleChangeAlert(schedule)
    
    res.json({ success: true, data: schedule })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const deleteSchedule = async (req: AuthRequest, res: Response) => {
  try {
    await ScheduleService.delete(Number(req.params.id))
    res.json({ success: true, message: 'Schedule deleted' })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}
