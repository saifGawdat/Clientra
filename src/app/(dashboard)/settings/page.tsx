import { auth } from "@/lib/auth"
import { SettingsClient } from "@/components/settings/settings-client"

export default async function SettingsPage() {
  const session = await auth()

  return (
    <SettingsClient
      user={{
        name: session?.user?.name ?? null,
        email: session?.user?.email ?? "",
        role: session?.user?.role ?? "MEMBER",
      }}
    />
  )
}
