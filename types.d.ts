type Game = {
  _id?: string
  title: string
  comment: string | null
  coverImageId: string
  developers: Array<string>
  finished: string | null
  finishedDate: string | null
  igdbId: number
  igdbUrl: string
  keywords: Array<string>
  platform: string | null
  rating: number | null
  releaseYear: number | null
  timeSpent: number | null
  streamed: boolean | null
  vods: Array<string> | null
  hltbMain: number | null
  hltbExtra: number | null
  hltbCompletionist: number | null
  tags: Array<string> | null
  additionalTimeSpent: number | null
  addedDate: string | null // not nullable after db update
}

type RandomGame = Game & {
  selected?: number
}

type GameOptions = {
  id: number
  name: string
  release_dates: Array<{
    y: number
    id: number
  }>
  url: string
}
