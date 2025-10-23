'use client'

import axios from 'axios'
import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'

type Props = {
  game: Game
}

export const VodDialog = (props: Props) => {
  const { game } = props

  const [show, setShow] = useState(false)
  const [textValue, setTextValue] = useState(game.vods?.join('\n') || '')

  const updateVods = () => {
    const vods = textValue ? textValue.split('\n') : null
    axios
      .put('api/vods', { id: game._id, vods })
      .then((_res) => {
        toast.success('VODS saved 👌')
      })
      .catch((err) => {
        toast.error('Save failed')
        console.log('ERROR: ', err)
      })
  }

  return (
    <>
      <a href='#' onClick={() => setShow(true)}>
        Add vods
      </a>
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add vods</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea cols={45} rows={5} value={textValue} onChange={(e) => setTextValue(e.target.value)} />
        </Modal.Body>
        <Modal.Footer>
          <button className='btn btn-light' onClick={() => updateVods()}>
            Save
          </button>
          <button className='btn btn-light' onClick={() => setShow(false)}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
