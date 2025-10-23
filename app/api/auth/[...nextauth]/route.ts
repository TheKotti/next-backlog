import { handlers } from "app/auth" // Referring to the auth.ts we just created
export const { GET, POST } = handlers
export { auth as middleware } from "app/auth"