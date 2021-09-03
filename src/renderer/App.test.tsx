import * as React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from './app/store'
import App from './App'
import { initialState } from './features/backuper/backuperSlice'

test('renders learn react link', () => {
  const { getByText } = render(
    <Provider store={store(initialState)}>
      <App />
    </Provider>,
  )

  expect(getByText(/learn/i)).toBeInTheDocument()
})
