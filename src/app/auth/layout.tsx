export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center">
      <div className="w-full max-w-[800px] mx-4">
        {children}
      </div>
    </div>
  )
}
