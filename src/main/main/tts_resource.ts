import * as fs from "fs-extra";
import got from "got";
const stream = require("stream");
const { promisify } = require("util");
const pipeline = promisify(stream.pipeline);
import { TTS_Settings } from "./tts_settings";
import { MOD_FILE_TYPES, TTS_RESOURCES_DIRS_SUBDIR } from '../shared/structures/mod_file_types';
import { CustomError } from 'ts-custom-error'
import { Program_Settings } from "./program_settings";

interface DeterminedFileTypeByEnding {
    urlType: MOD_FILE_TYPES
    urlFileExtension?: string
}

class WriteStream_ERROR extends CustomError {
    constructor(message: string) {
        super(message)
    }
}

class DownloadStream_ERROR extends CustomError {
    constructor(message: string) {
        super(message)
    }
}

class WrongMIME_ERROR extends CustomError { }
class NotFoundFileExt_ERROR extends CustomError { }


export class TTS_Resource {
    static IGNORE_MIME_TYPES = ["application/json", "text/html"];


    externalLink: string;
    internalPath: string;

    urlOriginalFileName: string;
    transformatedFileName: string;

    installedFileExtension?: string;
    installedFileType: MOD_FILE_TYPES;

    urlFileType?: MOD_FILE_TYPES = MOD_FILE_TYPES.UNKNOWN;
    urlFileExtension?: string;
    linkOrigin: string = "Unknown";

    jsonFileType: MOD_FILE_TYPES = MOD_FILE_TYPES.UNKNOWN;

    isNeedToVerifyCache: boolean = false;
    isDownloadedInTemp: boolean = false;
    isResourceInstalled: boolean = false;

    programSettings: Program_Settings;


    setProgramSettings(programSettings: Program_Settings) {
        this.programSettings = programSettings;
    }

    setFileInSaveType(fileInSaveType: MOD_FILE_TYPES) {
        this.jsonFileType = fileInSaveType;
    }

    setLinkOrigin(linkOrigin: string) {
        this.linkOrigin = linkOrigin;
    }

    setExternalLink(externalLink: string) {
        if (externalLink === undefined) throw ("incorrectUrl");

        this.externalLink = externalLink.trim();

        if (this.externalLink.startsWith("{verifycache}")) {
            this.externalLink.replace(new RegExp(/\{verifycache\}/gim), "");
            this.isNeedToVerifyCache = true;
        }
        this.externalLink = this.externalLink.replace(new RegExp("\{Unique\}", "gim"), "");
        this.externalLink = this.externalLink.trim();
        this.transformatedFileName = TTS_Resource.UtilConvertURLToFilename(this.externalLink);
        this.determineUrlType();
        this.determineInstalledResourcePath();
    }

    async determineUrlType(): Promise<DeterminedFileTypeByEnding | undefined> {
        this.urlFileType = undefined;
        this.urlFileExtension = undefined;

        let linkArray = [];
        if (!await TTS_Settings.UtilIsEmptyJsonValue(this.urlOriginalFileName)) linkArray.push(this.urlOriginalFileName);
        if (!await TTS_Settings.UtilIsEmptyJsonValue(this.externalLink)) linkArray.push(this.externalLink);

        while (linkArray.length > 0) {
            let link = linkArray.shift();
            if (!!link) {
                let determinedFileTypeByEnding = await TTS_Resource.UtilDetermineTypeByFilenameEnding(link);

                this.urlFileType = determinedFileTypeByEnding.urlType;
                this.urlFileExtension = determinedFileTypeByEnding.urlFileExtension;

                return determinedFileTypeByEnding;
            }
        }

        return undefined;
    }

    async determineInstalledResourcePath() {
        if (this.programSettings.pathToModsDir === undefined) throw ("No Path to Resources");
        if (this.transformatedFileName === undefined) throw ("Name is not Transformated");

        let firstPriority = undefined;
        let searchArray: MOD_FILE_TYPES[] = [];
        for (let key of Object.keys(MOD_FILE_TYPES)) {
            let modFileType = <MOD_FILE_TYPES>parseInt(key);
            if (isNaN(modFileType) || modFileType === MOD_FILE_TYPES.UNKNOWN) continue;

            if (this.jsonFileType === undefined) {
                if (this.urlFileType !== undefined) {
                    if (modFileType === this.urlFileType) {
                        firstPriority = modFileType;
                        continue;
                    }
                }
            } else {
                if (modFileType === this.jsonFileType) {
                    firstPriority = modFileType;
                    continue;
                }
            }
            searchArray.push(modFileType);
        }

        if (firstPriority !== undefined) {
            searchArray.unshift(firstPriority);
        }

        while (searchArray.length > 0) {
            let searchModFileType = <MOD_FILE_TYPES>searchArray.shift();
            let fileTypeDirPath = TTS_RESOURCES_DIRS_SUBDIR[searchModFileType];

            let resDirectory = `${this.programSettings.pathToModsDir}\\${fileTypeDirPath}`;
            if (await fs.pathExists(resDirectory + "\\")) {
                let dirData = await fs.readdir(resDirectory + "\\");
                for (let dirVal of dirData) {
                    let splitName = dirVal.split('.');
                    let fileName = splitName.shift();
                    let fileExt = splitName?.shift();

                    if (fileName === this.transformatedFileName) {
                        this.installedFileType = searchModFileType;
                        this.installedFileExtension = fileExt;
                        this.isResourceInstalled = true;
                        return true;
                    }
                }
            }
        }

        return false;
    }

    async getFileType() {
        let priorityArray = [this.installedFileType, this.jsonFileType, this.urlFileType];
        return priorityArray.find(x => x != undefined);
    }

    async getFileExt() {
        let priorityArray = [this.installedFileExtension, this.urlFileExtension];
        return priorityArray.find(x => x != undefined);
    }

    async determineInstallPath() {
        let fileType = await this.getFileType();
        if (fileType === undefined) throw new NotFoundFileExt_ERROR();

        let extensionStringBuild = this.urlFileExtension === undefined ? "" : "." + this.urlFileExtension;
    }

    async downloadFileToTemp() {
        return new Promise<void>((resolve, reject) => {
            let stream = got.stream(this.externalLink);
            stream.on('response', async response => {
                if (TTS_Resource.IGNORE_MIME_TYPES.find(x => response.headers['content-type']!.replace(" ", "").match(x, "im"))) throw new WrongMIME_ERROR();

                if (response.headers['content-disposition'] != undefined && response.headers['content-disposition'] != null) {
                    let match = response.headers['content-disposition'].match(/filename\="?(.*?)"?(;|$)/im);
                    if (match[1] !== undefined) {
                        this.urlOriginalFileName = match[1].trim();
                        this.urlFileExtension = this.urlOriginalFileName.split('.').pop();
                    }
                }

                await this.determineUrlType();
                if (await this.getFileType() === undefined) throw new NotFoundFileExt_ERROR();

                const outFile = fs.createWriteStream(`${this.programSettings.tempFolder}\\${this.transformatedFileName}`);
                outFile.on("finish", () => {
                    resolve();
                });
                outFile.on('error', function (error) {
                    reject(new WriteStream_ERROR(error.message));
                });
                //immediately starting pipe and resuming recievieng new data to prevent closure of write stream
                pipeline(
                    response,
                    outFile
                );
                stream.resume();
            }).on('error', error => {
                reject(new DownloadStream_ERROR(error.message));
            });
        });
    }

    static async UtilDetermineTypeByFilenameEnding(filename: string): Promise<DeterminedFileTypeByEnding> {
        let determinedFileTypeByEnding: DeterminedFileTypeByEnding = {
            urlType: MOD_FILE_TYPES.UNKNOWN,
            urlFileExtension: undefined
        };

        for (let imageType of ["png", "jpg", "jpeg", "bmp"]) {
            if (filename.endsWith("." + imageType)) {
                determinedFileTypeByEnding.urlType = MOD_FILE_TYPES.IMAGE;
                determinedFileTypeByEnding.urlFileExtension = imageType;

                return determinedFileTypeByEnding;
            }
        }

        for (let audioType of ["mp3", "wav"]) {
            if (filename.endsWith("." + audioType)) {
                determinedFileTypeByEnding.urlType = MOD_FILE_TYPES.AUDIO;
                determinedFileTypeByEnding.urlFileExtension = audioType;

                return determinedFileTypeByEnding;
            }
        }

        for (let modelType of ["obj", "txt"]) {
            if (filename.endsWith("." + modelType)) {
                determinedFileTypeByEnding.urlType = MOD_FILE_TYPES.MODEL;
                determinedFileTypeByEnding.urlFileExtension = modelType;

                return determinedFileTypeByEnding;
            }
        }

        if (filename.endsWith(".unity3d")) {
            determinedFileTypeByEnding.urlType = MOD_FILE_TYPES.ASSETBUNDLE;
            determinedFileTypeByEnding.urlFileExtension = "unity3d";
        } else if (filename.endsWith(".pdf")) {
            determinedFileTypeByEnding.urlType = MOD_FILE_TYPES.PDF
            determinedFileTypeByEnding.urlFileExtension = "pdf";
        }

        return determinedFileTypeByEnding;
    }

    static UtilExtractMultilanguageUrls(url: string): string[] {
        if (url === undefined) throw ("undefined");

        let urlCollector = Array(url);

        let urlStringLoop = url;
        let isPopdUrlCollector = false;
        while (true) {
            let matches = urlStringLoop.match(new RegExp(/(\{.*?\}(.*?))(\{|$)/));
            if (matches !== null) {
                if (!isPopdUrlCollector) {
                    urlCollector.pop();
                    isPopdUrlCollector = true;
                }
                urlCollector.push(matches[2].trim());
                urlStringLoop = urlStringLoop.substring(matches[1].length);
            } else break;
        }

        return urlCollector;
    }

    static UtilConvertURLToFilename(url: string) {
        return url.replace(/[^A-Za-z0-9]+/gm, "");
    }
}