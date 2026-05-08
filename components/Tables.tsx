'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import styles from '../styles/GameTable.module.css'
import { useNextQueryParams } from 'hooks/useNextQueryParams'
import { StatsDialog } from './StatsDialog'
import { BacklogTable } from './BacklogTable'
import { GameTable } from './GameTable'

type Props = {
    games: Game[]
    isAdmin: boolean
}

export const Tables = ({ games, isAdmin }: Props) => {
    const { data: session } = useSession()
    const [liveVotes, setLiveVotes] = useState<Record<string, string[]> | null>(
        null
    )

    const { initialParams, updateParams } = useNextQueryParams({
        sortBy: 'finishedDate',
        sortDesc: true,
        title: '',
        showBacklog: false,
        tag: null,
        dev: null,
        showCovers: true,
    })

    const [viewBacklog, setViewBacklog] = useState(
        initialParams.get('showBacklog') == 'true'
    )

    useEffect(() => {
        fetch('/api/votes')
            .then((res) => res.json())
            .then((data) => setLiveVotes(data))
            .catch(console.error)
    }, [])

    const gamesWithVotes = useMemo(() => {
        if (!liveVotes) return games
        return games.map((g) => ({
            ...g,
            votes: liveVotes[g._id!] ?? g.votes ?? [],
        }))
    }, [games, liveVotes])

    const playedGames = useMemo(
        () =>
            gamesWithVotes
                .filter((x) => x.finishedDate || x.finished === 'Happening')
                .map((x) => ({
                    ...x,
                    finishedDate: x.finishedDate
                        ? new Date(x.finishedDate).toISOString()
                        : null,
                })),
        [gamesWithVotes]
    )
    const backlogGames = useMemo(
        () =>
            gamesWithVotes.filter(
                (x) => !x.finishedDate && x.finished !== 'Happening'
            ),
        [gamesWithVotes]
    )

    const handleBacklogToggle = (checked) => {
        setViewBacklog(checked)
        updateParams({ showBacklog: checked })
    }

    const refreshVotes = () => {
        fetch('/api/votes')
            .then((res) => res.json())
            .then((data) => setLiveVotes(data))
            .catch(console.error)
    }

    return (
        <>
            <div
                className={`d-flex justify-content-between mb-3 ${styles.header}`}
            >
                <h2>{viewBacklog ? 'Backlog' : 'Previously played'}</h2>
                <div className="d-flex gap-2">
                    <StatsDialog games={games} />

                    <button
                        className="btn btn-primary"
                        onClick={() => handleBacklogToggle(!viewBacklog)}
                    >
                        {viewBacklog
                            ? 'Show previously played'
                            : 'Show backlog'}
                    </button>
                </div>
            </div>

            {viewBacklog ? (
                <BacklogTable
                    games={backlogGames}
                    updateParams={updateParams}
                    initialParams={initialParams}
                    isAdmin={isAdmin}
                    username={session?.user?.name ?? null}
                />
            ) : (
                <GameTable
                    games={playedGames}
                    updateParams={updateParams}
                    initialParams={initialParams}
                    isAdmin={isAdmin}
                />
            )}
        </>
    )
}
