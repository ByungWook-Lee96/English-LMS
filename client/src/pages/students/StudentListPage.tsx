import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { getStudents } from '../../api/students'
import { Plus, Search, User } from 'lucide-react'
import { useState } from 'react'

const StudentListPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents
  })

  const filteredStudents = students?.filter((s: any) => 
    s.nameKo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Students</h2>
        <Link 
          to="/students/create" 
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          <Plus size={18} />
          <span>Add Student</span>
        </Link>
      </div>

      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Search students by name..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading students...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudents?.map((student: any) => (
            <Link 
              key={student.id} 
              to={`/students/${student.id}`}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100 block"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{student.nameKo} ({student.nameEn})</h3>
                  <p className="text-sm text-gray-500">{student.phone}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-between text-sm text-gray-600">
                <span>Sessions Left: <span className="font-semibold text-indigo-600">{student.totalSessions}</span></span>
                <span>Age: {student.age || 'N/A'}</span>
              </div>
            </Link>
          ))}
          {filteredStudents?.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              No students found.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default StudentListPage
