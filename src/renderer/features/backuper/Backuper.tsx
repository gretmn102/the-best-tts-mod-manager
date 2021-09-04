import * as React from 'react'
import * as E from 'fp-ts/lib/Either'

import { useAppSelector, useAppDispatch } from '../../app/hooks'
import {
  parseSaveReq,
  selectStatus,
  States,
  parse,
  downloadResourceByIndex,
} from './backuperSlice'
import styles from './Backuper.module.css'
import * as Shared from '../../../shared/API'
import { LocalFileStateT, SaveFileState } from '../../../shared/state'
import { pipe } from 'fp-ts/lib/function'
import { ipcRenderer } from '../../ipcRenderer'
import Resources from './Resources'
import { CircularProgress } from '@material-ui/core'

let dispatch: ReturnType<typeof useAppDispatch>

ipcRenderer.addListener(Shared.channel, (arg:any) => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  console.log(`Resp: ${arg}`)
  dispatch(parse(arg))
})

export function Backuper() {
  const count = useAppSelector(selectStatus)
  dispatch = useAppDispatch()

  const [savePath, setSavePath] = React.useState('')
  const input = (
    <div>
      <div className={styles.row}>
        <input
          className={styles.textbox}
          aria-label="Set increment amount"
          value={savePath}
          onChange={(e) => setSavePath(e.target.value)}
        />
        <button
          className={styles.asyncButton}
          onClick={() => dispatch(parseSaveReq(savePath))}
        >
          Add Async
        </button>
      </div>
    </div>
  )

  function PreResources() {
    switch (count[0]) {
      case States.RESOLVED: {
        const [, x] = count
        const res = pipe(
          x, E.fold(
            ((err:Shared.ErrorMsg) => <div>{err}</div>),
            ((x:SaveFileState) => (
              <Resources
                resources={x.resources}
                dispatch={dispatch}
              />
            )),
          ),
        )
        return res
      }
      default:
        throw Error(`Expected States.RESOLVED but ${count[0]}`)
        break
    }
  }

  switch (count[0]) {
    case States.IDLE: {
      return input
    }
    case States.RESOLVED: {
      return (
        <div>
          <div>{input}</div>
          <PreResources />
        </div>
      )
    }
    case States.LOADING: {
      return (
        <CircularProgress />
      )
    }
  }
}
