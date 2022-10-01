import React from 'react'

import styles from '../styles/ScoreIndicator.module.css'

const options = [
  { value: 1, color: '#ff0000' },
  { value: 2, color: '#ff6600' },
  { value: 3, color: '#ff9933' },
  { value: 4, color: '#ffff00' },
  { value: 5, color: '#ccff66' },
  { value: 6, color: '#99ff66' },
  { value: 7, color: '#66ff66' },
  { value: 8, color: '#00ff00' },
  { value: 9, color: '#00ff99' },
  { value: 10, color: '#00ffcc' },
]

type Props = {
  rating: number | null
}

export const ScoreIndicator = (props: Props) => {
  const { rating } = props

  if (!rating) return null

  return (
    <div className={`${styles.wrapper}`}>
      <div
        className={`${styles.sector}`}
        style={{
          transform: 'rotate(108deg) skew(54deg)',
          backgroundColor: rating >= options[0].value ? options[0].color : 'transparent',
        }}
      ></div>
      <div
        className={`${styles.sector}`}
        style={{
          transform: 'rotate(144deg) skew(54deg)',
          backgroundColor: rating >= options[1].value ? options[1].color : 'transparent',
        }}
      ></div>
      <div
        className={`${styles.sector}`}
        style={{
          transform: 'rotate(180deg) skew(54deg)',
          backgroundColor: rating >= options[2].value ? options[2].color : 'transparent',
        }}
      ></div>
      <div
        className={`${styles.sector}`}
        style={{
          transform: 'rotate(216deg) skew(54deg)',
          backgroundColor: rating >= options[3].value ? options[3].color : 'transparent',
        }}
      ></div>
      <div
        className={`${styles.sector}`}
        style={{
          transform: 'rotate(252deg) skew(54deg)',
          backgroundColor: rating >= options[4].value ? options[4].color : 'transparent',
        }}
      ></div>
      <div
        className={`${styles.sector}`}
        style={{
          transform: 'rotate(288deg) skew(54deg)',
          backgroundColor: rating >= options[5].value ? options[5].color : 'transparent',
        }}
      ></div>
      <div
        className={`${styles.sector}`}
        style={{
          transform: 'rotate(324deg) skew(54deg)',
          backgroundColor: rating >= options[6].value ? options[6].color : 'transparent',
        }}
      ></div>
      <div
        className={`${styles.sector}`}
        style={{
          transform: 'rotate(0deg) skew(54deg)',
          backgroundColor: rating >= options[7].value ? options[7].color : 'transparent',
        }}
      ></div>
      <div
        className={`${styles.sector}`}
        style={{
          transform: 'rotate(36deg) skew(54deg)',
          backgroundColor: rating >= options[8].value ? options[8].color : 'transparent',
        }}
      ></div>
      <div
        className={`${styles.sector}`}
        style={{
          transform: 'rotate(72deg) skew(54deg)',
          backgroundColor: rating >= options[9].value ? options[9].color : 'transparent',
        }}
      ></div>

      <div className={`${styles.innerCircle}`}>{rating}</div>
    </div>
  )
}
