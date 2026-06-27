import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { couponAPI } from '../services/api'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

const CART_STORAGE_KEY = 'hotelCart'

const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch (error) {
    console.warn('Failed to save cart to localStorage:', error)
  }
}

const initialState = {
  items: [],
  orderType: 'dine-in', // 'dine-in' | 'delivery' | 'takeaway'
  tableNumber: '',
  deliveryAddress: {
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  },
  coupon: null,       // { code, discountType, discountValue, minOrder, maxDiscount }
  couponDiscount: 0,
  specialInstructions: '',
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const stored = loadCartFromStorage()
    return stored || { ...initialState }
  })

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(cart)
  }, [cart])

  // ─── Add Item ──────────────────────────────────────────────────
  const addItem = useCallback((item) => {
    const itemId = item.id || item._id;
    const itemName = item.name;
    const itemPrice = item.offer_price || item.price;
    const itemImage = item.image_url || item.image;
    const itemVeg = item.is_veg !== undefined ? item.is_veg : item.isVeg;
    const itemCategory = item.category_name || item.category;

    setCart((prev) => {
      const existingIndex = prev.items.findIndex(
        (i) => (i.id === itemId || i._id === itemId) && JSON.stringify(i.customizations || {}) === JSON.stringify(item.customizations || {})
      )

      let updatedItems
      if (existingIndex > -1) {
        updatedItems = prev.items.map((i, idx) =>
          idx === existingIndex
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        )
      } else {
        updatedItems = [
          ...prev.items,
          {
            id: itemId,
            _id: itemId,
            name: itemName,
            price: itemPrice,
            image: itemImage,
            image_url: itemImage,
            category: itemCategory,
            category_name: itemCategory,
            quantity: item.quantity || 1,
            customizations: item.customizations || {},
            isVeg: itemVeg,
            is_veg: itemVeg,
          },
        ]
      }

      return { ...prev, items: updatedItems, coupon: null, couponDiscount: 0 }
    })

    toast.success(`${item.name} added to cart`, { icon: '🛒' })
  }, [])

  // ─── Remove Item ───────────────────────────────────────────────
  const removeItem = useCallback((itemId, customizations = {}) => {
    setCart((prev) => {
      const updatedItems = prev.items.filter(
        (i) => !((i.id === itemId || i._id === itemId) && JSON.stringify(i.customizations || {}) === JSON.stringify(customizations))
      )
      return { ...prev, items: updatedItems, coupon: null, couponDiscount: 0 }
    })

    toast.success('Item removed from cart')
  }, [])

  // ─── Update Quantity ───────────────────────────────────────────
  const updateQuantity = useCallback((itemId, quantity, customizations = {}) => {
    if (quantity < 1) return

    setCart((prev) => {
      const updatedItems = prev.items.map((i) => {
        if ((i.id === itemId || i._id === itemId) && JSON.stringify(i.customizations || {}) === JSON.stringify(customizations)) {
          return { ...i, quantity }
        }
        return i
      })
      return { ...prev, items: updatedItems, coupon: null, couponDiscount: 0 }
    })
  }, [])

  // ─── Increment / Decrement helpers ─────────────────────────────
  const incrementQuantity = useCallback((itemId, customizations = {}) => {
    setCart((prev) => {
      const updatedItems = prev.items.map((i) => {
        if ((i.id === itemId || i._id === itemId) && JSON.stringify(i.customizations || {}) === JSON.stringify(customizations)) {
          return { ...i, quantity: i.quantity + 1 }
        }
        return i
      })
      return { ...prev, items: updatedItems, coupon: null, couponDiscount: 0 }
    })
  }, [])

  const decrementQuantity = useCallback((itemId, customizations = {}) => {
    setCart((prev) => {
      const item = prev.items.find(
        (i) => (i.id === itemId || i._id === itemId) && JSON.stringify(i.customizations || {}) === JSON.stringify(customizations)
      )

      if (!item) return prev

      if (item.quantity <= 1) {
        const updatedItems = prev.items.filter(
          (i) => !((i.id === itemId || i._id === itemId) && JSON.stringify(i.customizations || {}) === JSON.stringify(customizations))
        )
        return { ...prev, items: updatedItems, coupon: null, couponDiscount: 0 }
      }

      const updatedItems = prev.items.map((i) => {
        if ((i.id === itemId || i._id === itemId) && JSON.stringify(i.customizations || {}) === JSON.stringify(customizations)) {
          return { ...i, quantity: i.quantity - 1 }
        }
        return i
      })
      return { ...prev, items: updatedItems, coupon: null, couponDiscount: 0 }
    })
  }, [])

  // ─── Clear Cart ────────────────────────────────────────────────
  const clearCart = useCallback(() => {
    setCart({ ...initialState })
    toast.success('Cart cleared')
  }, [])

  // ─── Order Type ────────────────────────────────────────────────
  const setOrderType = useCallback((type) => {
    if (!['dine-in', 'delivery', 'takeaway'].includes(type)) return
    setCart((prev) => ({ ...prev, orderType: type }))
  }, [])

  // ─── Table Number ──────────────────────────────────────────────
  const setTableNumber = useCallback((number) => {
    setCart((prev) => ({ ...prev, tableNumber: String(number) }))
  }, [])

  // ─── Delivery Address ─────────────────────────────────────────
  const setDeliveryAddress = useCallback((address) => {
    setCart((prev) => ({
      ...prev,
      deliveryAddress: { ...prev.deliveryAddress, ...address },
    }))
  }, [])

  // ─── Special Instructions ─────────────────────────────────────
  const setSpecialInstructions = useCallback((instructions) => {
    setCart((prev) => ({ ...prev, specialInstructions: instructions }))
  }, [])

  // ─── Apply Coupon ──────────────────────────────────────────────
  const applyCoupon = useCallback(async (code) => {
    try {
      const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      const { data } = await couponAPI.validate(code, subtotal)
      const couponData = data.coupon || data

      let discount = 0
      if (couponData.discountType === 'percentage') {
        discount = (subtotal * couponData.discountValue) / 100
        if (couponData.maxDiscount && discount > couponData.maxDiscount) {
          discount = couponData.maxDiscount
        }
      } else {
        discount = couponData.discountValue
      }

      discount = Math.min(discount, subtotal)

      setCart((prev) => ({
        ...prev,
        coupon: couponData,
        couponDiscount: discount,
      }))

      toast.success(`Coupon "${code}" applied! You save ₹${discount.toFixed(2)}`)
      return { success: true, discount }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid or expired coupon code.'
      toast.error(message)
      return { success: false, error: message }
    }
  }, [cart.items])

  // ─── Remove Coupon ─────────────────────────────────────────────
  const removeCoupon = useCallback(() => {
    setCart((prev) => ({ ...prev, coupon: null, couponDiscount: 0 }))
    toast.success('Coupon removed')
  }, [])

  // ─── Computed Values ───────────────────────────────────────────
  const cartSummary = useMemo(() => {
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    const deliveryCharge = cart.orderType === 'delivery' ? (subtotal >= 500 ? 0 : 49) : 0
    const tax = subtotal * 0.05 // 5% GST
    const couponDiscount = cart.couponDiscount || 0
    const total = Math.max(0, subtotal + tax + deliveryCharge - couponDiscount)

    return {
      subtotal,
      totalItems,
      deliveryCharge,
      tax,
      couponDiscount,
      total,
      isEmpty: cart.items.length === 0,
    }
  }, [cart.items, cart.orderType, cart.couponDiscount])

  // ─── Build Order Payload ───────────────────────────────────────
  const getOrderPayload = useCallback(() => {
    return {
      items: cart.items.map((item) => ({
        menuItem: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customizations: item.customizations,
      })),
      orderType: cart.orderType,
      tableNumber: cart.orderType === 'dine-in' ? cart.tableNumber : undefined,
      deliveryAddress: cart.orderType === 'delivery' ? cart.deliveryAddress : undefined,
      couponCode: cart.coupon?.code || undefined,
      specialInstructions: cart.specialInstructions || undefined,
      subtotal: cartSummary.subtotal,
      tax: cartSummary.tax,
      deliveryCharge: cartSummary.deliveryCharge,
      couponDiscount: cartSummary.couponDiscount,
      total: cartSummary.total,
    }
  }, [cart, cartSummary])

  const value = {
    // State
    items: cart.items,
    cartItems: cart.items,
    orderType: cart.orderType,
    tableNumber: cart.tableNumber,
    deliveryAddress: cart.deliveryAddress,
    coupon: cart.coupon,
    specialInstructions: cart.specialInstructions,

    // Computed
    ...cartSummary,
    cartTotal: cartSummary.total,

    // Actions
    addItem,
    addToCart: addItem,
    removeItem,
    removeFromCart: removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    setOrderType,
    setTableNumber,
    setDeliveryAddress,
    setSpecialInstructions,
    applyCoupon,
    removeCoupon,
    getOrderPayload,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export default CartContext
