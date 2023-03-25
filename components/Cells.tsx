import dayjs from 'dayjs'
import React from 'react'
import styles from '../styles/GameTable.module.css'
import { VodDialog } from './VodDialog'

export const CommentCell = ({ value }) => {
  return <span dangerouslySetInnerHTML={{ __html: value.replace(/\n/g, '<br />') }}></span>
}

export const DateCell = ({ value, row }) => {
  if (row.original['finished'] === 'Happening') return <span>Ongoing or soon™</span>

  const formattedDate = value ? dayjs(new Date(value)).format('DD MMM YYYY') : ''
  return <span>{formattedDate}</span>
}

export const CheckmarkCell = ({ value }) => {
  return <span style={{ fontFamily: 'Noto Color Emoji' }}>{value ? '✔️' : ''}</span>
}

export const VodCell = ({ value, row }) => {
  if (row.original.vods) {
    const links = row.original.vods.map((vod, index) => {
      return (
        <a key={vod} href={vod}>
          Part {index + 1}
        </a>
      )
    })
    return <div className={`${styles['vodCell']}`}>{links}</div>
  }
  return <span style={{ fontFamily: 'Noto Color Emoji' }}>{value ? 'Vods soon' : 'Not streamed'}</span>
}

export const TitleCell = ({ value, row }) => {
  return (
    <div>
      {`${value}${row.original.releaseYear ? ' (' + row.original.releaseYear + ')' : ''}`}
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

export const FinishedCell = ({ value, row }) => {
  if (row.original.finished === 'Nope') return <>Did not finish {`(${value}h)`}</>
  if (row.original.finished === 'Yes') return <>Finished {`(${value}h)`}</>

  const wordArray = row.original.finished.split(/(\/)/)
  const withWordBreaks = wordArray.map((x, i) => {
    return (
      <React.Fragment key={i}>
        {x}
        <wbr />
      </React.Fragment>
    )
  })

  return value ? (
    <>
      {withWordBreaks} {`(${value}h)`}
    </>
  ) : null
}

export const AdminCell = ({ value, row }) => {
  return (
    <div className={`${styles['adminCell']}`}>
      <a href={`/recap?id=${value}`}>Recap</a>

      <VodDialog game={row.original} />
    </div>
  )
}
