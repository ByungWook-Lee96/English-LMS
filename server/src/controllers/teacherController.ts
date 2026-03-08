import type { Response } from 'express'
import express from 'express'
import type { AuthRequest } from '../middlewares/authenticate.js'
import { TeacherService } from '../services/teacherService.js'

export const getTeachers = async (req: AuthRequest, res: Response) => {
  try {
    const teachers = await TeacherService.getAll()
    res.json({ success: true, data: teachers })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getTeacherById = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id)
    
    // MASTER can see everything. 
    // TEACHER can only see if req.user.teacherId matches the requested ID.
    const isMaster = req.user?.role === 'MASTER';
    const isSelf = req.user?.teacherId === id;

    if (!isMaster && !isSelf) {
      return res.status(403).json({ success: false, message: 'Forbidden: Access denied to this profile' })
    }

    const teacher = await TeacherService.getById(id)
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' })
    res.json({ success: true, data: teacher })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const createTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const teacher = await TeacherService.create(req.body)
    res.json({ success: true, data: teacher })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}
