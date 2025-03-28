import { motion } from 'framer-motion';
import AnimatedVideo from './AnimatedVideo';
import { ChartBarIcon, UserGroupIcon, QuestionMarkCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const stats = [
  { name: 'Total Users', value: '2,543', icon: UserGroupIcon, color: 'from-sky-400 to-blue-500' },
  { name: 'Active Quizzes', value: '45', icon: QuestionMarkCircleIcon, color: 'from-purple-400 to-pink-500' },
  { name: 'Completion Rate', value: '89%', icon: ChartBarIcon, color: 'from-green-400 to-emerald-500' },
  { name: 'Avg. Time', value: '12m', icon: ClockIcon, color: 'from-amber-400 to-orange-500' },
];

export default function AdminDashboard() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 mb-8">
          Welcome to the Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.name}</p>
                  <p className={`text-3xl font-bold mt-2 text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} bg-opacity-10`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatedVideo />
      </motion.div>
    </div>
  );
}