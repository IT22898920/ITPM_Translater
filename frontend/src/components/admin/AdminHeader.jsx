import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon, ChevronDownIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAdminStore } from '../../stores/adminStore';
import { motion } from 'framer-motion';

export default function AdminHeader() {
  const { logout } = useAdminStore();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50"
    >
      <div className="px-6 sm:px-8 lg:px-12 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500"
          >
            Admin Dashboard
          </motion.div>
          
          <Menu as="div" className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu.Button className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 hover:text-white transition-all duration-200 group">
                <UserCircleIcon className="w-8 h-8 group-hover:text-sky-400 transition-colors" />
                <span className="font-medium">Admin</span>
                <ChevronDownIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
              </Menu.Button>
            </motion.div>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-150"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-3 w-56 bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-lg py-2 ring-1 ring-slate-700/50 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-slate-700/50 text-white' : 'text-gray-300'
                      } flex items-center w-full px-4 py-3 text-sm transition-all duration-200 group`}
                    >
                      <Cog6ToothIcon className={`w-5 h-5 mr-3 ${active ? 'text-sky-400' : ''} group-hover:rotate-180 transition-transform duration-500`} />
                      Settings
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={`${
                        active ? 'bg-slate-700/50 text-white' : 'text-gray-300'
                      } flex items-center w-full px-4 py-3 text-sm transition-all duration-200 group`}
                    >
                      <ArrowRightOnRectangleIcon className={`w-5 h-5 mr-3 ${active ? 'text-sky-400' : ''} group-hover:translate-x-1 transition-transform duration-300`} />
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </motion.header>
  );
}