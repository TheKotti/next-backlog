export function getYears(games: Game[]) {
    // dedupe by title, preferring most recent finishedDate
    const uniqueByTitle: Record<string, Game> = {}

    games.forEach((game) => {
        if (!game.title) return
        const existing = uniqueByTitle[game.title]
        if (existing) {
            if (
                game.finishedDate &&
                existing.finishedDate &&
                new Date(game.finishedDate) > new Date(existing.finishedDate)
            ) {
                uniqueByTitle[game.title] = game
            }
        } else {
            uniqueByTitle[game.title] = game
        }
    })

    const yearGroups: Record<number, { title: string; rating: number }[]> = {}

    Object.values(uniqueByTitle).forEach((game) => {
        if (game.rating && game.releaseYear) {
            if (!yearGroups[game.releaseYear]) {
                yearGroups[game.releaseYear] = []
            }

            yearGroups[game.releaseYear].push({
                title: game.title,
                rating: game.rating,
            })
        }
    })

    const sortedYears = Object.keys(yearGroups)
        .map((year) => ({
            year: parseInt(year),
            games: yearGroups[parseInt(year)],
        }))
        .sort((a, b) => {
            const aHighRated = a.games.filter((game) => game.rating >= 8).length
            const bHighRated = b.games.filter((game) => game.rating >= 8).length
            return bHighRated - aHighRated
        })

    return sortedYears
}

export function getStats(games: Game[]) {
    if (games.length === 0) return []
    // This filter crap shouldn't be necessary but fuck it
    const ratings = games.map((x) => x.rating).filter((x): x is number => !!x)
    const times = games.map((x) => x.timeSpent).filter((x): x is number => !!x)
    const additionalTimes = games
        .map((x) => x.additionalTimeSpent)
        .filter((x): x is number => !!x)
    const allTimes = times.concat(additionalTimes)
    const backlog = games.filter((x) => !x.finishedDate)

    const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length
    const totalTime = allTimes.reduce((a, b) => a + b, 0)
    const averageTime = totalTime / allTimes.length
    const streamedGames = games.filter((x) => x.streamed).length
    const finishedGames = games.filter(
        (x) => x.finished && x.finished !== 'Nope' && x.finished !== 'Happening'
    ).length
    const backlogLength = backlog.length
    const playedGamesLength = games.filter(
        (x) => x.finishedDate && x.finished !== 'Happening'
    ).length
    const backlogTime = backlog
        .map((x) => x.hltbMain)
        .filter((x) => x)
        .reduce((a, b) => (a || 0) + (b || 0), 0)

    return [
        {
            key: 'Average rating',
            value: averageRating.toFixed(2),
        },
        {
            key: 'Average game length',
            value: `${averageTime.toFixed(2)} hours`,
        },
        {
            key: 'Total time spent',
            value: `${totalTime} hours`,
        },
        {
            key: 'Streamed games',
            value: `${streamedGames}`,
        },
        {
            key: 'Finishing rate',
            value: `${Math.floor((finishedGames / playedGamesLength) * 100)}%`,
        },
        {
            key: 'Played games',
            value: `${playedGamesLength}`,
        },
        {
            key: 'Games in backlog',
            value: `${backlogLength}`,
        },
        {
            key: 'Backlog time estimate',
            value: `${backlogTime} hours`,
        },
    ]
}

export function getDevelopers(games: Game[]) {
    const developerGames: Record<
        string,
        { title: string; rating: number; finishedDate?: string }[]
    > = {}

    games.forEach((game) => {
        if (
            game.developers?.length &&
            game.rating &&
            !game.tags?.includes('expansion')
        ) {
            game.developers.forEach((dev) => {
                if (!developerGames[dev]) {
                    developerGames[dev] = []
                }
                if (game.rating) {
                    const existingGame = developerGames[dev].find(
                        (g) => g.title === game.title
                    )
                    if (existingGame) {
                        // Update rating if the new finishedDate is more recent
                        if (
                            game.finishedDate &&
                            existingGame.finishedDate &&
                            new Date(game.finishedDate) >
                                new Date(existingGame.finishedDate)
                        ) {
                            existingGame.rating = game.rating
                            existingGame.finishedDate = game.finishedDate
                        }
                    } else {
                        developerGames[dev].push({
                            title: game.title,
                            rating: game.rating,
                            finishedDate: game.finishedDate!,
                        })
                    }
                }
            })
        }
    })

    Object.keys(developerGames).forEach((dev) => {
        if (developerGames[dev].length < 4) {
            delete developerGames[dev]
        }
    })

    const developerStats = Object.keys(developerGames)
        .map((dev) => {
            const games = developerGames[dev]
            return {
                name: dev,
                games: games.sort((a, b) => b.rating - a.rating),
            }
        })
        .sort((a, b) => {
            const avgA =
                a.games.reduce((sum, game) => sum + game.rating, 0) /
                a.games.length
            const avgB =
                b.games.reduce((sum, game) => sum + game.rating, 0) /
                b.games.length
            return avgB - avgA
        })

    return developerStats
}

export function getTags(games: Game[]) {
    const tagGames: Record<
        string,
        { title: string; rating: number; finishedDate?: string }[]
    > = {}

    games.forEach((game) => {
        if (
            game.tags?.length &&
            game.rating &&
            !game.tags?.includes('expansion')
        ) {
            game.tags.forEach((tag) => {
                if (!tagGames[tag]) {
                    tagGames[tag] = []
                }
                if (game.rating) {
                    const existingGame = tagGames[tag].find(
                        (g) => g.title === game.title
                    )
                    if (existingGame) {
                        // Update rating if the new finishedDate is more recent
                        if (
                            game.finishedDate &&
                            existingGame.finishedDate &&
                            new Date(game.finishedDate) >
                                new Date(existingGame.finishedDate)
                        ) {
                            existingGame.rating = game.rating
                            existingGame.finishedDate = game.finishedDate
                        }
                    } else {
                        tagGames[tag].push({
                            title: game.title,
                            rating: game.rating,
                            finishedDate: game.finishedDate!,
                        })
                    }
                }
            })
        }
    })

    Object.keys(tagGames).forEach((tag) => {
        if (tagGames[tag].length < 4) {
            delete tagGames[tag]
        }
    })

    const tagStats = Object.keys(tagGames)
        .map((tag) => {
            const games = tagGames[tag]
            return {
                name: tag,
                games: games.sort((a, b) => b.rating - a.rating),
            }
        })
        .sort((a, b) => {
            const avgA =
                a.games.reduce((sum, game) => sum + game.rating, 0) /
                a.games.length
            const avgB =
                b.games.reduce((sum, game) => sum + game.rating, 0) /
                b.games.length
            return avgB - avgA
        })

    return tagStats
}
