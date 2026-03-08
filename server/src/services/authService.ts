import prisma from '../lib/prisma.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export class AuthService {
  static async login(username: string, pass: string) {
    console.log(`Login attempt for: ${username}`)
    
    const user = await prisma.user.findUnique({
      where: { username: username },
      include: { teacher: true }
    })

    if (!user) {
      console.error(`Login failed: User ${username} not found`)
      throw new Error('User not found')
    }

    const isMatch = await bcrypt.compare(pass, user.password)
    if (!isMatch) {
      console.error(`Login failed: Invalid password for ${username}`)
      throw new Error('Invalid credentials')
    }

    const teacherId = user.teacher?.id || null;

    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        teacherId: teacherId 
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    )

    const { password, ...userData } = user
    return { 
      token, 
      user: {
        ...userData,
        teacherId: teacherId
      }
    }
  }

  static async getMe(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { teacher: true }
    })
    if (!user) throw new Error('User not found')
    
    const { password, ...userData } = user
    return {
      ...userData,
      teacherId: user.teacher?.id || null
    }
  }
}
