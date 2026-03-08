import prisma from '../lib/prisma.js'
import { StudentService } from './studentService.js'

export class ScheduleService {
  static async getAll(params: { teacherId?: number; studentId?: number; month?: string }) {
    const where: any = {}
    if (params.teacherId) where.teacherId = params.teacherId
    if (params.studentId) where.studentId = params.studentId
    
    return prisma.schedule.findMany({
      where,
      include: {
        student: true,
        teacher: true
      },
      orderBy: { dateTime: 'asc' }
    })
  }

  static async create(data: any) {
    const schedule = await prisma.schedule.create({
      data: {
        studentId: data.studentId,
        teacherId: data.teacherId,
        dateTime: new Date(data.dateTime),
        status: data.status || 'PENDING',
        note: data.note,
        isManual: true // Manually created ones are marked as manual
      }
    })

    // After manual creation, sync will trim fluid ones at the end if needed
    await StudentService.syncSchedules(data.studentId)

    return schedule
  }

  static async update(id: number, data: { status?: string; note?: string; dateTime?: string }) {
    const updateData: any = {}
    if (data.status) updateData.status = data.status as any
    if (data.note !== undefined) updateData.note = data.note
    if (data.dateTime) {
      updateData.dateTime = new Date(data.dateTime)
      updateData.isManual = true // If rescheduled, treat as manual/fixed
    }

    const schedule = await prisma.schedule.update({
      where: { id },
      data: updateData,
      include: { student: true, teacher: true }
    })

    await StudentService.syncSchedules(schedule.studentId)
    
    return schedule
  }

  static async delete(id: number) {
    const schedule = await prisma.schedule.findUnique({
      where: { id }
    })

    if (!schedule) throw new Error('Schedule not found')

    const studentId = schedule.studentId
    await prisma.schedule.delete({ where: { id } })

    await StudentService.syncSchedules(studentId)

    return { success: true }
  }
}
