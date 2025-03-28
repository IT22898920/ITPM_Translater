import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 relative"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-slate-900/50 to-purple-500/5 pointer-events-none" />
          
          <div className="relative">
            <div className="container mx-auto px-6 py-8">
              <Outlet />
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}