'use client'

import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { updateVodsAction } from 'app/actions'

type Props = {
  game: Game
}

export const VodDialog = (props: Props) => {
  const { game } = props

  const [show, setShow] = useState(false)
  const [textValue, setTextValue] = useState(game.vods?.join('\n') || '')

  const updateVods = async () => {
    const formData = new FormData()
    formData.append('id', game._id!)
    formData.append('vods', textValue)
    var res = await updateVodsAction(formData)
    if (res) {
      toast.success('Vods updated')
    } else {
      toast.error('Failed to update vods')
    }
  }

  return (
    <>
      <a href='#' onClick={() => setShow(true)}>
        Add vods
      </a>
      <Modal show={show} onHide={() => setShow(false)} centered id="vodDialog">
        <Modal.Header closeButton>
          <Modal.Title>Add vods</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea cols={45} rows={5} id="vodsArea" value={textValue} onChange={(e) => setTextValue(e.target.value)} />
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
