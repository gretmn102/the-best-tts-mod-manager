export enum MOD_FILE_TYPES {
    UNKNOWN,
    IMAGE,
    MODEL,
    AUDIO,
    ASSETBUNDLE,
    PDF,
    TEXT,
    TRANSLATIONS,
    WORKSHOP
}
export const TTS_RESOURCES_DIRS_SUBDIR = {
    [MOD_FILE_TYPES.UNKNOWN]: "Unknown",
    [MOD_FILE_TYPES.ASSETBUNDLE]: "Assetbundles",
    [MOD_FILE_TYPES.AUDIO]: "Audio",
    [MOD_FILE_TYPES.IMAGE]: "Images",
    [MOD_FILE_TYPES.MODEL]: "Models",
    [MOD_FILE_TYPES.PDF]: "PDF",
    [MOD_FILE_TYPES.TEXT]: "Text",
    [MOD_FILE_TYPES.TRANSLATIONS]: "Translations",
    [MOD_FILE_TYPES.WORKSHOP]: "Workshop"
};