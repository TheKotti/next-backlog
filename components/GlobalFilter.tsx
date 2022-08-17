import { useState } from 'react'
import { useAsyncDebounce } from 'react-table'

export const GlobalFilter = ({ globalFilter, setGlobalFilter }) => {
  const [value, setValue] = useState(globalFilter)

  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined)
  }, 200)

  return (
    <input
      className='form-control w-25'
      placeholder='Search'
      value={value || ''}
      onChange={(e) => {
        setValue(e.target.value)
        onChange(e.target.value)
      }}
      style={{
        fontSize: '1.1rem',
        border: '0',
      }}
    />
  )
}
