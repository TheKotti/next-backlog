import { useCallback, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { forOwn } from 'lodash'

export const useNextQueryParams = (defaultValues: Record<string, any>) => {
    const initialParams = useSearchParams()

    const defaultsRef = useRef<Record<string, any>>(defaultValues)
    useEffect(() => {
        defaultsRef.current = defaultValues
    }, [defaultValues])

    const initialObj: Record<string, string> = {}
    if (initialParams) {
        initialParams.forEach((value, key) => {
            initialObj[key] = value
        })
    }
    const currentRef = useRef<Record<string, string>>(initialObj)

    const updateParams = useCallback((newParams: Record<string, any>) => {
        const merged: Record<string, any> = { ...currentRef.current, ...newParams }

        forOwn(merged, (value, key) => {
            if (defaultsRef.current && defaultsRef.current[key] === value) {
                delete merged[key]
            }
        })

        forOwn(merged, (value, key) => {
            if (value === undefined || value === null) delete merged[key]
        })

        const entries: Record<string, string> = {}
        Object.keys(merged).forEach(k => {
            entries[k] = String(merged[k])
        })

        currentRef.current = entries

        const params = new URLSearchParams(entries).toString()
        const newUrl = params ? `?${params}` : `${window.location.pathname}${window.location.hash || ''}`
        window.history.replaceState(null, '', newUrl)
    }, [])

    return { initialParams, updateParams }
}