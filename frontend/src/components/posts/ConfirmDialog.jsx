import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger" // 'danger', 'warning', 'info'
}) => {
  const overlayRef = useRef(null);
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (overlayRef.current === e.target) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent scrolling when modal is open
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Restore scrolling when modal is closed
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);
  
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);
  
  // Get colors based on type
  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: "text-red-500",
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          button: "bg-gradient-to-r from-red-500 to-red-600 hover:shadow-red-500/25",
          pulse: "animate-pulse-red"
        };
      case 'warning':
        return {
          icon: "text-amber-500",
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          button: "bg-gradient-to-r from-amber-500 to-amber-600 hover:shadow-amber-500/25",
          pulse: "animate-pulse-amber"
        };
      case 'info':
      default:
        return {
          icon: "text-sky-500",
          bg: "bg-sky-500/10",
          border: "border-sky-500/30",
          button: "bg-gradient-to-r from-sky-500 to-blue-600 hover:shadow-sky-500/25",
          pulse: "animate-pulse-sky"
        };
    }
  };
  
  const colors = getColors();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 350 
            }}
            className={`relative max-w-md w-full mx-4 p-6 rounded-2xl shadow-2xl ${colors.bg} border ${colors.border} backdrop-blur-xl`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`p-3 rounded-full ${colors.bg} ${colors.pulse}`}>
                <ExclamationTriangleIcon className={`w-6 h-6 ${colors.icon}`} />
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${colors.icon} mb-2`}>
                  {title}
                </h3>
                <p className="text-slate-300 mb-6">
                  {message}
                </p>
                
                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    {cancelText}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className={`px-4 py-2 rounded-xl ${colors.button} text-white font-medium hover:shadow-lg transition-all duration-300`}
                  >
                    {confirmText}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;