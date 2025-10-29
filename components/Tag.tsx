import styles from '../styles/GameTable.module.css'

export const Tag = ({ value }: { value: string }) => {
    const length = value.length
    const charCode = value.charCodeAt(2) || 123;
    const hex = Math.floor((Math.abs(Math.sin(length * charCode) * 16777215))).toString(16);
    const paddedHex = hex.padEnd(6, '0');
    var contrastColor = getContrastColor(paddedHex);
    return (
        <span
            style={{
                backgroundColor: `#${paddedHex}`,
                color: `${contrastColor.text}`,
                borderColor: `grey`,

            }}
            className={`${styles['tag']}`}
        >
            {value}
        </span>)
}

const getContrastColor = (hexColor: string) => {
    const rgbColor = hexToRgb(hexColor)

    if (!rgbColor) {
        return { text: '#000000' } // default to black if conversion fails
    }

    const original = [rgbColor.r, rgbColor.g, rgbColor.b];
    var calculated: number[] = []

    // Magic numebers from w3 guidelines: https://www.w3.org/TR/WCAG20/#relativeluminancedef
    original.forEach(c => {
        let color = c / 255;
        if (color <= 0.04045) {
            color = color / 12.92
        } else {
            color = Math.pow((color + 0.055) / 1.055, 2.4)
        }
        calculated.push(color)
    });

    const luminance = 0.2126 * calculated[0] + 0.7152 * calculated[1] + 0.0722 * calculated[2]

    // Actual limit is 0.179, but lower value works better in practice
    if (luminance > 0.15) {
        return { text: '#000000' }
    } else {
        return { text: '#FFFFFF' }
    }
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null
}