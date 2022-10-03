import React, { useMemo, useState } from 'react'
import { Modal } from 'react-bootstrap'

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
    const pollOptions = games.filter((x) => !x.notPollable && !x.finishedDate).length

    const gamesByYear = games
      .filter((x) => x.rating)
      .reduce((acc, obj) => {
        const key = obj.releaseYear || 0
        const curGroup = acc[key] ?? []

        if (key === 0) return { ...acc }
        return { ...acc, [key]: [...curGroup, obj] }
      }, {})
    const yearlyAvg = Object.entries(gamesByYear).map(([key, value]) => {
      const yearlyRatings = (value as Game[]).map((x) => x.rating)
      const avg =
        yearlyRatings.length >= 5 ? (yearlyRatings as number[]).reduce((a, b) => a + b, 0) / yearlyRatings.length : 0
      return { key, avg }
    })
    const bestYear = yearlyAvg.reduce((prev, current) => {
      return prev.avg > current.avg ? prev : current
    }).key
    const bestYearGames = games
      .filter((x) => x.rating && x.rating >= 7 && x.releaseYear?.toString() === bestYear)
      .map((x) => x.title)
      .join(', ')

    return [
      {
        key: 'Average rating',
        value: averageRating.toFixed(2),
      },
      {
        key: 'Average time spent',
        value: `${averageTime.toFixed(2)} hours`,
      },
      {
        key: 'Total time spent',
        value: `${totalTime} hours`,
      },
      {
        key: 'Streamed games',
        value: streamedGames,
      },
      {
        key: 'Finished games',
        value: finishedGames,
      },
      {
        key: 'Dropped games',
        value: droppedGames,
      },
      {
        key: 'Sneaky games',
        value: sneakyGames,
      },
      {
        key: 'Games in backlog',
        value: backlogLength,
      },
      {
        key: 'Possible poll options',
        value: pollOptions,
      },
      {
        key: 'Best year for games, objectively',
        value: `${bestYear} (${bestYearGames})`,
      },
    ]
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
