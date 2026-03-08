import { Router } from 'express'
import express from 'express'
import { authenticate } from '../middlewares/authenticate.js'
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from '../controllers/scheduleController.js'

const router = Router()

router.use(authenticate)

router.get('/', getSchedules)
router.post('/', createSchedule)
router.patch('/:id', updateSchedule)
router.delete('/:id', deleteSchedule)


export default router
