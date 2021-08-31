import { TTS_Settings } from "./tts_settings";
import * as fs from "fs-extra";

export class Program_Settings {
    public nameOfInstalledMod: string = "cm_{MOD_NAME}";
    public isInstallModResourcesToGameDir?: boolean;

    public pathToGameDir?: string;
    public pathToModsDir?: string;

    public tempFolder = __dirname + "\\..\\devTest\\sys-temp\\download";

    async loadSettings() {
        await fs.ensureDir(this.tempFolder);

        if (this.pathToGameDir === undefined) {
            this.pathToGameDir = await TTS_Settings.UtilFindTabletopSimulatorGameDir();
        }

        if (this.isInstallModResourcesToGameDir === undefined) {
            this.isInstallModResourcesToGameDir = await TTS_Settings.UtilGetRegistrySettingsTabletopSimulator();
        }

        if (this.pathToModsDir === undefined) {
            this.pathToModsDir = await TTS_Settings.UtilFindModsDir(<string>this.pathToGameDir, <boolean>this.isInstallModResourcesToGameDir);
        }
    }
}