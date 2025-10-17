import { AdminCell, CommentCell, DateCell, FinishedCell, TitleCell, VodCell } from '../components/Cells'
import { ScoreIndicator } from '../components/ScoreIndicator'
import { dateSort, scoreSort } from './utils'

export const gameTableColumns = [
  {
    Header: 'Date',
    accessor: 'finishedDate',
    sortDescFirst: true,
    Cell: DateCell,
    sortType: dateSort,
  },
  {
    Header: 'Game',
    accessor: 'title',
    Cell: ({ value, row, showCovers }) => TitleCell({ value, row, showCovers }),
  },
  {
    Header: 'Rating',
    accessor: 'rating',
    sortDescFirst: true,
    Cell: ({ value }) => {
      return <ScoreIndicator rating={value} />
    },
    sortType: scoreSort,
  },
  {
    Header: 'Comments',
    accessor: 'comment',
    Cell: ({ value, row }) => CommentCell({ value, row }),
    disableSortBy: true,
  },
  {
    Header: 'Finished',
    accessor: 'timeSpent',
    sortDescFirst: true,
    Cell: FinishedCell,
  },
  {
    Header: 'Vods',
    accessor: 'streamed',
    disableSortBy: true,
    Cell: VodCell,
  },
  {
    Header: 'Admin',
    accessor: '_id',
    disableSortBy: true,
    Cell: ({ value, row }) => AdminCell({ value, row, showVodButton: true }),
  },
]

export const backlogTableColumns = [
  {
    Header: 'Game',
    accessor: 'title',
    Cell: TitleCell,
  },
  {
    Header: 'Howlongtobeat',
    accessor: 'hltbString',
  },
  {
    Header: 'Admin',
    accessor: '_id',
    disableGlobalFilter: true,
    disableSortBy: true,
    Cell: ({ value, row }) => AdminCell({ value, row, showNextButton: true }),
  },
]
