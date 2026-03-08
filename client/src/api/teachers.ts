import api from '../lib/axios'

export const getTeachers = async () => {
  const { data } = await api.get('/teachers')
  return data.data
}

export const getTeacherById = async (id: number) => {
  const { data } = await api.get(`/teachers/${id}`)
  return data.data
}
