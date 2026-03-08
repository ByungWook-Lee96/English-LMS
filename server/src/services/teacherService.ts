import prisma from '../lib/prisma.js'
import * as bcrypt from 'bcrypt'

export class TeacherService {
  static async getAll() {
    return prisma.teacher.findMany({
      include: {
        user: {
          select: {
            username: true,
            role: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            students: true,
            schedules: true
          }
        }
      }
    })
  }

  static async getById(id: number) {
    return prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        students: true,
        schedules: {
          include: {
            student: true
          },
          orderBy: { dateTime: 'desc' },
          take: 20
        }
      }
    })
  }

  static async create(data: { username: string; password: string; name: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10)
    
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: data.username,
          password: hashedPassword,
          role: 'TEACHER'
        }
      })

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          name: data.name
        }
      })

      return teacher
    })
  }
}
