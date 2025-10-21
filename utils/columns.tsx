import { ColumnDef } from '@tanstack/react-table'
import { AdminCell, CommentCell, DateCell, FinishedCell, TitleCell, VodCell } from '../components/Cells'
import { ScoreIndicator } from '../components/ScoreIndicator'
import { dateSort, scoreSort } from './utils'

export const gameTableColumns: ColumnDef<Game>[] = [
  {
    header: 'Date',
    accessorKey: 'finishedDate',
    sortDescFirst: true,
    cell: ({ getValue, row }) => DateCell({ getValue, row }),
    sortingFn: dateSort,
  },
  {
    header: 'Game',
    accessorKey: 'title',
    cell: ({ getValue, row }) => TitleCell({ getValue, row, showCovers: true }),
  },
  {
    header: 'Rating',
    accessorKey: 'rating',
    sortDescFirst: true,
    cell: ({ getValue }) => {
      var value = getValue()
      return <ScoreIndicator rating={value as (number | null)} />
    },
    sortingFn: scoreSort,
  },
  {
    header: 'Comments',
    accessorKey: 'comment',
    cell: ({ getValue, row }) => CommentCell({ getValue, row }),
    enableSorting: false,
  },
  {
    header: 'Finished',
    accessorKey: 'timeSpent',
    sortDescFirst: true,
    cell: FinishedCell,
  },
  {
    header: 'Vods',
    accessorKey: 'streamed',
    enableSorting: false,
    cell: VodCell,
  },
  {
    header: 'Admin',
    accessorKey: '_id',
    enableSorting: false,
    cell: ({ getValue, row }) => AdminCell({ getValue, row, showVodButton: true }),
  },
]
