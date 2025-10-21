'use client'

import { motion } from 'framer-motion'
import { Product } from '@/types'
import { 
  ShoppingCart, 
  Star, 
  Download,
  Code,
  BookOpen,
  Settings
} from 'lucide-react'

interface ProductCardProps {
  product: Product
  delay?: number
}

// Updated to use category instead of type
const categoryConfig = {
  tool: { icon: Settings, color: 'bg-green-500', label: 'Tool' },
  template: { icon: Code, color: 'bg-blue-500', label: 'Template' },
  service: { icon: Download, color: 'bg-purple-500', label: 'Service' },
  ai: { icon: BookOpen, color: 'bg-orange-500', label: 'AI' }
}

export default function ProductCard({ product, delay = 0 }: ProductCardProps) {
  const CategoryIcon = categoryConfig[product.category].icon

  const handleBuy = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      // In real app: await productsApi.buy(product.id)
      alert(`Successfully purchased ${product.name}!`)
    } catch (error) {
      console.error('Purchase failed:', error)
      alert('Purchase failed. Please try again.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className="glass-card group cursor-pointer relative overflow-hidden"
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl mb-4 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <CategoryIcon className="h-16 w-16 text-white/40" />
        </div>
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${categoryConfig[product.category].color} text-white`}>
            <CategoryIcon className="h-3 w-3" />
            <span>{categoryConfig[product.category].label}</span>
          </div>
        </div>
        {/* Rating */}
        <div className="absolute top-3 right-3 glass px-2 py-1 rounded-full">
          <div className="flex items-center space-x-1 text-xs text-white">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{product.rating}</span>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-gray-300 text-sm line-clamp-2">
          {product.description}
        </p>

        {/* Price and Action */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">${product.price}</span>
            <span className="text-sm text-gray-400 line-through">${Math.round(product.price * 1.2)}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleBuy()
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 group/btn"
            suppressHydrationWarning
          >
            <ShoppingCart className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
            <span className="text-sm font-medium">Buy</span>
          </button>
        </div>

        {/* Commission Info */}
        <div className="text-xs text-gray-400">
          Includes platform commission
        </div>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 rounded-xl" />
    </motion.div>
  )
}