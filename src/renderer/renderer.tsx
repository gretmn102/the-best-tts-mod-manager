import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './renderer.css'
import App from './App'
import { initStore } from './app/store'
import { Provider } from 'react-redux'
import * as serviceWorker from './serviceWorker'
import * as B from './features/backuper/backuperSlice'
import * as API from '../shared/API'
import * as State from '../shared/state'
import * as E from 'fp-ts/lib/Either'
import { ipcRenderer } from './ipcRenderer'
import { channel } from '../shared/API'
import { parse } from './features/backuper/backuperSlice'

ipcRenderer.once(API.getStateChannel, (res:API.GetStateResult) => {
  console.log(`Resp state: ${res.toString()}`)
  let state:B.BackuperState
  const { saveState } = res
  switch (saveState[0]) {
    case State.MainT.NOT_STARTED_SAVE_FILE_YET:
      state = B.initialState
      break

    case State.MainT.SAVE_FILE_HANDLE:
      const [, xs] = saveState
      state = {
        value: '?', // TODO
        status: [B.States.RESOLVED, E.right(xs)],
      }
      break
  }

  const send = (channel:string, msg:any) => ipcRenderer.send(channel, msg)
  const store = initStore(state, send)
  ipcRenderer.on(channel, (arg:any) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Resp: ${arg}`)
    store.dispatch(parse(arg))
  })

  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
    document.getElementById('app'),
  )
})
ipcRenderer.send(API.getStateChannel, 'getStateChannel')

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
