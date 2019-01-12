import React, { useReducer, useContext } from "react"
import { reducer, initialState } from "./reducer"

const Store = React.createContext()

const createStore = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  return { state, dispatch }
}

export const connect = ({
  mapStateToProps = () => {},
  mapDispatchToProps = () => {}
} = {}) => WrappedComponent => props => {
  const { dispatch, state } = useContext(Store)
  return (
    <WrappedComponent
      dispatch={dispatch}
      {...props}
      {...mapStateToProps(state, props)}
      {...mapDispatchToProps(dispatch, props)}
    />
  )
}

export const Provider = ({ children }) => {
  const store = createStore()
  return <Store.Provider value={store}>{children}</Store.Provider>
}

export default Store
