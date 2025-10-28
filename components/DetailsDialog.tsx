import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import DatePicker from 'react-datepicker'
import dayjs from 'dayjs'

type Props = {
  game: Game
  setGame: (game: Game) => void
}

export const DetailsDialog = (props: Props) => {
  const { game, setGame } = props
  const [show, setShow] = useState(false)

  return (
    <>
      <button onClick={() => setShow(true)}>Details</button>
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className='d-flex flex-column gap-3'>
          <div>
            <DatePicker
              selected={game.finishedDate ? dayjs(game.finishedDate).toDate() : null}
              onChange={(date) => setGame({ ...game, finishedDate: (date?.toISOString() || null) })}
              placeholderText='Finished date'
              isClearable
            />
          </div>

          <div>
            <label htmlFor='streamed' className='me-2'>
              Streamed?
            </label>
            <input
              name='streamed'
              type='checkbox'
              checked={game.streamed || false}
              onChange={(e) => setGame({ ...game, streamed: e.target.checked })}
            ></input>
          </div>

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
