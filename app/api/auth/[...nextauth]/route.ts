import { handlers } from "app/auth"
import { auth as middleware } from "app/auth"
const { GET, POST } = handlers

export { middleware, GET, POST }