import { motion } from 'framer-motion';

export default function AnimatedVideo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-4xl mx-auto mt-8 rounded-2xl overflow-hidden shadow-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-purple-500/10 z-10 pointer-events-none" />
      
      <div className="aspect-video relative">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover rounded-2xl"
        >
          <source
            src="https://assets.codepen.io/2621168/abstract_animation.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>
    </motion.div>
  );
}