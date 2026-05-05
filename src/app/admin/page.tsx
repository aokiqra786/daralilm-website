import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold text-blue-900 mb-2">Admin Dashboard</h1>
        <p className="text-slate-600">Manage programs, announcements, and events.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Programs</h2>
          <p className="text-slate-600 mb-4">Manage the curriculum and courses.</p>
          <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 rounded transition-colors">
            Manage Programs
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Announcements & Events</h2>
          <p className="text-slate-600 mb-4">Post updates, news, and schedule community events.</p>
          <Link href="/admin/event-uploader" className="block w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 rounded transition-colors text-center">
            Upload Post
          </Link>
        </div>
      </div>
      
      <div className="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-amber-800 mb-2">Authentication Required</h3>
        <p className="text-amber-700">
          Currently running in mock mode. To fully secure this dashboard, configure Supabase Auth and implement role-based access control (Admin, Teacher, Student) as per the Master System Prompt.
        </p>
      </div>
    </div>
  );
}
