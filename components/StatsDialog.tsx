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
    const ratings = games.map((x) => x.rating).filter((x): x is number => x !== null)
    const times = games.map((x) => x.timeSpent).filter((x): x is number => x !== null)

    const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length
    const totalTime = times.reduce((a, b) => a + b, 0)
    const averageTime = totalTime / times.length
    const sneakyGames = games.filter((x) => x.stealth).length
    const streamedGames = games.filter((x) => x.streamed).length
    const finishedGames = games.filter((x) => x.finished && x.finished !== 'Nope').length
    const droppedGames = games.filter((x) => x.finished && x.finished === 'Nope').length
    const backlogLength = games.filter((x) => !x.finishedDate).length
    const playedGamesLength = games.filter((x) => x.finishedDate).length

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
        key: 'Sneaky games',
        value: `${sneakyGames}`,
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
    ]
  }, [games])

  const ratingCountsData = useMemo(() => {
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 }

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

  return (
    <>
      <button className='btn btn-primary' onClick={() => setShow(true)}>
        Stats for nerds
      </button>
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Stats for nerds</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className='w-100'>
            <tbody>
              {stats.map(({ key, value }, i) => {
                return (
                  <tr key={key} className={`lh-lg ${i !== stats.length - 1 ? 'border-bottom' : ''}`}>
                    <td className='w-50'>{key}</td>
                    <td>{value}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <hr />

          <Bar data={ratingCountsData} options={chartOptions} />
        </Modal.Body>

        <Modal.Footer>
          <button className='btn btn-light' onClick={() => setShow(false)}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
