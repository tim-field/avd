import React, { useReducer } from "react"
import { reducer, initialState } from "./reducer"

function createStore() {
  const [state, dispatch] = useReducer(reducer, initialState)
  return { state, dispatch }
}

const Store = React.createContext()

export function Provider({ children }) {
  const store = createStore()
  return <Store.Provider value={store}>{children}</Store.Provider>
}

export default Store
