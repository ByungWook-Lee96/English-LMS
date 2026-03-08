import { Router } from 'express'
import express from 'express'
import { authenticate } from '../middlewares/authenticate.js'
import { authorize } from '../middlewares/authorize.js'
import { 
  getStudents, 
  getStudentById, 
  createStudent, 
  updateStudent,
  addMemo,
  addSessions
} from '../controllers/studentController.js'

const router = Router()

router.use(authenticate)

router.get('/', getStudents)
router.post('/', createStudent)
router.get('/:id', getStudentById)
router.patch('/:id', updateStudent)
router.post('/:id/memos', addMemo)
router.post('/:id/sessions', addSessions)

export default router
