"use client"
import React from "react"
import { motion, AnimatePresence } from "framer-motion"

const words = ["Inspiring", "Informative", "Engaging", "Thought-provoking"]

const AnimatedText = () => {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <h2 className="text-2xl text-white">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {words[index]} Articles
        </motion.span>
      </AnimatePresence>
    </h2>
  )
}

export default AnimatedText