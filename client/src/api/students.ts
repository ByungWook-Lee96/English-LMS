import api from '../lib/axios'

export const getStudents = async () => {
  const { data } = await api.get('/students')
  return data.data
}

export const getStudentById = async (id: number) => {
  const { data } = await api.get(`/students/${id}`)
  return data.data
}

export const createStudent = async (studentData: any) => {
  const { data } = await api.post('/students', studentData)
  return data.data
}

export const updateStudent = async (id: number, studentData: any) => {
  const { data } = await api.patch(`/students/${id}`, studentData)
  return data.data
}

export const addMemo = async (id: number, content: string) => {
  const { data } = await api.post(`/students/${id}/memos`, { content })
  return data.data
}

export const addSessions = async (id: number, count: number) => {
  const { data } = await api.post(`/students/${id}/sessions`, { count })
  return data.data
}
