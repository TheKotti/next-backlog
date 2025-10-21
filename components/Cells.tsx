import React from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'

import { VodDialog } from './VodDialog'
import styles from '../styles/GameTable.module.css'
import CoverImage from './CoverImage'

export const CommentCell = ({ getValue, row }) => {
  const valueWithStealth = row.original.stealth
    ? getValue() + `\n- Sneaky <span class=${styles['color-icon']}>✔️</span>`
    : getValue()
  return (
    <span
      dangerouslySetInnerHTML={{ __html: valueWithStealth.replace(/\n/g, `<div class="${styles['br-div']}"></div>`) }}
    ></span>
  )
}

export const DateCell = ({ getValue, row }) => {
  let dateValue = ""
  if (row.original['finished'] === 'Happening') {
    dateValue = "Ongoing or soon™"
  } else {
    dateValue = getValue() ? dayjs(new Date(getValue())).format('DD MMM YYYY') : ''
  }

  return <span className='d-flex w-100 text-center'>{dateValue}</span>
}

export const CheckmarkCell = ({ getValue }) => {
  return <span className={styles['color-icon']}>{getValue() ? '✔️' : ''}</span>
}

export const VodCell = ({ getValue, row }) => {
  if (row.original.vods) {
    const links = row.original.vods.map((vod: string, index: number) => {
      if (vod.includes(';')) {
        const [link, title] = vod.split(';')
        return (
          <a key={link} href={link} className='mt-2'>
            {title}
          </a>
        )
      }
      return (
        <a key={vod} href={vod} className='text-nowrap'>
          Part {index + 1}
        </a>
      )
    })
    return (
      <u>
        <div className='d-flex flex-column text-center'>
          {links}
        </div>
      </u>
    )
  }
  return (
    <span className='d-flex text-info text-opacity-75 text-center'>
      {getValue() ? 'No vods available' : 'Not streamed'}
    </span>
  )
}

export const TitleCell = ({ getValue, row, showCovers }) => {
  if (showCovers) {
    return <CoverImage game={row.original as Game} />
  }
  return (
    <div>
      {`${getValue()}${row.original.releaseYear ? ' (' + row.original.releaseYear + ')' : ''}`}
      <a
        href={row.original.igdbUrl}
        target='_blank'
        rel='noreferrer'
        style={{ fontFamily: 'Noto Color Emoji' }}
        className='d-inline-flex ms-1'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='12'
          height='12'
          fill='currentColor'
          className='bi bi-box-arrow-up-right'
          viewBox='0 0 16 16'
        >
          <path d='M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z' />
          <path d='M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z' />
        </svg>
      </a>
    </div>
  )
}

export const FinishedCell = ({ getValue, row }) => {
  let timeSpent = getValue()

  let finishValue = "";
  if (row.original.finished === 'Nope') {
    finishValue = `Did not finish`
  } else if (row.original.finished === 'Yes') {
    finishValue = `Finished`
  } else {
    const wordArray = row.original.finished.split(/(\/)/)
    finishValue = wordArray.map((x, i) => {
      return (
        <React.Fragment key={i}>
          {x}
          <wbr />
        </React.Fragment>
      )
    })
  }

  return timeSpent ? (
    <>{finishValue}&nbsp;{`(${timeSpent}h)`}</>
  ) : null
}

export const AdminCell = ({ getValue, row, showVodButton = false, showNextButton = false }) => {
  const setUpcoming = () => {
    axios
      .put('api/setUpcoming', { id: row.original._id })
      .then((_res) => {
        toast.success('Game set as upcoming 👌')
      })
      .catch((err) => {
        toast.error('Save failed')
        console.log('ERROR: ', err)
      })
  }

  return (
    <div className={`${styles['adminCell']}`}>
      <a href={`/recap?id=${getValue()}`}>Recap</a>

      {showVodButton && <VodDialog game={row.original} />}

      {showNextButton && (
        <a href='#' onClick={setUpcoming}>
          Set upcoming
        </a>
      )}
    </div>
  )
}
