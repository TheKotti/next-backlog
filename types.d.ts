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
  notPollable: string | null // delete
  platform: string | null
  rating: number | null
  releaseYear: number | null
  stealth: boolean | null // migrate to tags
  timeSpent: number | null
  tss: boolean | null // delete
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
  title: string
  year: number
  url: string
}
