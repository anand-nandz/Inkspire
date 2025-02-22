import { motion } from "framer-motion"
import AnimatedText from "./Animated-text"
import DynamicBackground from "./DynamicBackground"

const HeroBanner = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <DynamicBackground 
          filepath="/videos/background.mp4" 
        />
      </div>
      <div className="relative h-full w-full flex items-center justify-center ">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 text-center"
        >
          <h1 className="mb-8 text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Discover Amazing Articles
          </h1>
          <AnimatedText />
        </motion.div>
      </div>
    </div>
  )
}

export default HeroBanner