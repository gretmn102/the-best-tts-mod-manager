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

  function getResolved() {
    switch (count[0]) {
      case States.RESOLVED: {
        const [, x] = count
        const res = pipe(
          x, E.fold(
            ((err:Shared.ErrorMsg) => <div>{err}</div>),
            ((x:SaveFileState) => (
              <ol>
                {x.resources.map((x, i) => {
                  const Button = () => (
                    <button
                      className={styles.asyncButton}
                      onClick={() => dispatch(downloadResourceByIndex(i))}
                    >
                      Add Async
                    </button>
                  )
                  let y:JSX.Element
                  switch (x.fileState[0]) {
                    case LocalFileStateT.LOADING:
                      y = <div>Loading...</div>
                      break
                    case LocalFileStateT.NOT_EXIST:
                      y = <Button />
                      break
                    case LocalFileStateT.EXIST:
                      const [, absolutePath] = x.fileState
                      y = <img src={`file:///${absolutePath.replaceAll('\\', '/')}`} alt="" />
                      break
                    case LocalFileStateT.LOAD_ERROR:
                      const [, errMsg] = x.fileState
                      y = (
                        <div>
                          <div>{errMsg}</div>
                          <Button />
                        </div>
                      )
                      break
                  }
                  return (
                    <li key={x.url}>
                      <div>{x.url}</div>
                      <div>{y}</div>
                    </li>
                  )
                })}
              </ol>
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
          <div>{getResolved()}</div>
          <div>{input}</div>
        </div>
      )
    }
    case States.LOADING: {
      return (
        <div>Loading...</div>
      )
    }
  }
}
