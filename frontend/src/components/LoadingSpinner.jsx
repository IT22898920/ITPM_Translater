import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-50">
      <div className="relative">
        {/* Outermost ring with gradient */}
        <motion.div
          className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: {
              duration: 3,
              ease: "linear",
              repeat: Infinity
            },
            scale: {
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity
            }
          }}
        >
          <div className="absolute inset-0.5 bg-gray-900 rounded-full" />
        </motion.div>

        {/* Spinning rings */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            ease: "linear",
            repeat: Infinity
          }}
        />
        
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500"
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.5,
            ease: "linear",
            repeat: Infinity
          }}
        />

        {/* Pulsing center with particles */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-6 h-6 -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          <div className="relative w-full h-full">
            <motion.div
              className="absolute inset-0 rounded-full bg-blue-500"
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
            
            {/* Orbiting particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white"
                animate={{
                  rotate: 360,
                  scale: [1, 1.5, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  rotate: {
                    duration: 3,
                    ease: "linear",
                    repeat: Infinity,
                    delay: i * 0.5,
                  },
                  scale: {
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: i * 0.3,
                  },
                  opacity: {
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: i * 0.3,
                  },
                }}
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 60}deg) translateY(-12px)`,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Glowing effect */}
        <motion.div
          className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </div>

      {/* Loading text */}
      <motion.div
        className="absolute mt-32 text-white/80 text-lg font-medium tracking-wider"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        Loading...
      </motion.div>
    </div>
  );
}