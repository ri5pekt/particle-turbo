interface RegisterBody {
  email?: string
  password?: string
  first_name?: string
  last_name?: string
}

interface AuthResponse {
  token?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RegisterBody>(event)
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
    const auth = await medusa<AuthResponse>('/auth/customer/emailpass/register', {
      method: 'POST',
      body: {
        email,
        password,
      },
    })

    if (!auth.token) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Could not create account.',
      })
    }

    await medusa('/store/customers', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.token}`,
      },
      body: {
        email,
        first_name: body.first_name || '',
        last_name: body.last_name || '',
      },
    })

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
