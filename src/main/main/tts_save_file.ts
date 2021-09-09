/* eslint-disable no-restricted-syntax */
import * as TtsSaveFormat from '../../shared/tabletopsimulator/save_file'
import { promises as fs } from 'fs'
import { MOD_FILE_TYPES } from '../../shared/mod_file_types'
import update from 'immutability-helper'
import * as A from 'fp-ts/Array'
import { pipe, tuple } from 'fp-ts/lib/function'

export interface MultilanguageUrl {
  lang: string,
  url: string,
}

export interface Result extends MultilanguageUrl {
  typeInSaveFile?: MOD_FILE_TYPES
  linkOrigin?: string
}

export const defaultLang = 'default'

export function extractMultilanguageUrls(url: string): MultilanguageUrl [] {
  const urlCollector:{ lang: string; url: string } [] = []

  const reg = /\{(.*?)\}([^{]+)/g
  let match:RegExpExecArray
  // eslint-disable-next-line no-cond-assign
  while ((match = <RegExpExecArray>reg.exec(url)) !== null) {
    const x = {
      lang: match[1].trim(),
      url: match[2].trim(),
    }
    urlCollector.push(x)
  }

  if (urlCollector.length === 0) {
    return [{ lang: defaultLang, url: url }]
  }
  return urlCollector
}
function multilanguageUrlsShow(ml: MultilanguageUrl []) {
  // return pipe(
  //   params,
  //   A.reduce(
  //     '',
  //     // eslint-disable-next-line arrow-body-style
  //     (state, x) => {
  //       return `${state}{${x.lang}}${x.extractedUrl}`
  //     },
  //   ),
  // )
  if (ml.length === 1) {
    return ml[0].url
  }
  return ml
    .map(x => `{${x.lang}}${x.url}`)
    .join()
}

function addLinkToCollection<State>(
  linkRawString: string,
  typeInSaveFile: MOD_FILE_TYPES,
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  function addLinkToCollection(linkRawString: string, typeInSaveFile: MOD_FILE_TYPES): Result [] {
    return extractMultilanguageUrls(linkRawString)
      .map(x => ({
        url: x.url,
        lang: x.lang,
        typeInSaveFile,
      }))
  }
  const urls = addLinkToCollection(linkRawString, typeInSaveFile)
  const [newUrls, newState] = reducer(state, urls)
  return tuple(multilanguageUrlsShow(newUrls), newState)
}

function parseCustomMesh<State>(
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  return (customMesh: TtsSaveFormat.CustomMeshState) => {
    const xs = {
      * [Symbol.iterator](): Generator<[keyof (typeof customMesh), string, MOD_FILE_TYPES], void, unknown> {
        if (customMesh?.ColliderURL) {
          yield ['ColliderURL', customMesh.ColliderURL, MOD_FILE_TYPES.MODEL]
        }
        if (customMesh?.DiffuseURL) {
          yield ['DiffuseURL', customMesh.DiffuseURL, MOD_FILE_TYPES.IMAGE]
        }
        if (customMesh?.MeshURL) {
          yield ['MeshURL', customMesh.MeshURL, MOD_FILE_TYPES.MODEL]
        }
        if (customMesh?.NormalURL) {
          yield ['NormalURL', customMesh.NormalURL, MOD_FILE_TYPES.IMAGE]
        }
      },
    }
    return pipe(
      Array.from(xs),
      A.reduce(
        tuple(customMesh, state),
        ([customMesh, state], [key, oldRawUrl, type]) => {
          const [newRawUrl, newState] = addLinkToCollection(oldRawUrl, type, state, reducer)
          return tuple(update(customMesh, { [key]: { $set: newRawUrl } }), newState)
        },
      ),
    )
  }
}

const mapFold = <T, State, Result>(
  initState: State,
  f: (state: State, x: T) => [Result, State],
) => (xs: T []): [Result [], State] => {
    let state = initState
    if (xs) {
      const ys = Array<Result>(xs.length)
      for (let i = 0; i < xs.length; i += 1) {
        const x = xs[i]
        const [y, newState] = f(state, x)
        state = newState
        ys[i] = y
      }
      return [ys, state]
    } else {
      return [xs, state]
    }
  }

// const act = pipe(
//   [1, 2, 3],
//   mapFold(
//     '',
//     (state, x) => [x + 1, `${state}${x}`],
//   ),
//   // (x) => console.log(x),
// )
// assert.deepStrictEqual(act, [ [ 2, 3, 4 ], '123' ])

function parseCustomDecalStates<State>(
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  return (decalsArray: TtsSaveFormat.CustomDecalState[]) => {
    const result = pipe(
      decalsArray,
      mapFold(
        state,
        (state, x) => {
          const [newRawUrl, newState] = addLinkToCollection(x.ImageURL, MOD_FILE_TYPES.IMAGE, state, reducer)
          const result = update(x, { ImageURL: { $set: newRawUrl } })
          return [result, newState]
        },
      ),
    )
    return result
  }
}

function parseDecalStates<State>(
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  return (decalStates: TtsSaveFormat.DecalState[]) => {
    const result = pipe(
      decalStates,
      mapFold(
        state,
        (state, x) => {
          const [newRawUrl, newState] = addLinkToCollection(x.CustomDecal.ImageURL, MOD_FILE_TYPES.IMAGE, state, reducer)
          const result = update(x, { CustomDecal: { ImageURL: { $set: newRawUrl } } })
          return [result, newState]
        },
      ),
    )
    return result
  }
}

function parseSkyURL<State>(
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  return (SkyURL: string) => addLinkToCollection(SkyURL, MOD_FILE_TYPES.IMAGE, state, reducer)
}
function parseTableURL<State>(
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  return (TableURL: string) => addLinkToCollection(TableURL, MOD_FILE_TYPES.IMAGE, state, reducer)
}

function parseCustomUIAssetsArray<State>(
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  return (customUIAssetsArray: TtsSaveFormat.CustomAssetState[]) => {
    const result = pipe(
      customUIAssetsArray,
      mapFold(
        state,
        (state, x) => {
          const [newRawUrl, newState] = addLinkToCollection(x.URL, MOD_FILE_TYPES.IMAGE, state, reducer)
          const result = update(x, { URL: { $set: newRawUrl } })
          return [result, newState]
        },
      ),
    )
    return result
  }
}

function parseCustomAssetbundle<State>(
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  return (customAssetbundle: TtsSaveFormat.CustomAssetbundleState) => {
    const xs = {
      * [Symbol.iterator](): Generator<[keyof (typeof customAssetbundle), string, MOD_FILE_TYPES], void, unknown> {
        if (customAssetbundle?.AssetbundleSecondaryURL) {
          yield ['AssetbundleSecondaryURL', customAssetbundle.AssetbundleSecondaryURL, MOD_FILE_TYPES.ASSETBUNDLE]
        }
        if (customAssetbundle?.AssetbundleURL) {
          yield ['AssetbundleURL', customAssetbundle.AssetbundleURL, MOD_FILE_TYPES.ASSETBUNDLE]
        }
      },
    }
    return pipe(
      Array.from(xs),
      A.reduce(
        tuple(customAssetbundle, state),
        ([x, state], [key, oldRawUrl, type]) => {
          const [newRawUrl, newState] = addLinkToCollection(oldRawUrl, type, state, reducer)
          return tuple(update(x, { [key]: { $set: newRawUrl } }), newState)
        },
      ),
    )
  }
}

function parseCustomDeckMap<State>(
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  return (customDeckArray: { [key: number]: TtsSaveFormat.CustomDeckState }) => {
    const customDeckStateMapFold = (state: State, customDeck: TtsSaveFormat.CustomDeckState) => {
      const xs: [keyof (typeof customDeck), string, MOD_FILE_TYPES][] = [
        ['FaceURL', customDeck.FaceURL, MOD_FILE_TYPES.IMAGE],
        ['BackURL', customDeck.BackURL, MOD_FILE_TYPES.IMAGE],
      ]
      return pipe(
        xs,
        A.reduce(
          tuple(customDeck, state),
          ([x, state], [key, oldRawUrl, type]) => {
            const [newRawUrl, newState] = addLinkToCollection(oldRawUrl, type, state, reducer)
            return tuple(update(x, { [key]: { $set: newRawUrl } }), newState)
          },
        ),
      )
    }
    return pipe(
      Object.entries(customDeckArray),
      A.reduce(
        tuple(customDeckArray, state),
        ([customDeckArray, state], [key, x]) => {
          const [newX, newState] = customDeckStateMapFold(state, x)
          return tuple(update(customDeckArray, { [key]: { $set: newX } }), newState)
        },
      ),
    )
  }
}

function parseCustomImage<State>(
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  return (customImage: TtsSaveFormat.CustomImageState) => {
    const xs = {
      * [Symbol.iterator](): Generator<[keyof (typeof customImage), string, MOD_FILE_TYPES], void, unknown> {
        if (customImage?.ImageSecondaryURL) {
          yield ['ImageSecondaryURL', customImage.ImageSecondaryURL, MOD_FILE_TYPES.IMAGE]
        }
        if (customImage?.ImageURL) {
          yield ['ImageURL', customImage.ImageURL, MOD_FILE_TYPES.IMAGE]
        }
      },
    }
    return pipe(
      Array.from(xs),
      A.reduce(
        tuple(customImage, state),
        ([x, state], [key, oldRawUrl, type]) => {
          const [newRawUrl, newState] = addLinkToCollection(oldRawUrl, type, state, reducer)
          return tuple(update(x, { [key]: { $set: newRawUrl } }), newState)
        },
      ),
    )
  }
}

function parseCustomPDF<State>(
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  return (customPDF: TtsSaveFormat.CustomPDFState) => {
    const [newRawUrl, newState] = addLinkToCollection(customPDF.PDFUrl, MOD_FILE_TYPES.PDF, state, reducer)
    return tuple(update(customPDF, { PDFUrl: { $set: newRawUrl } }), newState)
  }
}

const findAllLinksRegExp = new RegExp(/((http|ftp|ftps|https):((\/\/)|(\\\\))([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?)/gmi)

function checkIgnoreLinks(link: string) {
  if (/tabletopsimulator\.com/.exec(link)) {
    return true
  }
  return false
}

function parseCustomStringForLinks<State>(
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  return (stringVar: string) => {
    if (stringVar) {
      const result = pipe(
        Array.from(stringVar.matchAll(findAllLinksRegExp)),
        A.filter(x => !checkIgnoreLinks(x[1])),
        A.reduce(
          tuple(stringVar, state),
          ([stringVar, state], val) => {
            const oldRawUrl = val[1]
            const [newRawUrl, newState] = addLinkToCollection(oldRawUrl, MOD_FILE_TYPES.UNKNOWN, state, reducer)
            // `.replaceAll` is not used because of this https://stackoverflow.com/a/65295740
            const newStringVar = stringVar.replace(RegExp(oldRawUrl), newRawUrl)
            return tuple(newStringVar, newState)
          },
        ),
      )
      return result
    } else {
      return tuple(stringVar, state)
    }
  }
}

function parseXmlUI<State>(
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  return (XmlUI: string) => parseCustomStringForLinks(state, reducer)(XmlUI)
}

function parseLuaForLinks<State>(
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  return (luaString: string) => parseCustomStringForLinks(state, reducer)(luaString)
}

function parseLuaStateForLinks<State>(
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  return (luaString: string) => parseCustomStringForLinks(state, reducer)(luaString)
}

function parseInnerStates<State>(
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  return (objectStates: TtsSaveFormat.ObjectState[]) => {
    const result = pipe(
      objectStates,
      mapFold(
        state,
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        (state, val) => parseState(state, reducer)(val),
      ),
    )
    return result
  }
}
type ValueOf<T> = T[keyof T]

function parseState<State>(
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  return (objectState: TtsSaveFormat.ObjectState) => {
    const xs = {
      * [Symbol.iterator](): Generator<[keyof (typeof objectState), (state: State) => [ValueOf<typeof objectState>, State]], void, unknown> {
        yield ['AttachedDecals', (state: State) => parseDecalStates(state, reducer)(objectState.AttachedDecals)]
        yield ['CustomAssetbundle', (state:State) => parseCustomAssetbundle(state, reducer)(objectState.CustomAssetbundle)]
        if (objectState?.CustomDeck) {
          yield ['CustomDeck', (state:State) => parseCustomDeckMap(state, reducer)(objectState.CustomDeck)]
        }
        yield ['CustomImage', (state:State) => parseCustomImage(state, reducer)(objectState.CustomImage)]
        if (objectState?.CustomPDF) {
          yield ['CustomPDF', (state:State) => parseCustomPDF(state, reducer)(objectState.CustomPDF)]
        }
        yield ['CustomMesh', (state:State) => parseCustomMesh(state, reducer)(objectState.CustomMesh)]
        yield ['CustomUIAssets', (state:State) => parseCustomUIAssetsArray(state, reducer)(objectState.CustomUIAssets)]
        yield ['XmlUI', (state:State) => parseXmlUI(state, reducer)(objectState.XmlUI)]
        yield ['LuaScript', (state:State) => parseLuaForLinks(state, reducer)(objectState.LuaScript)]
        yield ['LuaScriptState', (state:State) => parseLuaStateForLinks(state, reducer)(objectState.LuaScriptState)]
        if (objectState?.States) {
          yield ['States', (state:State) => {
            const x = pipe(
              Object.entries(objectState.States),
              A.reduce(
                tuple(objectState.States, state),
                ([x, state], [key, val]) => {
                  const [newX, newState] = parseInnerStates(state, reducer)([val])
                  return tuple(update(x, { [key]: { $set: newX[0] } }), newState)
                },
              ),
            )
            return x
          }]
        }
        yield ['ContainedObjects', (state:State) => parseInnerStates(state, reducer)(objectState.ContainedObjects)]
      },
    }

    return pipe(
      Array.from(xs),
      A.reduce(
        tuple(objectState, state),
        ([objectState, state], [key, f]) => {
          const [newValue, newState] = f(state)
          return tuple(update(objectState, { [key]: { $set: newValue } }), newState)
        },
      ),
    )
  }
}

export function parse<State>(
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  return (content: string) => {
    const saveState = <TtsSaveFormat.SaveState>JSON.parse(content)
    const xs = {
      * [Symbol.iterator](): Generator<[keyof (typeof saveState), (state: State) => [ValueOf<typeof saveState>, State]], void, unknown> {
        yield ['CustomUIAssets', (state:State) => parseCustomUIAssetsArray(state, reducer)(saveState.CustomUIAssets)]
        yield ['Decals', (state:State) => parseDecalStates(state, reducer)(saveState.Decals)]
        yield ['DecalPallet', (state:State) => parseCustomDecalStates(state, reducer)(saveState.DecalPallet)]
        if (saveState?.SkyURL) {
          yield ['SkyURL', (state:State) => parseSkyURL(state, reducer)(saveState.SkyURL)]
        }
        if (saveState?.TableURL) {
          yield ['TableURL', (state:State) => parseTableURL(state, reducer)(saveState.TableURL)]
        }
        yield ['XmlUI', (state:State) => parseXmlUI(state, reducer)(saveState.XmlUI)]
        yield ['LuaScript', (state:State) => parseLuaForLinks(state, reducer)(saveState.LuaScript)]
        yield ['LuaScriptState', (state:State) => parseLuaStateForLinks(state, reducer)(saveState.LuaScriptState)]
        yield ['ObjectStates', (state:State) => parseInnerStates(state, reducer)(saveState.ObjectStates)]
      },
    }

    return pipe(
      Array.from(xs),
      A.reduce(
        tuple(saveState, state),
        ([saveState, state], [key, f]) => {
          const [newValue, newState] = f(state)
          return tuple(update(saveState, { [key]: { $set: newValue } }), newState)
        },
      ),
    )
  }
}

export function parseSave<State>(
  state: State,
  reducer: (state:State, arg1:Result []) => [Result [], State],
) {
  return async (filePath: string) => {
    const content = await fs.readFile(filePath, 'utf8')
    return parse(state, reducer)(content)
  }
}

export default parseSave
