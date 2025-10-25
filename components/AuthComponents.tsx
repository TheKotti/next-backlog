import { toast } from "react-toastify"
import { handleRevalidate, handleSignIn, handleSignOut } from "utils/auth"

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
                Sign Out
            </button>
        </form>
    )
}

export function RevalidateButton({ ...props }: any) {
    const handleClick = async () => {
        try {
            await handleRevalidate()
            toast.success('Revalidated')
        } catch (error: any) {
            toast.error('Revalidation failed')
            console.error(error)
        }
    }

    return (
        <button
            className='btn btn-light'
            onClick={handleClick}
            {...props}
        >
            Refresh
        </button>
    )
}