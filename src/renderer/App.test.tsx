import * as React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { initStore } from './app/store'
import App from './App'
import { initialState } from './features/backuper/backuperSlice'

test('renders learn react link', () => {
  const { getByText } = render(
    <Provider store={initStore(initialState, (channel, msg) => undefined)}>
      <App />
    </Provider>,
  )

  expect(getByText(/learn/i)).toBeInTheDocument()
})
