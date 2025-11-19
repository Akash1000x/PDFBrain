import * as React from "react"

export default function useLocalStorage(key: string, defaultValue: any) {
  const [value, setValue] = React.useState(() => {
    let currentValue

    try {
      currentValue = JSON.parse(
        localStorage.getItem(key) || String(defaultValue)
      )
    } catch (error) {
      currentValue = defaultValue
    }

    return currentValue
  })

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [value, key])

  return [value, setValue]
}
