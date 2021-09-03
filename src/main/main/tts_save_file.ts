/* eslint-disable no-restricted-syntax */
import * as TtsSaveFormat from '../../shared/tabletopsimulator/save_file'
import { promises as fs } from 'fs'
import { MOD_FILE_TYPES } from '../../shared/mod_file_types'

interface TypeParams {
  linkOrigin?: string
}

export interface Result {
  extractedUrl: string
  lang: string
  typeInSaveFile?: MOD_FILE_TYPES
  linkOrigin?: string
}
export const defaultLang = 'default'
export function extractMultilanguageUrls(url: string) {
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

function* addLinkToCollection(linkRawString: string, typeInSaveFile?: MOD_FILE_TYPES, linkOrigin?: string): Generator<Result, void, unknown> {
  if (linkRawString) {
    for (const { lang, url } of extractMultilanguageUrls(linkRawString)) {
      yield {
        extractedUrl: url,
        lang: lang,
        typeInSaveFile,
        linkOrigin,
      }
    }
  }
}

function* parseCustomMesh(CustomMesh: TtsSaveFormat.CustomMeshState, params: TypeParams) {
  yield* addLinkToCollection(CustomMesh?.ColliderURL, MOD_FILE_TYPES.MODEL, params.linkOrigin)
  yield* addLinkToCollection(CustomMesh?.DiffuseURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin)
  yield* addLinkToCollection(CustomMesh?.MeshURL, MOD_FILE_TYPES.MODEL, params.linkOrigin)
  yield* addLinkToCollection(CustomMesh?.NormalURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin)
}

function* parseAttachedDecalsArray(attachedDecalsArray: TtsSaveFormat.DecalState[], params: TypeParams) {
  if (attachedDecalsArray) {
    for (const customUIAssets of attachedDecalsArray) {
      yield* addLinkToCollection(customUIAssets?.CustomDecal?.ImageURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin)
    }
  }
}

function parseSkyURL(SkyURL: string, params: TypeParams) {
  return addLinkToCollection(SkyURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin)
}
function parseTableURL(TableURL: string, params: TypeParams) {
  return addLinkToCollection(TableURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin)
}

function* parseDecalPalletArray(decalPalletArray: TtsSaveFormat.CustomDecalState[], params: TypeParams) {
  if (decalPalletArray) {
    for (const decalPallet of decalPalletArray) {
      yield* addLinkToCollection(decalPallet?.ImageURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin)
    }
  }
}

function* parseDecalsArray(decalsArray: TtsSaveFormat.CustomDecalState[], params: TypeParams) {
  if (decalsArray) {
    for (const decalPallet of decalsArray) {
      yield* addLinkToCollection(decalPallet?.ImageURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin)
    }
  }
}

function* parseCustomUIAssetsArray(customUIAssetsArray: TtsSaveFormat.CustomAssetState[], params: TypeParams) {
  if (customUIAssetsArray) {
    for (const customUIAssets of customUIAssetsArray) {
      yield* addLinkToCollection(customUIAssets?.URL, MOD_FILE_TYPES.IMAGE, params.linkOrigin)
    }
  }
}

function* parseCustomAssetbundle(customAssetbundle: TtsSaveFormat.CustomAssetbundleState, params: TypeParams) {
  yield* addLinkToCollection(customAssetbundle?.AssetbundleSecondaryURL, MOD_FILE_TYPES.ASSETBUNDLE, params.linkOrigin)
  yield* addLinkToCollection(customAssetbundle?.AssetbundleURL, MOD_FILE_TYPES.ASSETBUNDLE, params.linkOrigin)
}

function* parseCustomDeckMap(customDeckArray: {
  [key: number]: TtsSaveFormat.CustomDeckState;
}, params: TypeParams) {
  if (customDeckArray) {
    for (const customDeck of Object.values(customDeckArray)) {
      yield* addLinkToCollection(customDeck?.BackURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin)
      yield* addLinkToCollection(customDeck?.FaceURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin)
    }
  }
}

function* parseCustomImage(customImage: TtsSaveFormat.CustomImageState, params: TypeParams) {
  yield* addLinkToCollection(customImage?.ImageSecondaryURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin)
  yield* addLinkToCollection(customImage?.ImageURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin)
}

function parseCustomPDF(customPDF: TtsSaveFormat.CustomPDFState, params: TypeParams) {
  return addLinkToCollection(customPDF?.PDFUrl, MOD_FILE_TYPES.PDF, params.linkOrigin)
}

const findAllLinksRegExp = new RegExp(/((http|ftp|ftps|https):((\/\/)|(\\\\))([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?)/gmi)

function checkIgnoreLinks(link: string) {
  if (/tabletopsimulator\.com/.exec(link)) {
    return true
  }
  return false
}

function* parseCustomStringForLinks(stringVar: string, params: TypeParams) {
  if (stringVar) {
    const iteratorVar = stringVar.matchAll(findAllLinksRegExp)

    for (const val of iteratorVar) {
      if (!checkIgnoreLinks(val[1])) {
        yield* addLinkToCollection(val[1], undefined, params.linkOrigin)
      }
    }
  }
}

function parseXmlUI(XmlUI: string, params: TypeParams) {
  return parseCustomStringForLinks(XmlUI, params)
}

function parseLuaForLinks(luaString: string, params: TypeParams) {
  return parseCustomStringForLinks(luaString, params)
}

function parseLuaStateForLinks(luaString: string, params: TypeParams) {
  return parseCustomStringForLinks(luaString, params)
}

function* parseInnerStates(objectStates: TtsSaveFormat.ObjectState[]) {
  if (objectStates) {
    for (const objectStateInner of objectStates) {
      // eslint-disable-next-line eqeqeq
      if (objectStateInner != undefined && objectStateInner != null) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        yield* parseState(objectStateInner)
      }
    }
  }
}

function* parseState(objectState: TtsSaveFormat.ObjectState): Generator<Result, void, unknown> {
  yield* parseAttachedDecalsArray(objectState?.AttachedDecals, { linkOrigin: 'ObjAttachedDecals' })
  yield* parseCustomAssetbundle(objectState?.CustomAssetbundle, { linkOrigin: 'ObjCustomAssetbundle' })
  yield* parseCustomDeckMap(objectState?.CustomDeck, { linkOrigin: 'ObjCustomDeck' })
  yield* parseCustomImage(objectState?.CustomImage, { linkOrigin: 'ObjCustomImage' })
  yield* parseCustomPDF(objectState?.CustomPDF, { linkOrigin: 'ObjCustomPDF' })
  yield* parseCustomMesh(objectState?.CustomMesh, { linkOrigin: 'ObjCustomMesh' })
  yield* parseCustomUIAssetsArray(objectState?.CustomUIAssets, { linkOrigin: 'ObjCustomUIAssets' })
  yield* parseXmlUI(objectState?.XmlUI, { linkOrigin: 'ObjXmlUI' })

  yield* parseLuaForLinks(objectState?.LuaScript, { linkOrigin: 'ObjLuaScript' })
  yield* parseLuaStateForLinks(objectState?.LuaScriptState, { linkOrigin: 'ObjLuaScriptState' })

  if (objectState?.States) {
    yield* parseInnerStates(Object.values(objectState?.States))
  }

  yield* parseInnerStates(objectState?.ContainedObjects)
}

export function* parse(content: string): Generator<Result, void, unknown> {
  const saveState = <TtsSaveFormat.SaveState>JSON.parse(content)

  yield* parseCustomUIAssetsArray(saveState?.CustomUIAssets, { linkOrigin: 'SaveCustomUIAssets' })
  yield* parseDecalPalletArray(saveState?.DecalPallet, { linkOrigin: 'SaveDecalPallet' })
  yield* parseDecalsArray(saveState?.DecalPallet, { linkOrigin: 'SaveDecalPallet' })

  yield* parseSkyURL(saveState?.SkyURL, { linkOrigin: 'SaveSkyURL' })
  yield* parseTableURL(saveState?.TableURL, { linkOrigin: 'SaveTableURL' })
  yield* parseXmlUI(saveState?.XmlUI, { linkOrigin: 'SaveXmlUI' })

  yield* parseLuaForLinks(saveState?.LuaScript, { linkOrigin: 'SaveLuaScript' })
  yield* parseLuaStateForLinks(saveState?.LuaScriptState, { linkOrigin: 'SaveLuaScriptState' })

  yield* parseInnerStates(saveState?.ObjectStates)
}

export async function parseSave(filePath: string) {
  const content = await fs.readFile(filePath, 'utf8')
  return parse(content)
}

export default parseSave
