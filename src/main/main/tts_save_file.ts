import * as TTS_SaveFormat from "../../shared/tabletopsimulator/save_file";
import { promises as fs } from 'fs'
import * as path from 'path';

import { TTS_Resource } from './tts_resource';
import { Program_Settings } from "./program_settings";
import { MOD_FILE_TYPES } from "../../shared/mod_file_types";
import { TTS_Settings } from "./tts_settings";

interface TypeParams {
    linkOrigin?: string
}

export class Result {
    extractedUrl: string
    typeInSaveFile?: MOD_FILE_TYPES
    linkOrigin?: string
}

function* addLinkToCollection(linkRawString: string, typeInSaveFile?: MOD_FILE_TYPES, linkOrigin?: string) {
    if (!TTS_Settings.UtilIsEmptyJsonValue(linkRawString)) {
        for (let extractedUrl of TTS_Resource.UtilExtractMultilanguageUrls(linkRawString)) {
            const result = new Result()
            result.extractedUrl = extractedUrl
            result.typeInSaveFile = typeInSaveFile
            result.linkOrigin = linkOrigin
            yield result
        }
    }
}

export async function parseSave(filePath: string) {
    const content = await fs.readFile(filePath, "utf8")
    return parse(content)
}

export function* parse(content:string) : Generator<Result, void, unknown> {
    let saveState: TTS_SaveFormat.SaveState = JSON.parse(content);

    yield* parseCustomUIAssetsArray(saveState?.CustomUIAssets, { linkOrigin: "SaveCustomUIAssets" });
    yield* parseDecalPalletArray(saveState?.DecalPallet, { linkOrigin: "SaveDecalPallet" });
    yield* parseDecalsArray(saveState?.DecalPallet, { linkOrigin: "SaveDecalPallet" });

    yield* parseSkyURL(saveState?.SkyURL, { linkOrigin: "SaveSkyURL" });
    yield* parseTableURL(saveState?.TableURL, { linkOrigin: "SaveTableURL" });
    yield* parseXmlUI(saveState?.XmlUI, { linkOrigin: "SaveXmlUI" });

    yield* parseLuaForLinks(saveState?.LuaScript, { linkOrigin: "SaveLuaScript" });
    yield* parseLuaStateForLinks(saveState?.LuaScriptState, { linkOrigin: "SaveLuaScriptState" });

    yield* parseInnerStates(saveState?.ObjectStates, { linkOrigin: "SaveObjectStates" });
}

function* parseState(objectState: TTS_SaveFormat.ObjectState): Generator<Result, void, unknown> {
    yield* parseAttachedDecalsArray(objectState?.AttachedDecals, { linkOrigin: "ObjAttachedDecals" });
    yield* parseCustomAssetbundle(objectState?.CustomAssetbundle, { linkOrigin: "ObjCustomAssetbundle" });
    yield* parseCustomDeckMap(objectState?.CustomDeck, { linkOrigin: "ObjCustomDeck" });
    yield* parseCustomImage(objectState?.CustomImage, { linkOrigin: "ObjCustomImage" });
    yield* parseCustomPDF(objectState?.CustomPDF, { linkOrigin: "ObjCustomPDF" })
    yield* parseCustomMesh(objectState?.CustomMesh, { linkOrigin: "ObjCustomMesh" });
    yield* parseCustomUIAssetsArray(objectState?.CustomUIAssets, { linkOrigin: "ObjCustomUIAssets" });
    yield* parseXmlUI(objectState?.XmlUI, { linkOrigin: "ObjXmlUI" });

    yield* parseLuaForLinks(objectState?.LuaScript, { linkOrigin: "ObjLuaScript" });
    yield* parseLuaStateForLinks(objectState?.LuaScriptState, { linkOrigin: "ObjLuaScriptState" });

    if (!TTS_Settings.UtilIsEmptyJsonValue(objectState?.States))
        yield* parseInnerStates(Object.values(objectState?.States), { linkOrigin: "ObjStates" });

    yield* parseInnerStates(objectState?.ContainedObjects, { linkOrigin: "ObjContainedObjects" });
}

function* parseInnerStates(objectStates: TTS_SaveFormat.ObjectState[], params: TypeParams) {
    if (!TTS_Settings.UtilIsEmptyJsonValue(objectStates)) {
        for (let objectStateInner of objectStates) {
            if (objectStateInner != undefined && objectStateInner != null) {
                yield* parseState(objectStateInner);
            }
        }
    }
}

function* parseCustomMesh(CustomMesh: TTS_SaveFormat.CustomMeshState, params: TypeParams) {
    yield* addLinkToCollection(CustomMesh?.ColliderURL, MOD_FILE_TYPES.MODEL, params.linkOrigin);
    yield* addLinkToCollection(CustomMesh?.DiffuseURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin);
    yield* addLinkToCollection(CustomMesh?.MeshURL, MOD_FILE_TYPES.MODEL, params.linkOrigin);
    yield* addLinkToCollection(CustomMesh?.NormalURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin);
}

function* parseAttachedDecalsArray(attachedDecalsArray: TTS_SaveFormat.DecalState[], params: TypeParams) {
    if (!TTS_Settings.UtilIsEmptyJsonValue(attachedDecalsArray)) {
        for (let customUIAssets of attachedDecalsArray) {
            yield* addLinkToCollection(customUIAssets?.CustomDecal?.ImageURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin);
        }
    }
}

function parseSkyURL(SkyURL: string, params: TypeParams) {
    return addLinkToCollection(SkyURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin);
}
function parseTableURL(TableURL: string, params: TypeParams) {
    return addLinkToCollection(TableURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin);
}

function* parseDecalPalletArray(decalPalletArray: TTS_SaveFormat.CustomDecalState[], params: TypeParams) {
    if (!TTS_Settings.UtilIsEmptyJsonValue(decalPalletArray)) {
        for (let decalPallet of decalPalletArray) {
            yield* addLinkToCollection(decalPallet?.ImageURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin);
        }
    }
}

function* parseDecalsArray(decalsArray: TTS_SaveFormat.CustomDecalState[], params: TypeParams) {
    if (!TTS_Settings.UtilIsEmptyJsonValue(decalsArray)) {
        for (let decalPallet of decalsArray) {
            yield* addLinkToCollection(decalPallet?.ImageURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin);
        }
    }
}

function* parseCustomUIAssetsArray(customUIAssetsArray: TTS_SaveFormat.CustomAssetState[], params: TypeParams) {
    if (!TTS_Settings.UtilIsEmptyJsonValue(customUIAssetsArray)) {
        for (let customUIAssets of customUIAssetsArray) {
            yield* addLinkToCollection(customUIAssets?.URL, MOD_FILE_TYPES.IMAGE, params.linkOrigin);
        }
    }
}

function* parseCustomAssetbundle(customAssetbundle: TTS_SaveFormat.CustomAssetbundleState, params: TypeParams) {
    yield* addLinkToCollection(customAssetbundle?.AssetbundleSecondaryURL, MOD_FILE_TYPES.ASSETBUNDLE, params.linkOrigin);
    yield* addLinkToCollection(customAssetbundle?.AssetbundleURL, MOD_FILE_TYPES.ASSETBUNDLE, params.linkOrigin);
}

function* parseCustomDeckMap(customDeckArray: {
    [key: number]: TTS_SaveFormat.CustomDeckState;
}, params: TypeParams) {
    if (!TTS_Settings.UtilIsEmptyJsonValue(customDeckArray)) {
        for (let customDeck of Object.values(customDeckArray)) {
            yield* addLinkToCollection(customDeck?.BackURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin);
            yield* addLinkToCollection(customDeck?.FaceURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin);
        }
    }
}

function* parseCustomImage(customImage: TTS_SaveFormat.CustomImageState, params: TypeParams) {
    yield* addLinkToCollection(customImage?.ImageSecondaryURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin);
    yield* addLinkToCollection(customImage?.ImageURL, MOD_FILE_TYPES.IMAGE, params.linkOrigin);
}

function parseCustomPDF(customPDF: TTS_SaveFormat.CustomPDFState, params: TypeParams) {
    return addLinkToCollection(customPDF?.PDFUrl, MOD_FILE_TYPES.PDF, params.linkOrigin);
}



const findAllLinksRegExp = new RegExp(/((http|ftp|ftps|https):((\/\/)|(\\\\))([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?)/gmi);

function parseXmlUI(XmlUI: string, params: TypeParams) {
    return parseCustomStringForLinks(XmlUI, params);
}

function parseLuaForLinks(luaString: string, params: TypeParams) {
    return parseCustomStringForLinks(luaString, params);
}

function parseLuaStateForLinks(luaString: string, params: TypeParams) {
    return parseCustomStringForLinks(luaString, params);
}

function checkIgnoreLinks(link: string) {
    if (link.match(/tabletopsimulator\.com/)) {
        return true;
    }
    return false;
}

function* parseCustomStringForLinks(stringVar: string, params: TypeParams) {
    if (!TTS_Settings.UtilIsEmptyJsonValue(stringVar)) {
        let iteratorVar = stringVar.matchAll(findAllLinksRegExp);

        for (let val of iteratorVar) {
            if (!checkIgnoreLinks(val[1]))
                yield* addLinkToCollection(val[1], undefined, params.linkOrigin);
        }
    }
}

export default parseSave