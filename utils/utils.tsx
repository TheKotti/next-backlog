import { Cell, ColumnInstance, Row } from 'react-table'

export const getHltbString = (game: Game) => {
  const main = game.hltbMain || 0
  const extra = game.hltbExtra || 0
  const completionist = game.hltbCompletionist || 0

  if (!main) {
    return '-'
  }
  if (main === extra || completionist) {
    return `${main}h`
  }
  if (extra > 0) {
    return `${main}-${extra}h`
  }
  if (completionist > 0) {
    return `${main}-${completionist}h`
  }
  if (extra === 0 && completionist === 0) {
    return `${main}h`
  }
  return '-'
}

/*********************************************************************
 * SORTING FUNCTIONS
 *********************************************************************/
export const dateSort = (rowA, rowB, id) => {
  // I am a hack
  if (rowA.original['finished'] === 'Happening') return 1
  if (rowB.original['finished'] === 'Happening') return -1

  const a = new Date(rowA.values[id]).getTime()
  const b = new Date(rowB.values[id]).getTime()
  return a - b
}

export const scoreSort = (rowA, rowB, id) => {
  if (rowA.values[id] === rowB.values[id]) {
    return (rowB.original['title'] as string).localeCompare(rowA.original['title'] as string)
  }
  return rowA.values[id] - rowB.values[id]
}

/*********************************************************************
 * COLUMN FORMATTING
 *********************************************************************/
const COLUMN_IDS = {
  TITLE: ['title'],
  CENTERED: ['streamed', 'finishedDate', 'timeSpent', 'stealth', '_id', 'rating'],
}

export const formatCell = (cell: Cell<object, any>, row: Row<object>, props?: any) => {
  const { column } = cell
  const columnId = column.id
  const showCovers = props?.showCovers

  switch (true) {
    case COLUMN_IDS.TITLE.includes(columnId):
      return renderCellWithProps(cell, { key: columnId + row.id }, { showCovers })

    case COLUMN_IDS.CENTERED.includes(columnId):
      return renderCellWithProps(cell, {
        key: columnId + row.id,
        style: { textAlign: 'center' },
      })

    default:
      return renderCellWithProps(cell, { key: columnId + row.id })
  }
}

const renderCellWithProps = (cell: Cell<object, any>, attrs: object, props?: object) => {
  return (
    <td {...cell.getCellProps()} {...attrs}>
      {cell.render('Cell', props)}
    </td>
  )
}

/*********************************************************************
 * COLUMN HEADER FORMATTING
 *********************************************************************/
const COLUMN_HEADER_IDS = {
  CONCENCED: ['streamed', 'stealth'],
  TIME_SPENT: ['timeSpent'],
}

export const formatHeader = (column: ColumnInstance<object>, isAdmin: boolean) => {
  if (column.id === '_id' && !isAdmin) return

  switch (true) {
    case COLUMN_HEADER_IDS.CONCENCED.includes(column.id):
      return (
        <th
          {...column.getHeaderProps(() => ({
            style: {
              fontStretch: 'condensed',
              paddingLeft: '8px',
              paddingRight: '8px',
              textAlign: 'center',
            },
          }))}
          key={column.id}
        >
          {column.render('Header')}
        </th>
      )

    case COLUMN_HEADER_IDS.TIME_SPENT.includes(column.id):
      return (
        <th
          {...column.getHeaderProps(() => ({
            style: {
              fontStretch: 'condensed',
              paddingLeft: '8px',
              paddingRight: '8px',
              textAlign: 'center',
            },
            ...column.getSortByToggleProps(),
          }))}
          key={column.id}
        >
          <span className='d-flex'>
            {column.render('Header')}
            <span>{column.isSorted ? (column.isSortedDesc ? ' 🔻' : ' 🔺') : ''}</span>
          </span>
        </th>
      )

    default:
      return (
        <th {...column.getHeaderProps(column.getSortByToggleProps())} key={column.id}>
          <span className='d-flex'>
            {column.render('Header')}
            <span>{column.isSorted ? (column.isSortedDesc ? ' 🔻' : ' 🔺') : ''}</span>
          </span>
        </th>
      )
  }
}
