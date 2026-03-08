import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate.js'
import { authorize } from '../middlewares/authorize.js'
import { getTeachers, getTeacherById, createTeacher } from '../controllers/teacherController.js'

const router = Router()

router.use(authenticate)

// List and Create are MASTER only
router.get('/', authorize('MASTER'), getTeachers)
router.post('/', authorize('MASTER'), createTeacher)

// Detail view is available for MASTER or the TEACHER themselves
router.get('/:id', authorize('MASTER', 'TEACHER'), getTeacherById)

export default router
