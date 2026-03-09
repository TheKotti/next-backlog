import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import DatePicker from 'react-datepicker'
import dayjs from 'dayjs'
import { deleteGameAction, updateCoverArtAction } from 'app/actions'
import { toast } from 'react-toastify'

async function deleteGame(id: string) {
    if (confirm('Are you sure you want to delete the game?')) {
        const formData = new FormData()
        formData.append('id', id.toString())
        const res = await deleteGameAction(formData)
        if (res) {
            toast.success('Game deleted ')
            setTimeout(() => window.location.replace('/admin'), 2000)
        } else {
            toast.error('Deleting game failed')
        }
    }
}

async function updateCover(id: string, file: File) {
    // convert file to data URL string for Cloudinary upload
    const reader = new FileReader()
    reader.onload = async () => {
        const imgString = reader.result as string
        const formData = new FormData()
        formData.append('id', id.toString())
        formData.append('img', imgString)
        formData.append(
            'imgName',
            file.name.replaceAll(' ', '').replaceAll('.', '')
        )
        const res = await updateCoverArtAction(formData)
        if (res) {
            toast.success('Cover updated')
        } else {
            toast.error('Updating cover failed')
        }
    }
    reader.readAsDataURL(file)
}

type Props = {
    game: Game
    setGame: (game: Game) => void
}

export const DetailsDialog = (props: Props) => {
    const { game, setGame } = props
    const [show, setShow] = useState(false)

    const handleDevChange = (value: string) => {
        const devs = value.split(',')
        setGame({ ...game, developers: devs })
    }

    return (
        <>
            <button onClick={() => setShow(true)}>Details</button>
            <Modal
                show={show}
                onHide={() => setShow(false)}
                centered
                id="detailsDialog"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex flex-column gap-3">
                    <div>
                        <DatePicker
                            selected={
                                game.finishedDate
                                    ? dayjs(game.finishedDate).toDate()
                                    : null
                            }
                            onChange={(date) =>
                                setGame({
                                    ...game,
                                    finishedDate: date?.toISOString() || null,
                                })
                            }
                            placeholderText="Finished date"
                            isClearable
                        />
                    </div>

                    <div>
                        <label htmlFor="streamed" className="me-2">
                            Streamed?
                        </label>
                        <input
                            name="streamed"
                            type="checkbox"
                            checked={game.streamed || false}
                            onChange={(e) =>
                                setGame({ ...game, streamed: e.target.checked })
                            }
                        ></input>
                    </div>

                    <div>
                        <label htmlFor="releaseYear" className="me-2">
                            Release Year
                        </label>
                        <input
                            name="releaseYear"
                            type="number"
                            value={game.releaseYear || ''}
                            onChange={(e) =>
                                setGame({
                                    ...game,
                                    releaseYear: e.target.value
                                        ? parseInt(e.target.value)
                                        : null,
                                })
                            }
                        />
                    </div>

                    <div>
                        <label htmlFor="title" className="me-2">
                            Title
                        </label>
                        <input
                            name="title"
                            type="string"
                            value={game.title || ''}
                            onChange={(e) =>
                                setGame({
                                    ...game,
                                    title: e.target.value ? e.target.value : '',
                                })
                            }
                        />
                    </div>

                    <div>
                        <label htmlFor="url" className="me-2">
                            Url
                        </label>
                        <input
                            name="url"
                            type="string"
                            value={game.igdbUrl || ''}
                            onChange={(e) =>
                                setGame({
                                    ...game,
                                    igdbUrl: e.target.value
                                        ? e.target.value
                                        : '',
                                })
                            }
                        />
                    </div>

                    <div>
                        <label htmlFor="devs" className="me-2">
                            Developer
                        </label>
                        <input
                            name="devs"
                            type="string"
                            value={game.developers.join(',') || ''}
                            onChange={(e) => handleDevChange(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="cover" className="me-2">
                            Cover image (max 1MB)
                        </label>
                        <input
                            type="file"
                            id="cover"
                            accept=".png,.jpg,.jpeg"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (game._id && file) {
                                    updateCover(game._id, file)
                                }
                            }}
                        />
                    </div>

                    <div>
                        <button
                            className="btn btn-danger"
                            onClick={() => game._id && deleteGame(game._id)}
                        >
                            Delete
                        </button>
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
