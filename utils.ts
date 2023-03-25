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
