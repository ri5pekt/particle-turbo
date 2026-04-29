import { releaseExpiredPpuOrders } from "../lib/ppu"

type JobContainer = {
  resolve: (key: string) => unknown
}

export default async function releaseExpiredPpuJob(container: JobContainer) {
  await releaseExpiredPpuOrders(container)
}

export const config = {
  name: "release-expired-ppu-orders",
  schedule: "*/5 * * * *",
}
