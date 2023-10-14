import { useCallback } from 'react'
import { useRouter } from 'next/router'
import { forOwn } from 'lodash'

export const useNextQueryParams = (defaultValues: object) => {
  const router = useRouter()

  const { query: params, isReady: paramsLoaded } = router

  const updateParams = useCallback(
    (newParams: object) => {
      const updated = { ...(router.query as object), ...newParams }

      forOwn(updated, (value, key) => {
        if (defaultValues[key] === value) {
          delete updated[key]
        }
      })

      const params = new URLSearchParams(updated).toString()
      router.push(params ? `?${params}` : '', undefined, { shallow: true })
    },
    [defaultValues, router]
  )

  return { params, updateParams, paramsLoaded }
}
