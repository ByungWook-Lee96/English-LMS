import { useAuthStore } from '../stores/authStore'

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.username}!</h2>
        <p className="mt-2 text-gray-600">This is the English LMS Dashboard. You can manage students and schedules here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
          <h3 className="text-indigo-900 font-semibold">Total Students</h3>
          <p className="text-3xl font-bold text-indigo-700">--</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <h3 className="text-green-900 font-semibold">Today's Classes</h3>
          <p className="text-3xl font-bold text-green-700">--</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
          <h3 className="text-yellow-900 font-semibold">Attendance Rate</h3>
          <p className="text-3xl font-bold text-yellow-700">--%</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
