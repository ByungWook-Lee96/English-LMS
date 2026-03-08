import api from '../lib/axios'

export const getSchedules = async (params: { teacherId?: number; studentId?: number } = {}) => {
  const { data } = await api.get('/schedules', { params })
  return data.data
}

export const createSchedule = async (scheduleData: any) => {
  const { data } = await api.post('/schedules', scheduleData)
  return data.data
}

export const updateScheduleStatus = async (id: number, status: string, note?: string, dateTime?: string) => {
  const { data } = await api.patch(`/schedules/${id}`, { status, note, dateTime })
  return data.data
}

export const deleteSchedule = async (id: number) => {
  const { data } = await api.delete(`/schedules/${id}`)
  return data.data
}
