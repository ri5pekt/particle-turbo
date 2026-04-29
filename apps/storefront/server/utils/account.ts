import type { H3Event } from 'h3'

export const ACCOUNT_COOKIE_NAME = 'particle_customer_token'

export const setAccountToken = (event: H3Event, token: string) => {
  setCookie(event, ACCOUNT_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === 'production',
  })
}

export const clearAccountToken = (event: H3Event) => {
  deleteCookie(event, ACCOUNT_COOKIE_NAME, {
    path: '/',
  })
}

export const getAccountToken = (event: H3Event) => {
  return getCookie(event, ACCOUNT_COOKIE_NAME)
}

export const getMedusaAuthHeaders = (event: H3Event) => {
  const token = getAccountToken(event)

  return token
    ? {
        authorization: `Bearer ${token}`,
      }
    : undefined
}

export const getAccountErrorMessage = (error: unknown) => {
  const errorLike = error as {
    data?: { message?: string }
    response?: { _data?: { message?: string } }
    statusMessage?: string
    message?: string
  }

  return errorLike.data?.message
    || errorLike.response?._data?.message
    || errorLike.statusMessage
    || errorLike.message
    || 'Account request failed.'
}

export const getAccountErrorStatus = (error: unknown) => {
  const errorLike = error as {
    statusCode?: number
    status?: number
    response?: { status?: number }
  }

  return errorLike.statusCode || errorLike.status || errorLike.response?.status || 400
}
