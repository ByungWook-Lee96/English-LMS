import prisma from '../lib/prisma.js'

export class StudentService {
  static async getAll(teacherId?: number) {
    if (teacherId) {
      return prisma.student.findMany({
        where: { teacherId },
        include: { memos: true },
        orderBy: { createdAt: 'desc' }
      })
    }
    return prisma.student.findMany({
      include: { 
        teacher: true,
        memos: true 
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async getById(id: number) {
    return prisma.student.findUnique({
      where: { id },
      include: { 
        memos: { orderBy: { date: 'desc' } },
        teacher: true,
        schedules: { orderBy: { dateTime: 'desc' }, take: 100 }
      }
    })
  }

  static async create(data: any, teacherId?: number) {
    const student = await prisma.student.create({
      data: {
        nameKo: data.nameKo,
        nameEn: data.nameEn,
        phone: data.phone,
        age: data.age ? Number(data.age) : null,
        studyGoal: data.studyGoal,
        textbook: data.textbook,
        extraInfo: data.extraInfo,
        totalSessions: data.totalSessions ? Number(data.totalSessions) : 0,
        classDays: data.classDays,
        classTime: data.classTime,
        teacherId: teacherId || (data.teacherId ? Number(data.teacherId) : null)
      }
    })

    if (student.classDays && student.classTime && student.teacherId && student.totalSessions > 0) {
      await this.syncSchedules(student.id)
    }

    return student
  }

  static async update(id: number, data: any) {
    let teacherIdValue = undefined;
    if (data.teacherId !== undefined) {
      teacherIdValue = (data.teacherId === '' || data.teacherId === null) ? null : Number(data.teacherId);
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        nameKo: data.nameKo,
        nameEn: data.nameEn,
        phone: data.phone,
        age: data.age !== undefined ? (data.age === '' ? null : Number(data.age)) : undefined,
        studyGoal: data.studyGoal,
        textbook: data.textbook,
        extraInfo: data.extraInfo,
        totalSessions: data.totalSessions !== undefined ? Number(data.totalSessions) : undefined,
        classDays: data.classDays,
        classTime: data.classTime,
        teacherId: teacherIdValue,
      }
    })

    if (student.classDays && student.classTime && student.teacherId) {
      await this.syncSchedules(student.id)
    }

    return student
  }

  static async addSessions(studentId: number, count: number) {
    const student = await prisma.student.update({
      where: { id: studentId },
      data: { totalSessions: { increment: count } }
    })

    if (student.classDays && student.classTime && student.teacherId) {
      await this.syncSchedules(student.id)
    }
    return student
  }

  /**
   * PROTECTIVE SYNC: Ensures Schedule count matches totalSessions.
   * Manually created or modified sessions are NEVER deleted.
   */
  static async syncSchedules(studentId: number) {
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!student || !student.classDays || !student.classTime || !student.teacherId) return

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // 1. Count "Fixed" sessions:
    // - Any session in the past
    // - Any session marked as isManual: true
    // - Any session where status was changed from PENDING
    // - Any session with a note
    const fixedSchedulesCount = await prisma.schedule.count({
      where: { 
        studentId,
        OR: [
          { dateTime: { lt: todayStart } },
          { isManual: true },
          { status: { not: 'PENDING' } },
          { note: { not: null } },
          { note: { not: '' } }
        ]
      }
    })

    const totalAllowed = student.totalSessions
    const remainingToSchedule = totalAllowed - fixedSchedulesCount
    
    // 2. Clear ONLY "Fluid" schedules (Today/Future, not manual, PENDING, no note)
    await prisma.schedule.deleteMany({
      where: { 
        studentId, 
        dateTime: { gte: todayStart },
        isManual: false,
        status: 'PENDING',
        OR: [
          { note: null },
          { note: '' }
        ]
      }
    })

    if (remainingToSchedule <= 0) return

    // 3. Rebuild from the latest session date
    const lastSession = await prisma.schedule.findFirst({
      where: { studentId },
      orderBy: { dateTime: 'desc' }
    })

    const dayMap: { [key: string]: number } = { 'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6 }
    const targetDays = student.classDays.split(',').map(d => dayMap[d.trim().toUpperCase()]).filter(d => d !== undefined)
    const [hours, minutes] = student.classTime.split(':').map(Number)

    const newSchedules = []
    let found = 0
    let dayOffset = 1
    
    const startPoint = lastSession ? new Date(lastSession.dateTime) : todayStart

    while (found < remainingToSchedule) {
      const nextDate = new Date(startPoint)
      nextDate.setDate(startPoint.getDate() + dayOffset)
      
      if (targetDays.includes(nextDate.getDay())) {
        nextDate.setHours(hours || 0, minutes || 0, 0, 0)
        
        // Final sanity check against today
        if (nextDate >= todayStart) {
          const exists = await prisma.schedule.findFirst({
            where: { studentId, dateTime: nextDate }
          })

          if (!exists) {
            newSchedules.push({
              studentId,
              teacherId: student.teacherId,
              dateTime: nextDate,
              status: 'PENDING' as any,
              isManual: false // System generated
            })
            found++
          }
        }
      }
      dayOffset++
      if (dayOffset > 1000) break
    }

    if (newSchedules.length > 0) {
      await prisma.schedule.createMany({ data: newSchedules })
    }
  }

  static async addMemo(studentId: number, content: string, date?: string) {
    return prisma.memo.create({
      data: { studentId, content, date: date ? new Date(date) : new Date() }
    })
  }
}
