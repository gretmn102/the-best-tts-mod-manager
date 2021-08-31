const Registry = require('rage-edit');
import * as VDF from '@node-steam/vdf';
import * as fs from "fs-extra";
import { ConfigGame } from '../shared/structures/tabletopsimulator/registry_configs';
import { getDocumentsFolder } from 'platform-folders';

const isOSWin64 = () => process.arch === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');

export class TTS_Settings {

    static async UtilGetRegistryPathSteam(): Promise<string> {
        let SteamInstallPath = undefined;

        if (isOSWin64())
            SteamInstallPath = await Registry.get("HKLM\\SOFTWARE\\WOW6432Node\\Valve\\Steam", "InstallPath");
        else
            SteamInstallPath = await Registry.get("HKLM\\SOFTWARE\\Valve\\Steam", "InstallPath");

        return SteamInstallPath;
    }

    static async UtilGetSteamLibPathsFromSteamVdfLibraryFile(filePath: string) {
        if (await fs.pathExists(filePath)) {
            let vdfObject = await VDF.parse(await fs.readFile(filePath, "utf-8"));
            if (vdfObject && vdfObject["LibraryFolders"] !== undefined) {
                let libPaths: string[] = Array();

                for (let [key, value] of Object.entries(<[string, string]>vdfObject["LibraryFolders"])) {
                    if (/^\d+$/.test(key)) {
                        let libPath = value.replace(/\\\\/gm, "\\");
                        libPaths.push(libPath);
                    }
                }
                return libPaths;
            }
        }
        return [];
    }

    static async UtilGetRegistrySettingsTabletopSimulator(): Promise<boolean | undefined> {
        let configReg: any = await Registry.get("HKEY_CURRENT_USER\\SOFTWARE\\Berserk Games\\Tabletop Simulator");
        if (configReg !== undefined && configReg.$values !== undefined && configReg.$values !== {}) {

            for (let [key, value] of Object.entries(<[string, Buffer | string | number]>configReg.$values)) {
                if (key.match(/ConfigGame\_/i)) {
                    let string = (<Buffer>value).toString('utf8').replace(/^.*?\{\s*(.*)\s*\}.*?$/, "{$1}");
                    return (<ConfigGame>JSON.parse(string)).ConfigMods.Location;
                }
            }
        }
        return undefined;
    }

    static async UtilFindTabletopSimulatorGameDir(): Promise<string | undefined> {
        let steamDir = await this.UtilGetRegistryPathSteam();
        if (steamDir !== undefined) {
            let checkArray: string[] = Array(steamDir);
            let loadedSteamLibs = false;

            while (checkArray.length > 0) {
                let pathToCheck = checkArray.shift();
                if (await fs.pathExists(pathToCheck + "\\steamapps\\common\\Tabletop Simulator\\")) {
                    let finalPath = pathToCheck + "\\steamapps\\common\\Tabletop Simulator";
                    return finalPath;
                } else {
                    if (!loadedSteamLibs) {
                        checkArray.push(...await this.UtilGetSteamLibPathsFromSteamVdfLibraryFile(steamDir + "\\steamapps\\libraryfolders.vdf"))
                        loadedSteamLibs = true;
                    }
                }
            }
        }
        return undefined;
    }

    static async UtilFindModsDir(pathToGameDir: string, isInstallModResourcesToGameDir: boolean): Promise<string | undefined> {
        let finalPath = undefined;
        if (pathToGameDir !== undefined && isInstallModResourcesToGameDir !== undefined) {
            if (isInstallModResourcesToGameDir) {
                finalPath = pathToGameDir + "\\Tabletop Simulator_Data\\Mods";
            } else {
                finalPath = await TTS_Settings.UtilGetDocumentsDirectory() + "\\My Games\\Tabletop Simulator\\Mods";
            }
        }
        return finalPath;
    }

    static UtilIsEmptyJsonValue(value: any) {
        return !value // https://www.w3docs.com/snippets/javascript/how-to-check-for-empty-undefined-null-string-in-javascript.html
    }

    static async UtilGetDocumentsDirectory(): Promise<string> {
        return getDocumentsFolder();
    }
}