export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2.5 0M13 16H3m10 0h1m1-9h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16h-2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">RoadLog</h1>
          <p className="text-gray-400 text-sm mt-1">Driver Trip Management</p>
        </div>
        {children}
      </div>
    </div>
  )
}
