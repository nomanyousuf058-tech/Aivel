'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ShoppingCart } from 'lucide-react'
import { Product } from '@/types'
import ProductCard from '@/components/ui/ProductCard'

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        const mockProducts = (await import('@/mocks/products.json')).products
        setProducts(mockProducts as Product[])
      } catch (error) {
        console.error('Failed to fetch products:', error)
        // Fallback to mock data
        const mockProducts = (await import('@/mocks/products.json')).products
        setProducts(mockProducts as Product[])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || product.category === selectedType
    return matchesSearch && matchesType
  })

  const productTypes = ['all', 'tool', 'template', 'service', 'ai']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            AIVEL <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Marketplace</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover powerful templates, plugins, and services to accelerate your digital projects
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-6 mb-8"
        >
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full glass pl-10 pr-4 py-4 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {productTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 capitalize ${
                  selectedType === type
                    ? 'bg-blue-600 text-white'
                    : 'glass text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {type === 'all' ? 'All Products' : type + 's'}
              </button>
            ))}
            <button className="glass hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>More Filters</span>
            </button>
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {loading ? (
            // Loading skeletons
            Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="glass-card animate-pulse space-y-4"
              >
                <div className="h-48 bg-gray-700 rounded-xl"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                delay={index * 0.1}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-400 text-lg mb-4">
                No products found matching your criteria.
              </div>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedType('all')
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 glass-card max-w-4xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Sell Your Own Products?
          </h2>
          <p className="text-gray-300 mb-6">
            Join our marketplace and reach thousands of creators and businesses
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 neon-glow">
            Become a Seller
          </button>
        </motion.div>
      </div>
    </div>
  )
}