'use client'

import React, { useMemo, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    ChartOptions,
    ChartData,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip)

const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
        x: {
            ticks: { color: '#FFF' },
        },
        y: {
            ticks: { color: '#FFF' },
        },
    },
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: true,
            text: 'Rating distribution',
            color: '#FFF',
        },
    },
}

type Props = {
    games: Game[]
}

export const StatsDialog = (props: Props) => {
    const { games } = props

    const [show, setShow] = useState(false)

    // It's a disaster but whatever, clean up when drunk or something
    const stats = useMemo(() => {
        if (games.length === 0) return []
        // This filter crap shouldn't be necessary but fuck it
        const ratings = games
            .map((x) => x.rating)
            .filter((x): x is number => !!x)
        const times = games
            .map((x) => x.timeSpent)
            .filter((x): x is number => !!x)
        const additionalTimes = games
            .map((x) => x.additionalTimeSpent)
            .filter((x): x is number => !!x)
        const allTimes = times.concat(additionalTimes)
        const backlog = games.filter((x) => !x.finishedDate)

        const averageRating =
            ratings.reduce((a, b) => a + b, 0) / ratings.length
        const totalTime = allTimes.reduce((a, b) => a + b, 0)
        const averageTime = totalTime / allTimes.length
        const streamedGames = games.filter((x) => x.streamed).length
        const finishedGames = games.filter(
            (x) =>
                x.finished &&
                x.finished !== 'Nope' &&
                x.finished !== 'Happening'
        ).length
        const backlogLength = backlog.length
        const playedGamesLength = games.filter(
            (x) => x.finishedDate && x.finished !== 'Happening'
        ).length
        const backlogTime = backlog
            .map((x) => x.hltbMain)
            .filter((x) => x)
            .reduce((a, b) => (a || 0) + (b || 0), 0)

        return [
            {
                key: 'Average rating',
                value: averageRating.toFixed(2),
            },
            {
                key: 'Average game length',
                value: `${averageTime.toFixed(2)} hours`,
            },
            {
                key: 'Total time spent',
                value: `${totalTime} hours`,
            },
            {
                key: 'Streamed games',
                value: `${streamedGames}`,
            },
            {
                key: 'Finishing rate',
                value: `${Math.floor((finishedGames / playedGamesLength) * 100)}%`,
            },
            {
                key: 'Played games',
                value: playedGamesLength,
            },
            {
                key: 'Games in backlog',
                value: backlogLength,
            },
            {
                key: 'Backlog time estimate',
                value: `${backlogTime} hours`,
            },
        ]
    }, [games])

    const ratingCountsData = useMemo(() => {
        const ratingCounts = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
            10: 0,
        }

        if (games.length) {
            games.forEach((game) => {
                if (game.rating) {
                    ratingCounts[game.rating]++
                }
            })
        }

        const data: ChartData<'bar'> = {
            labels: Object.keys(ratingCounts),
            datasets: [
                {
                    data: Object.values(ratingCounts),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                },
            ],
        }

        return data
    }, [games])

    const developers = useMemo(() => {
        const developerGames: Record<
            string,
            { title: string; rating: number; finishedDate?: string }[]
        > = {}

        games.forEach((game) => {
            if (
                game.developers?.length &&
                game.rating &&
                !game.tags?.includes('expansion')
            ) {
                game.developers.forEach((dev) => {
                    if (!developerGames[dev]) {
                        developerGames[dev] = []
                    }
                    if (game.rating) {
                        const existingGame = developerGames[dev].find(
                            (g) => g.title === game.title
                        )
                        if (existingGame) {
                            // Update rating if the new finishedDate is more recent
                            if (
                                game.finishedDate &&
                                existingGame.finishedDate &&
                                new Date(game.finishedDate) >
                                    new Date(existingGame.finishedDate)
                            ) {
                                existingGame.rating = game.rating
                                existingGame.finishedDate = game.finishedDate
                            }
                        } else {
                            developerGames[dev].push({
                                title: game.title,
                                rating: game.rating,
                                finishedDate: game.finishedDate!,
                            })
                        }
                    }
                })
            }
        })

        Object.keys(developerGames).forEach((dev) => {
            if (developerGames[dev].length < 4) {
                delete developerGames[dev]
            }
        })

        const developerStats = Object.keys(developerGames)
            .map((dev) => {
                const games = developerGames[dev]
                return {
                    name: dev,
                    games: games.sort((a, b) => b.rating - a.rating),
                }
            })
            .sort((a, b) => {
                const avgA =
                    a.games.reduce((sum, game) => sum + game.rating, 0) /
                    a.games.length
                const avgB =
                    b.games.reduce((sum, game) => sum + game.rating, 0) /
                    b.games.length
                return avgB - avgA
            })

        return developerStats
    }, [games])

    const years = useMemo(() => {
        const yearGroups: Record<number, { title: string; rating: number }[]> =
            {}

        games.forEach((game) => {
            if (game.rating && game.releaseYear) {
                if (!yearGroups[game.releaseYear]) {
                    yearGroups[game.releaseYear] = []
                }
                yearGroups[game.releaseYear].push({
                    title: game.title,
                    rating: game.rating,
                })
            }
        })

        const sortedYears = Object.keys(yearGroups)
            .map((year) => ({
                year: parseInt(year),
                games: yearGroups[parseInt(year)],
            }))
            .sort((a, b) => {
                const aHighRated = a.games.filter(
                    (game) => game.rating >= 8
                ).length
                const bHighRated = b.games.filter(
                    (game) => game.rating >= 8
                ).length
                return bHighRated - aHighRated
            })

        return sortedYears
    }, [games])

    return (
        <>
            <button className="btn btn-primary" onClick={() => setShow(true)}>
                Stats for nerds
            </button>
            <Modal show={show} onHide={() => setShow(false)} fullscreen>
                <Modal.Header closeButton>
                    <Modal.Title>Stats for nerds</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex justify-content-center">
                    <div className="d-flex gap-5">
                        <div>
                            <table className="w-100">
                                <tbody>
                                    {stats.map(({ key, value }, i) => {
                                        return (
                                            <tr
                                                key={key}
                                                className={`lh-lg ${i !== stats.length - 1 ? 'border-bottom' : ''}`}
                                            >
                                                <td className="w-50">{key}</td>
                                                <td>{value}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>

                            <hr />

                            <Bar
                                data={ratingCountsData}
                                options={chartOptions}
                            />
                        </div>

                        <div className="h-100 border-1 border-start border-white" />

                        <div>
                            <h3 className="mb-4">Top developers</h3>
                            <table className="">
                                <thead>
                                    <tr>
                                        <th>Developer</th>
                                        <th className="pe-4">Average Rating</th>
                                        <th>Games Rated 7+</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {developers.slice(0, 5).map((dev) => {
                                        const average =
                                            dev.games.reduce(
                                                (sum, game) =>
                                                    sum + game.rating,
                                                0
                                            ) / dev.games.length
                                        const highRatedGames = dev.games
                                            .filter((game) => game.rating >= 7)
                                            .map((game) => game.title)
                                        return (
                                            <tr
                                                key={dev.name}
                                                className="lh-lg border-bottom"
                                            >
                                                <td className="pe-4">
                                                    {dev.name}
                                                </td>
                                                <td className="text-center">
                                                    {average.toFixed(2)}
                                                </td>
                                                <td
                                                    className="py-2"
                                                    style={{
                                                        maxWidth: '400px',
                                                    }}
                                                >
                                                    {highRatedGames.join(', ')}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="h-100 border-1 border-start border-white" />

                        <div>
                            <h3 className="mb-4">Top years</h3>
                            <table className="">
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Games Rated 8+</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {years.slice(0, 5).map((year) => {
                                        const highRatedGames = year.games
                                            .filter((game) => game.rating >= 8)
                                            .map((game) => game.title)
                                        return (
                                            <tr
                                                key={year.year}
                                                className="lh-lg border-bottom"
                                            >
                                                <td className="pe-4">
                                                    {year.year}
                                                </td>
                                                <td
                                                    className="py-2"
                                                    style={{
                                                        maxWidth: '400px',
                                                    }}
                                                >
                                                    {highRatedGames.join(', ')}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <button
                        className="btn btn-light"
                        onClick={() => setShow(false)}
                    >
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
