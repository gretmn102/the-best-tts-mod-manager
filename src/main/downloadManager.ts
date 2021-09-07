import * as fs from 'fs-extra'
import got from 'got'

async function downloader(uri: Uri, savePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(savePath)
    stream.once('error', x => {
      reject(x)
    })
    stream.once('open', x => {
      const resp = got.stream(uri)
      resp.once('end', () => void resolve())
      resp.once('error', x => void reject(x))
      resp.pipe(stream)
    })
  })
}

// #region my attempt to implemented a semaphore-style downloader
type Uri = string

type State = {
  ConcurrentDownloads: Set<Uri>
  ConcurrentDownloadsLimit: number
  Queue: Uri []
}
const initState = (limit: number): State => ({
  ConcurrentDownloads: new Set<Uri>(),
  ConcurrentDownloadsLimit: limit,
  Queue: [],
})

const state = initState(2)

function downloadFile2(
  url: Uri,
  cb: (url: string) => void,
  cbError: (url: string, err: Error) => void,
  downloader: (uri: string) => Promise<void>,
) {
  if (state.ConcurrentDownloads.size < state.ConcurrentDownloadsLimit) {
    state.ConcurrentDownloads.add(url)

    const f = () => {
      state.ConcurrentDownloads.delete(url)
      const nextUrl = state.Queue.pop()
      if (nextUrl) {
        downloadFile2(nextUrl, cb, cbError, downloader)
      }
    }

    downloader(url)
      .then(() => {
        f()
        cb(url)
      })
      .catch(errMsg => {
        f()
        cbError(url, errMsg)
      })
  } else {
    state.Queue.push(url)
  }
}

export function myDownloadFile(
  url: Uri,
  savePath: string,
  cb: (url: string) => void,
  cbError: (url: string, err: Error) => void,
) {
  downloadFile2(url, cb, cbError, url => downloader(url, savePath))
}
// #endregion

import { Semaphore } from 'async-mutex'

const semaphore = new Semaphore(2)

export function downloadFile(
  url: Uri,
  savePath: string,
  cb: (url: string) => void,
  cbError: (url: string, err: Error) => void,
) {
  semaphore
    .runExclusive((value) => downloader(url, savePath))
    .then(() => cb(url))
    .catch(err => cbError(url, err))
}
