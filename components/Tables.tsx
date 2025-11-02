'use client'

import React, { useMemo, useState } from 'react'
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
    const { initialParams, updateParams } = useNextQueryParams({
        sortBy: 'finishedDate',
        sortDesc: true,
        title: '',
        showBacklog: false,
        tag: null,
        showCovers: true,
    })

    const [viewBacklog, setViewBacklog] = useState(initialParams.get('showBacklog') == 'true')

    const playedGames = useMemo(
        () =>
            games
                .filter((x) => x.finishedDate || x.finished === 'Happening')
                .map((x) => {
                    // Hacky shit because I fucked up the initial date insertions
                    return { ...x, finishedDate: x.finishedDate ? new Date(x.finishedDate).toISOString() : null }
                }),
        [games]
    )
    const backlogGames = useMemo(() => games.filter((x) => !x.finishedDate && x.finished !== 'Happening'), [games])

    const handleBacklogToggle = (checked) => {
        setViewBacklog(checked)
        updateParams({ showBacklog: checked })
    }

    return (
        <>
            <div className={`d-flex justify-content-between mb-3 ${styles.header}`}>
                <h2>{viewBacklog ? 'Backlog' : 'Previously played'}</h2>
                <div className='d-flex gap-2'>
                    <StatsDialog games={games} />

                    <button className='btn btn-primary' onClick={() => handleBacklogToggle(!viewBacklog)}>
                        {viewBacklog ? 'Show previously played' : 'Show backlog'}
                    </button>
                </div>
            </div>

            {viewBacklog ? (
                <BacklogTable
                    games={backlogGames}
                    updateParams={updateParams}
                    initialParams={initialParams}
                    isAdmin={isAdmin}
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