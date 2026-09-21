import { useState, useEffect } from 'react'

const USERNAME = 'abhiishhek_k'
const CACHE_KEY = `leetcode_stats_${USERNAME}`

const DEFAULT_STATS = {
  totalSolved: 850,
  rating: 1860,
  easy: 202,
  medium: 514,
  hard: 134,
  ranking: 52200,
  loading: false,
}

export function useLeetCode(username = USERNAME) {
  const [stats, setStats] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const parsed = JSON.parse(cached)
          return { ...DEFAULT_STATS, ...parsed, loading: false }
        }
      } catch {
      }
    }
    return DEFAULT_STATS
  })

  useEffect(() => {
    let mounted = true

    async function fetchStats() {
      try {
        let newTotalSolved = stats.totalSolved
        let newRating = stats.rating
        let newEasy = stats.easy
        let newMedium = stats.medium
        let newHard = stats.hard
        let newRanking = stats.ranking

        try {
          const res = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${username}`, {
            headers: { Accept: 'application/json' },
          })
          if (res.ok) {
            const data = await res.json()
            if (typeof data.totalSolved === 'number' && data.totalSolved > 0) {
              newTotalSolved = data.totalSolved
              newEasy = data.easySolved ?? newEasy
              newMedium = data.mediumSolved ?? newMedium
              newHard = data.hardSolved ?? newHard
              if (data.ranking) newRanking = data.ranking
            }
          }
        } catch (err) {
          console.debug('LeetCode solved questions fetch note:', err)
        }

        try {
          const res = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/contest`, {
            headers: { Accept: 'application/json' },
          })
          if (res.ok) {
            const data = await res.json()
            if (data && typeof data.contestRating === 'number' && data.contestRating > 0) {
              newRating = Math.round(data.contestRating)
            }
          }
        } catch (err) {
          console.debug('LeetCode contest rating fetch note:', err)
        }

        if (mounted) {
          const updated = {
            totalSolved: newTotalSolved,
            rating: newRating,
            easy: newEasy,
            medium: newMedium,
            hard: newHard,
            ranking: newRanking,
            loading: false,
            lastFetched: Date.now(),
          }
          setStats(updated)
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(updated))
          } catch {
          }
        }
      } catch (e) {
        console.warn('Could not update live LeetCode stats, using cached values.', e)
      }
    }

    fetchStats()

    return () => {
      mounted = false
    }
  }, [username])

  return stats
}
