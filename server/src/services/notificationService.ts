import nodemailer from 'nodemailer'

export class NotificationService {
  private static transporter = nodemailer.createTransport({
    service: 'gmail', // Or other service
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  })

  static async sendScheduleChangeAlert(schedule: any) {
    const { student, teacher, dateTime, status } = schedule
    const masterEmail = process.env.MASTER_EMAIL

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: masterEmail,
      subject: `[LMS Alert] Attendance Changed - ${student.nameKo}`,
      text: `
        The attendance status for a class has been updated.
        
        Teacher: ${teacher.name}
        Student: ${student.nameKo} (${student.nameEn})
        Date/Time: ${new Date(dateTime).toLocaleString()}
        New Status: ${status}
      `
    }

    try {
      await this.transporter.sendMail(mailOptions)
      console.log('Notification email sent to Master')
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }
}
