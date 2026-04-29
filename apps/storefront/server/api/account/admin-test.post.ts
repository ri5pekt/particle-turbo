interface DevAdminSessionResponse {
  token?: string
}

export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not found.',
    })
  }

  const medusa = useMedusaServer()

  try {
    const session = await medusa<DevAdminSessionResponse>('/store/account/dev-admin-session', {
      method: 'POST',
    })

    if (!session.token) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Could not create admin customer session.',
      })
    }

    setAccountToken(event, session.token)

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
