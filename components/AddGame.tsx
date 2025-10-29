'use client'

import { addNewGameAction, getIgdbToken, searchIgdbAction } from "app/actions"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"


async function addGame(id: number, authToken: string) {
    const formData = new FormData()
    formData.append('gameId', id.toString())
    formData.append('authToken', authToken)
    const res = await addNewGameAction(formData)
    if (res) {
        toast.success('Game added ')
    } else {
        toast.error('Adding game failed')
    }
}

async function searchIgdb(searchTerm: string, authToken: string) {
    const formData = new FormData()
    formData.append('searchTerm', searchTerm)
    formData.append('authToken', authToken)
    const res = await searchIgdbAction(formData)
    if (res) {
        toast.success('searched ')
    } else {
        toast.error('searched failed')
    }
    return res
}


const AddGame = () => {
    const [token, setToken] = useState<string>('')
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [options, setOptions] = useState<GameOptions[]>([])

    useEffect(() => {
        async function fetchToken() {
            const tokenRes = await getIgdbToken(new FormData())
            setToken(tokenRes)
        }

        fetchToken()
    }, [])

    const handleSearch = async () => {
        const res = await searchIgdb(searchTerm, token)
        setOptions(res || [])
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div>
                <div style={{ marginTop: '2em' }}>
                    <div>
                        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <button
                            onClick={() => handleSearch()}
                            disabled={!token}
                        >
                            Search gaems
                        </button>
                    </div>

                    {options.map((x, i) => {
                        const years = x.release_dates?.map(x => x.y) || []
                        const initialYear = Math.min(...years)
                        return (
                            <div key={i}>
                                <a
                                    href={x.url}
                                    target='_blank'
                                    rel='noreferrer'
                                    style={{ marginRight: '0.5em' }}
                                >{`${x.name} (${initialYear})`}</a>
                                <button onClick={() => addGame(x.id, token)}>Add to db</button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default AddGame