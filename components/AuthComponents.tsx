import { handleSignIn, handleSignOut } from "utils/auth"

export function SignIn({
    provider,
    ...props
}: { provider?: string } & any) {
    return (
        <form action={handleSignIn.bind(null, provider)}>
            <button className='btn btn-light' {...props}>Sign In</button>
        </form>
    )
}

export function SignOut(props: any) {
    return (
        <form
            action={handleSignOut}
            className="w-full"
        >
            <button className='btn btn-light' {...props}>
                Sign Out ({props.username})
            </button>
        </form>
    )
}