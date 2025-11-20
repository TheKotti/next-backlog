import { Column } from 'react-table'
import { AdminCell, CommentCell, DateCell, FinishedCell, TagCell, TitleCell, VodCell } from '../components/Cells'
import { ScoreIndicator } from '../components/ScoreIndicator'
import { dateSort, scoreSort, titleSort } from './utils'

export const gameTableColumns: Column<Partial<Game>>[] = [
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
    sortType: titleSort,
    sortDescFirst: true
  },
  {
    Header: 'Rating',
    accessor: 'rating',
    sortDescFirst: true,
    Cell: ({ value }) => {
      return <ScoreIndicator rating={(value as number | null)} />
    },
    sortType: scoreSort,
  },
  {
    Header: 'Comments',
    accessor: 'comment',
    Cell: ({ value, row, handleTagFilterChange }) => CommentCell({ value, row, handleTagFilterChange }),
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

export const backlogTableColumns: Column<Partial<Game & { hltbString: string }>>[] = [
  {
    Header: 'Game',
    accessor: 'title',
    Cell: ({ value, row }) => TitleCell({ value, row, showCovers: false }),
    sortType: titleSort,
    sortDescFirst: true
  },
  {
    Header: 'Tags',
    accessor: 'tags',
    Cell: ({ value, row, handleTagFilterChange }) => TagCell({ value, row, handleTagFilterChange }),
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
    Cell: ({ value, row }) => AdminCell({ value, row }),
  },
]
