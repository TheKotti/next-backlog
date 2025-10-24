import { signIn, signOut } from "app/auth"

export function SignIn({
    provider,
    ...props
}: { provider?: string } & any) {
    return (
        <form
            action={async () => {
                "use server"
                await signIn(provider)
            }}
        >
            <button className='btn btn-light' {...props}>Sign In</button>
        </form>
    )
}

export function SignOut(props) {
    return (
        <form
            action={async () => {
                "use server"
                await signOut()
            }}
            className="w-full"
        >
            <button className='btn btn-light' {...props}>
                Sign Out
            </button>
        </form>
    )
}