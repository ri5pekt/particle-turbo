export default defineEventHandler((event) => {
  clearAccountToken(event)

  return {
    success: true,
  }
})
