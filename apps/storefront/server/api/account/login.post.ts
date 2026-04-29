interface LoginBody {
  email?: string
  password?: string
}

interface AuthResponse {
  token?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginBody>(event)
  const email = body.email?.trim().toLowerCase()
  const password = body.password

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required.',
    })
  }

  const medusa = useMedusaServer()

  try {
    const auth = await medusa<AuthResponse>('/auth/customer/emailpass', {
      method: 'POST',
      body: {
        email,
        password,
      },
    })

    if (!auth.token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Could not sign in.',
      })
    }

    setAccountToken(event, auth.token)

    return {
      success: true,
    }
  } catch (error) {
    throw createError({
      statusCode: getAccountErrorStatus(error),
      statusMessage: getAccountErrorMessage(error),
    })
  }
})
