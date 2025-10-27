import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

type TextSize = 'large' | 'x-large' | 'xx-large' | 'medium'

export const useTextareaScaling = (
    textareaRef: React.RefObject<HTMLTextAreaElement | null>,
    content: string
) => {
    const [fontSize, setFontSize] = useState<TextSize>('xx-large')
    const sizes: TextSize[] = useMemo(() => ['xx-large', 'x-large', 'large', 'medium'], [])
    const fontSizeRef = useRef<TextSize>(fontSize)

    useLayoutEffect(() => {
        const textarea = textareaRef.current
        if (!textarea) return

        // Try sizes from largest -> smallest until content fits
        let finalSize: TextSize = sizes[sizes.length - 1]
        for (let i = 0; i < sizes.length; i++) {
            textarea.style.fontSize = sizes[i]
            // reading scrollHeight forces layout so measurement is accurate
            if (textarea.scrollHeight <= textarea.clientHeight) {
                finalSize = sizes[i]
                break
            }
        }
    }, [content, sizes, textareaRef])

    useEffect(() => {
        setFontSize(fontSizeRef.current)
    }, [fontSizeRef])

    return fontSize
}