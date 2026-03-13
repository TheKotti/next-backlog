'use client'

import React, { useMemo, useState } from 'react'
import { Modal, Tab, Tabs } from 'react-bootstrap'
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
import styles from '../styles/StatsDialog.module.css'
import { getYears, getStats, getDevelopers, getTags } from '../utils/stats'

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
    const stats = useMemo(() => getStats(games), [games])

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

    const displayedDevs = 5
    const developers = useMemo(() => getDevelopers(games), [games])

    const displayedTags = 5
    const tags = useMemo(() => getTags(games), [games])

    const displayedYears = 5
    const years = useMemo(() => getYears(games), [games])

    return (
        <>
            <button className="btn btn-primary" onClick={() => setShow(true)}>
                Stats for nerds
            </button>
            <Modal show={show} onHide={() => setShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Stats for nerds</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* tab titles should be yellow text instead of a yellow background */}
                    <Tabs defaultActiveKey="stats">
                        <Tab
                            title={
                                <span className={styles['tab-title']}>
                                    Stats
                                </span>
                            }
                            eventKey="stats"
                        >
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
                        </Tab>

                        <Tab
                            title={
                                <span className={styles['tab-title']}>
                                    Developers
                                </span>
                            }
                            eventKey="developers"
                        >
                            <table className="">
                                <thead>
                                    <tr>
                                        <th>Developer</th>
                                        <th className="py-2 pe-4">
                                            Average Rating
                                        </th>
                                        <th>Games Rated 7+</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {developers
                                        .slice(0, displayedDevs)
                                        .map((dev) => {
                                            const average =
                                                dev.games.reduce(
                                                    (sum, game) =>
                                                        sum + game.rating,
                                                    0
                                                ) / dev.games.length
                                            const highRatedGames = dev.games
                                                .filter(
                                                    (game) => game.rating >= 7
                                                )
                                                .map((game) => game.title)
                                            return (
                                                <tr
                                                    key={dev.name}
                                                    className="lh-lg border-top"
                                                >
                                                    <td>{dev.name}</td>
                                                    <td>
                                                        {average.toFixed(2)}
                                                    </td>
                                                    <td>
                                                        {highRatedGames.join(
                                                            ', '
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                </tbody>
                            </table>
                        </Tab>

                        <Tab
                            title={
                                <span className={styles['tab-title']}>
                                    Tags
                                </span>
                            }
                            eventKey="tags"
                        >
                            <table className="">
                                <thead>
                                    <tr>
                                        <th>Tag</th>
                                        <th className="py-2 pe-4">
                                            Average Rating
                                        </th>
                                        <th>Games Rated 9+</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tags.slice(0, displayedTags).map((tag) => {
                                        const average =
                                            tag.games.reduce(
                                                (sum, game) =>
                                                    sum + game.rating,
                                                0
                                            ) / tag.games.length
                                        const highRatedGames = tag.games
                                            .filter((game) => game.rating >= 9)
                                            .map((game) => game.title)
                                        return (
                                            <tr
                                                key={tag.name}
                                                className="lh-lg border-top"
                                            >
                                                <td>{tag.name}</td>
                                                <td>{average.toFixed(2)}</td>
                                                <td>
                                                    {highRatedGames.join(', ')}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </Tab>

                        <Tab
                            title={
                                <span className={styles['tab-title']}>
                                    Years
                                </span>
                            }
                            eventKey="years"
                        >
                            <table className="">
                                <thead>
                                    <tr>
                                        <th className="py-2">Year</th>
                                        <th>Games Rated 8+</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {years
                                        .slice(0, displayedYears)
                                        .map((year) => {
                                            const highRatedGames = year.games
                                                .filter(
                                                    (game) => game.rating >= 8
                                                )
                                                .map((game) => game.title)
                                            return (
                                                <tr
                                                    key={year.year}
                                                    className="lh-lg border-top"
                                                >
                                                    <td className="pe-4">
                                                        {year.year}
                                                    </td>
                                                    <td className="py-2">
                                                        {highRatedGames.join(
                                                            ', '
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                </tbody>
                            </table>
                        </Tab>
                    </Tabs>
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
