import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Quiz Management', href: '/admin/quizzes', icon: QuestionMarkCircleIcon },
  { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

const sidebarVariants = {
  hidden: { x: -32, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className="w-72 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 min-h-screen overflow-y-auto"
    >
      <div className="p-6">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500"
        >
          TranslaterHUB
        </motion.div>
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-400 mt-1"
        >
          Admin Panel
        </motion.div>
      </div>

      <nav className="mt-6 px-4">
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.href;
          return (
            <motion.div
              key={item.name}
              variants={itemVariants}
              whileHover={{ x: 4 }}
              className="relative"
            >
              <Link
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 mb-2 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-sky-500/10 text-sky-400'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${
                  isActive ? 'text-sky-400' : 'group-hover:scale-110'
                }`} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-0 w-1 h-8 bg-gradient-to-b from-sky-400 to-blue-600 rounded-l-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="p-4 rounded-xl bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-purple-500/10 border border-slate-700/30">
          <p className="text-sm text-gray-400">
            Need help? Check our documentation or contact support.
          </p>
        </div>
      </div>
    </motion.div>
  );
}