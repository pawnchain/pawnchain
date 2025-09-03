'use client'

import { createAvatar } from '@dicebear/core'
import { funEmoji } from '@dicebear/collection'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface UserAvatarProps {
  seed: string
  size?: number
  className?: string
  showBorder?: boolean
  isActive?: boolean
}

export function UserAvatar({ seed, size = 40, className = '', showBorder = true, isActive = false }: UserAvatarProps) {
  const [avatar, setAvatar] = useState<string>('')

  useEffect(() => {
    const generateAvatar = async () => {
      const avatarData = createAvatar(funEmoji, {
        seed,
        size: size * 2, // For better quality
        backgroundColor: ['b6e3f4', 'c0aede', 'ffd5dc', 'ffdfbf'],
        radius: 50
      })
      const dataUri = await avatarData.toDataUri()
      setAvatar(dataUri)
    }
    generateAvatar()
  }, [seed, size])

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      <motion.div
        className={`
          rounded-full overflow-hidden
          ${showBorder ? 'ring-2 ring-white ring-offset-2' : ''}
          ${isActive ? 'ring-green-400' : 'ring-purple-400'}
        `}
        animate={{
          scale: isActive ? [1, 1.1, 1] : 1,
          rotate: isActive ? [0, 5, -5, 0] : 0
        }}
        transition={{
          duration: isActive ? 2 : 0.3,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        <motion.img
          src={avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPC9zdmc+'}
          alt="User avatar"
          width={size}
          height={size}
          className="w-full h-full"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        />
      </motion.div>
      
      {isActive && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity
          }}
        />
      )}
    </motion.div>
  )
}