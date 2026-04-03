export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{fontFamily: "Syne, sans-serif"}}>
          CSS Test Page
        </h1>
        
        <div className="bg-white rounded-xl border-2 border-cyan-500/30 p-6 shadow-lg mb-4">
          <p className="text-gray-600 mb-4">If you can see this styled box with cyan border and shadow, Tailwind CSS is working!</p>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gradient-to-b from-cyan-400 to-blue-500 p-4 rounded-lg text-white font-semibold text-center">
              Gradient Box 1
            </div>
            <div className="bg-gradient-to-b from-cyan-400 to-blue-500 p-4 rounded-lg text-white font-semibold text-center">
              Gradient Box 2
            </div>
            <div className="bg-gradient-to-b from-cyan-400 to-blue-500 p-4 rounded-lg text-white font-semibold text-center">
              Gradient Box 3
            </div>
          </div>
          
          <button className="inline-flex items-center justify-center px-4 h-10 rounded-lg text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg bg-gradient-to-r from-cyan-400 to-blue-500">
            Test Button with Gradient
          </button>
        </div>
        
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 font-semibold">If styles aren&apos;t showing, check:</p>
          <ul className="text-red-600 text-sm mt-2 space-y-1">
            <li>1. Is the text above actually styled with a large bold font?</li>
            <li>2. Do you see a box with cyan border and shadow?</li>
            <li>3. Are there gradient boxes with white text?</li>
            <li>4. Is there a styled button?</li>
          </ul>
        </div>
      </div>
    </div>
  )
}


