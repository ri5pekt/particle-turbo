import type { CartLineItem, MedusaCart, MedusaProductSummary } from '~/types/commerce'

interface AddItemInput {
  variantId: string
  quantity: number
}

export const useCart = () => {
  const cartId = useCookie<string | null>('particle_cart_id', {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  })
  const cart = useState<MedusaCart | null>('particle-cart', () => null)
  const isOpen = useState('particle-cart-open', () => false)
  const isLoading = useState('particle-cart-loading', () => false)
  const error = useState<string | null>('particle-cart-error', () => null)
  const lastAddedItem = useState<CartLineItem | null>('particle-cart-last-added', () => null)
  const recommendations = useState<MedusaProductSummary[]>('particle-cart-recommendations', () => [])

  const itemCount = computed(() => {
    return cart.value?.items?.reduce((total, item) => total + Number(item.quantity || 0), 0) || 0
  })

  const ensureCart = async () => {
    if (cart.value?.id) {
      return cart.value
    }

    if (cartId.value) {
      try {
        cart.value = await $fetch<MedusaCart>(`/api/cart/${cartId.value}`)
        return cart.value
      } catch {
        cartId.value = null
      }
    }

    cart.value = await $fetch<MedusaCart>('/api/cart', {
      method: 'POST',
    })
    cartId.value = cart.value.id

    return cart.value
  }

  const refreshCart = async () => {
    if (!cartId.value) {
      return null
    }

    try {
      cart.value = await $fetch<MedusaCart>(`/api/cart/${cartId.value}`)
      return cart.value
    } catch {
      cartId.value = null
      cart.value = null
      return null
    }
  }

  const fetchRecommendations = async (excludeHandle?: string) => {
    recommendations.value = await $fetch<MedusaProductSummary[]>('/api/cart/recommendations', {
      query: excludeHandle
        ? {
            exclude_handle: excludeHandle,
          }
        : undefined,
    })
  }

  const addItem = async ({ variantId, quantity }: AddItemInput) => {
    isLoading.value = true
    error.value = null

    try {
      const currentCart = await ensureCart()
      const previousItemIds = new Set(currentCart.items?.map((item) => item.id) || [])
      cart.value = await $fetch<MedusaCart>(`/api/cart/${currentCart.id}/line-items`, {
        method: 'POST',
        body: {
          variant_id: variantId,
          quantity,
        },
      })
      cartId.value = cart.value.id
      lastAddedItem.value = cart.value.items?.find((item) => !previousItemIds.has(item.id))
        || cart.value.items?.find((item) => item.variant_id === variantId)
        || cart.value.items?.[cart.value.items.length - 1]
        || null
      isOpen.value = true
      void fetchRecommendations(lastAddedItem.value?.product_handle).catch(() => {
        recommendations.value = []
      })

      return cart.value
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : 'Could not add item to cart.'
      throw caughtError
    } finally {
      isLoading.value = false
    }
  }

  const updateItem = async (lineId: string, quantity: number) => {
    if (!cart.value?.id) {
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      cart.value = await $fetch<MedusaCart>(`/api/cart/${cart.value.id}/line-items/${lineId}`, {
        method: 'PATCH',
        body: {
          quantity,
        },
      })
      return cart.value
    } finally {
      isLoading.value = false
    }
  }

  const removeItem = async (lineId: string) => {
    if (!cart.value?.id) {
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      cart.value = await $fetch<MedusaCart>(`/api/cart/${cart.value.id}/line-items/${lineId}`, {
        method: 'DELETE',
      })
      return cart.value
    } finally {
      isLoading.value = false
    }
  }

  const applyPromotion = async (promoCode: string) => {
    const code = promoCode.trim()

    if (!code) {
      error.value = 'Please enter a coupon code.'
      return null
    }

    const currentCart = await ensureCart()
    isLoading.value = true
    error.value = null

    try {
      cart.value = await $fetch<MedusaCart>(`/api/cart/${currentCart.id}/promotions`, {
        method: 'POST',
        body: {
          promo_code: code,
        },
      })
      cartId.value = cart.value.id

      return cart.value
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : 'Coupon could not be applied.'
      throw caughtError
    } finally {
      isLoading.value = false
    }
  }

  const clearCart = async () => {
    if (!cart.value?.id) {
      cartId.value = null
      cart.value = null
      lastAddedItem.value = null
      recommendations.value = []
      isOpen.value = false
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      let nextCart = cart.value

      for (const item of cart.value.items || []) {
        nextCart = await $fetch<MedusaCart>(`/api/cart/${cart.value.id}/line-items/${item.id}`, {
          method: 'DELETE',
        })
      }

      cart.value = nextCart
      cartId.value = nextCart.id
      lastAddedItem.value = null
      recommendations.value = []
      isOpen.value = false

      return cart.value
    } finally {
      isLoading.value = false
    }
  }

  const openCart = async () => {
    await refreshCart()
    isOpen.value = true
  }

  const closeCart = () => {
    isOpen.value = false
  }

  return {
    cart,
    cartId,
    itemCount,
    isOpen,
    isLoading,
    error,
    lastAddedItem,
    recommendations,
    addItem,
    updateItem,
    removeItem,
    applyPromotion,
    clearCart,
    refreshCart,
    openCart,
    closeCart,
  }
}

