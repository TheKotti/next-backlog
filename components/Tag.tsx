import styles from '../styles/GameTable.module.css'

export const Tag = ({ value, onClick }: { value: string, onClick: () => any }) => {
    const length = value.length
    const charCode = value.charCodeAt(0);
    var hue = `(${Math.floor((Math.abs(Math.sin(charCode / length) * 360)))}`;
    return (
        <span
            style={{
                backgroundColor: `hsl${hue}, 65%, 65%)`,
                textTransform: `${length <= 3 ? 'uppercase' : 'capitalize'}`,
            }}
            className={`${styles['tag']}`}
            role='button'
            onClick={onClick}
        >
            {value}
        </span>)
}