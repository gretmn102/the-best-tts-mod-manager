import * as React from 'react'
import * as E from 'fp-ts/lib/Either'

import { useAppSelector, useAppDispatch } from '../../app/hooks'
import {
  parseSaveReq,
  selectStatus,
  States,
} from './backuperSlice'
import styles from './Backuper.module.css'
import * as Shared from '../../../shared/API'
import { SaveFileState } from '../../../shared/state'
import { pipe } from 'fp-ts/lib/function'
import EnhancedTable from './Resources'
import { CircularProgress } from '@material-ui/core'

function Input() {
  const dispatch = useAppDispatch()
  const [savePath, setSavePath] = React.useState('')
  return (
    <div>
      <div className={styles.row}>
        <input
          className={styles.textbox}
          aria-label="Set save path"
          value={savePath}
          onChange={(e) => setSavePath(e.target.value)}
        />
        <button
          className={styles.asyncButton}
          onClick={() => dispatch(parseSaveReq(savePath))}
        >
          Load save file
        </button>
      </div>
    </div>
  )
}

function PreResources() {
  const count = useAppSelector(selectStatus)

  switch (count[0]) {
    case States.RESOLVED: {
      const [, x] = count
      const res = pipe(
        x, E.fold(
          ((err:Shared.ErrorMsg) => <div>{err}</div>),
          ((x:SaveFileState) => (
            <EnhancedTable
              resources={x.resources}
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

export function Backuper() {
  const count = useAppSelector(selectStatus)

  switch (count[0]) {
    case States.IDLE: {
      return <Input />
    }
    case States.RESOLVED: {
      return (
        <div>
          <Input />
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
