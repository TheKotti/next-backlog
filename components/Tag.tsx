import styles from '../styles/GameTable.module.css'

export const Tag = ({ value }: { value: string }) => {
    const length = value.length
    const charCode = value.charCodeAt(2) || 123;
    var hue = `(${Math.floor((Math.abs(Math.sin(charCode / length) * 360)))}`;
    return (
        <span
            style={{
                backgroundColor: `hsl${hue}, 65%, 65%)`,
                textTransform: `${length <= 3 ? 'uppercase' : 'capitalize'}`,
            }}
            className={`${styles['tag']}`}
        >
            {value}
        </span>)
}