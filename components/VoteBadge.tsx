'use client'

import { useEffect, useState } from 'react'

type Props = {
    count: number
    hasVoted: boolean
    voters: string[]
    username: string | null
    gameId: string
}

export const VoteBadge = ({
    count,
    hasVoted,
    voters,
    username,
    gameId,
}: Props) => {
    const [optimisticVoted, setOptimisticVoted] = useState<boolean | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (optimisticVoted !== null && optimisticVoted === hasVoted) {
            setOptimisticVoted(null)
        }
    }, [hasVoted, optimisticVoted])

    const displayVoted = optimisticVoted ?? hasVoted
    const displayCount =
        optimisticVoted === null
            ? count
            : optimisticVoted
              ? count + (hasVoted ? 0 : 1)
              : count - (hasVoted ? 1 : 0)

    const handleVote = async () => {
        if (!username || loading) return
        setLoading(true)
        setOptimisticVoted(!displayVoted)
        try {
            await fetch('/api/votes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId }),
            })
        } catch {
            setOptimisticVoted(null)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="position-absolute d-flex align-items-center gap-1"
            style={{ bottom: 6, right: 6 }}
        >
            {displayCount > 0 && (
                <span
                    className="badge bg-danger fs-6"
                    title={voters.join(', ')}
                    style={{ cursor: 'default' }}
                >
                    {displayCount}
                </span>
            )}
            {username && (
                <button
                    className={`btn btn-sm border-1 border-white ${displayVoted ? 'btn-primary' : 'btn-dark'}`}
                    onClick={handleVote}
                    disabled={loading}
                    title={displayVoted ? 'Remove vote' : 'Vote for this game'}
                >
                    {displayVoted ? '✕' : '▲'}
                </button>
            )}
        </div>
    )
}
