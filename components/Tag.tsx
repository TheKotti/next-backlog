import styles from '../styles/GameTable.module.css'

const getHue = (value: string) => {

    switch (value) {
        case 'horror':
            return 0
        case 'stealth':
            return 260
        case 'shooter':
            return 190
        case 'puzzle':
            return 110
        case 'weird':
            return 300
        case 'action':
            return 20
    }

    const length = value.length
    const charCode1 = value.charCodeAt(0);
    const charCode2 = value.charCodeAt(1);
    var randomizedHue = Math.floor((Math.abs(Math.sin((charCode1 - charCode2 - 3) / length) * 360)));
    return randomizedHue
}

export const Tag = ({ value, onClick }: { value: string, onClick?: () => any }) => {
    const length = value.length
    const charCode1 = value.charCodeAt(0)
    const charCode2 = value.charCodeAt(1)
    var hue = getHue(value)
    console.log(hue)
    return (
        <span
            style={{
                backgroundColor: `hsl(${hue}, 70%, 65%)`,
                textTransform: `${length <= 3 ? 'uppercase' : 'capitalize'}`,
            }}
            className={`${styles['tag']}`}
            role='button'
            onClick={onClick}
        >
            {value}
        </span>)
}