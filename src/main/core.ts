import * as E from 'fp-ts/lib/Either'
import * as API from '../shared/API'
import * as SharedState from '../shared/state'
import { MainT } from '../shared/state'
import parseSave from './main/tts_save_file'
import * as fs from 'fs-extra'
import * as S from 'fp-ts/string'
import * as path from 'path'
import * as https from 'https' // or 'https' for https:// URLs

function downloadFile(uri: string, savePath: string) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(savePath)
    const request = https.get(uri, res => {
      res.pipe(file)
      res.once('end', () => {
        if (res.statusCode !== 200) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          file.destroy(new Error(`Server returned status code ${res.statusCode}`))
        } else file.close()
      })
    })
    const onError = (err:any) => {
      // TODO: remove file
      file.removeAllListeners()
      request.removeAllListeners()
      reject(err)
    }
    file.once('close', () => {
      file.removeAllListeners()
      resolve(undefined)
    })
    file.once('error', onError)
    request.once('error', onError)
  })
}

export const state:SharedState.State = {
  saveState: [ MainT.NOT_STARTED_SAVE_FILE_YET ],
  resourcesDir: '',
}

function arrayDistinct<T>(myArray:T []) {
  return myArray.filter((v, i, a) => a.indexOf(v) === i)
}

function fileNameRemoveIllegalChars(fileName:string) {
  // System.IO.Path.GetInvalidFileNameChars() in C#
  // eslint-disable-next-line no-control-regex
  return fileName.replace(/["<>|\x00\x01\x02\x03\x04\x05\x06\x07\b\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f:*?\\/]+/gm, '')
}
// TODO: test
// const exp = 'httpsexternal-content.duckduckgo.comiuu=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP._TSgBovJiaHo6Z_uz1gwngHaFc%26pid%3DApi%26h%3D160&f=1'
// const input = 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP._TSgBovJiaHo6Z_uz1gwngHaFc%26pid%3DApi%26h%3D160&f=1'
// fileNameRemoveIllegalChars(input) == exp
function getPath(state:SharedState.State, url:string) {
  const resourceDir = !state.resourcesDir ? '' : `${state.resourcesDir}/`
  return path.resolve(`${resourceDir}${fileNameRemoveIllegalChars(url)}`)
}

// eslint-disable-next-line consistent-return
export async function handle(req:API.Req, send: (x:API.Resp) => void): Promise<API.Resp> {
  switch (req[0]) {
    case API.ReqT.PARSE_SAVE:
      const [, savePath] = req

      if (state.saveState[0] === MainT.SAVE_FILE_HANDLE) {
        const res:API.Resp = [API.RespT.PARSE_SAVE_RESULT, E.left<API.ErrorMsg, SharedState.SaveFileState>('save file already set')] // TODO: reload save file
        return res
      } else {
        try {
          const xs = await parseSave(savePath)
          const urls = arrayDistinct(Array.from(xs).map(x => x.extractedUrl))
          const saveFileState: SharedState.SaveFileState = {
            resources: urls.map(url => {
              const resourcePath = getPath(state, url)
              let fileState: SharedState.LocalFileState
              if (fs.existsSync(resourcePath)) {
                fileState = [SharedState.LocalFileStateT.EXIST, resourcePath]
              } else {
                fileState = [SharedState.LocalFileStateT.NOT_EXIST]
              }
              return {
                fileState: fileState,
                url: url,
              }
            }),
          }
          state.saveState = [
            MainT.SAVE_FILE_HANDLE,
            saveFileState,
          ]

          const res: API.Resp = [API.RespT.PARSE_SAVE_RESULT, E.right(saveFileState)]
          return res
        } catch (err) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const res: API.Resp = [API.RespT.PARSE_SAVE_RESULT, E.left<API.ErrorMsg, SharedState.SaveFileState>(err.message)]
          return res
        }
      }
      break

    case API.ReqT.DOWNLOAD_RESOURCE_BY_INDEX: {
      const [, idx] = req
      switch (state.saveState[0]) {
        case MainT.SAVE_FILE_HANDLE:
          const [, x] = state.saveState
          const resource = x.resources[idx]
          if (resource.fileState[0] === SharedState.LocalFileStateT.EXIST) {
            const res:API.Resp = [API.RespT.DOWNLOAD_RESOURCE_BY_INDEX_RESULT, E.left<API.ErrorMsg, undefined>('file ')]

            return res
          } else {
            resource.fileState = [ SharedState.LocalFileStateT.LOADING ]
            const resourcePath = getPath(state, resource.url)

            downloadFile(resource.url, resourcePath) // async or sync, that is the question
              .then(x => {
                const fileState:SharedState.LocalFileState = [ SharedState.LocalFileStateT.EXIST, resourcePath ]
                resource.fileState = fileState
                send([ API.RespT.RESOURCE_DOWNLOADED, [idx, fileState] ])
              })
              .catch((err:Error) => {
                const fileState: SharedState.LocalFileState = [ SharedState.LocalFileStateT.LOAD_ERROR, err.message ]
                resource.fileState = fileState
                send([ API.RespT.RESOURCE_DOWNLOADED, [idx, fileState] ])
              })

            const res:API.Resp = [API.RespT.DOWNLOAD_RESOURCE_BY_INDEX_RESULT, E.right(undefined)]
            return res
          }
          break
        case MainT.NOT_STARTED_SAVE_FILE_YET: { throw new Error('Not implemented yet: MainT.NOT_STARTED_SAVE_FILE_YET case') }
      }
    }
  }
}
