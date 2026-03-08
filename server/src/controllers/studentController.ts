import type { Response } from 'express'
import express from 'express'
import type { AuthRequest } from '../middlewares/authenticate.js'
import { StudentService } from '../services/studentService.js'

export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.role === 'TEACHER' ? (req.user.teacherId ?? undefined) : undefined
    const students = await StudentService.getAll(teacherId)
    res.json({ success: true, data: students })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getStudentById = async (req: AuthRequest, res: Response) => {
  try {
    const student = await StudentService.getById(Number(req.params.id))
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' })
    res.json({ success: true, data: student })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.role === 'TEACHER' ? (req.user.teacherId ?? undefined) : undefined
    const student = await StudentService.create(req.body, teacherId)
    res.json({ success: true, data: student })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const student = await StudentService.update(Number(req.params.id), req.body)
    res.json({ success: true, data: student })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const addMemo = async (req: AuthRequest, res: Response) => {
  try {
    const memo = await StudentService.addMemo(Number(req.params.id), req.body.content, req.body.date)
    res.json({ success: true, data: memo })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const addSessions = async (req: AuthRequest, res: Response) => {
  try {
    const student = await StudentService.addSessions(Number(req.params.id), Number(req.body.count))
    res.json({ success: true, data: student })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}
