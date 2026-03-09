import { handleSignIn, handleSignOut } from 'utils/auth'

export function SignIn({ provider, ...props }: { provider?: string }) {
    return (
        <form action={handleSignIn.bind(null, provider)}>
            <button className="btn btn-light" {...props}>
                Sign In
            </button>
        </form>
    )
}

export function SignOut(props: { username: string }) {
    return (
        <form action={handleSignOut} className="w-full">
            <button className="btn btn-light">
                Sign Out ({props.username})
            </button>
        </form>
    )
}
