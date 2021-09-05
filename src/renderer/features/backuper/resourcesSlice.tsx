/* eslint-disable no-param-reassign */
import {
  AnyAction, createSlice, createStore, Dispatch, PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { Order, Data } from './Resources'

export type State = {
  order: Order
  orderBy: keyof Data
  selected: string[]
  page: number
  dense: boolean
  rowsPerPage: number
}

// function k(params:[State, Dispatch<AnyAction>]) {
//   return undefined
// }

// setOrder,
// setOrderBy,
// setSelected,
// setPage,
// setDense,
// setRowsPerPage,

export const initialState: State = {
  order: 'asc',
  orderBy: 'name',
  selected: [],
  page: 0,
  dense: false,
  rowsPerPage: 5,
}

export const resourceSlice = createSlice({
  name: 'resource',
  initialState: initialState,
  reducers: {
    setOrder: (state, action: PayloadAction<Order>) => {
      state.order = action.payload
    },
    setOrderBy: (state, action: PayloadAction<keyof Data>) => {
      state.orderBy = action.payload
    },
    setSelected: (state, action: PayloadAction<string[]>) => {
      state.selected = action.payload
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },
    setDense: (state, action: PayloadAction<boolean>) => {
      state.dense = action.payload
    },
    setRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload
    },
  },
})
const {
  setOrder, setOrderBy, setSelected, setPage, setDense, setRowsPerPage,
} = resourceSlice.actions
// export const select = (state: RootState) => state.backuper.status
// const wrapperDispatch = () => createStore(resourceSlice.reducer).dispatch
// const x = wrapperDispatch()
// wrapperDispatch
// type Disp = Dispatch<AnyAction>
