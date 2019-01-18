import React, { useReducer, useContext } from "react"
import { reducer, initialState } from "./reducer"

const augmentDispatch = (dispatch, state) => input =>
  input instanceof Function
    ? input(augmentDispatch(dispatch, state), state)
    : dispatch(input)

const Store = React.createContext()

const useStore = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  return { state, dispatch: augmentDispatch(dispatch, state) }
}

export const connect = ({
  mapStateToProps = () => {},
  mapDispatchToProps = () => {}
} = {}) => WrappedComponent => {
  return props => {
    const { dispatch, state } = useContext(Store)
    const withStateProps = {
      ...props,
      ...mapStateToProps(state, props)
    }
    return (
      <WrappedComponent
        dispatch={dispatch}
        {...withStateProps}
        {...mapDispatchToProps(dispatch, withStateProps)}
      />
    )
  }
}

export const Provider = ({ children }) => {
  const store = useStore()
  return <Store.Provider value={store}>{children}</Store.Provider>
}

export default Store
