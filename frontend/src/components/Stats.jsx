export default function Stats() {
  return (
    <div className="py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 text-center">
          <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            100M+
          </div>
          <p className="mt-2 text-gray-400">Translations Daily</p>
        </div>
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 text-center">
          <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            99.9%
          </div>
          <p className="mt-2 text-gray-400">Accuracy Rate</p>
        </div>
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 text-center">
          <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            5M+
          </div>
          <p className="mt-2 text-gray-400">Happy Users</p>
        </div>
      </div>
    </div>
  );
}