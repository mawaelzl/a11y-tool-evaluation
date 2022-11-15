import { ToolConfig } from "../../types/ToolConfig";
import { fetch } from "../../utils/fetch";
import { cacheResponse } from "../../utils/cacheResponse";
import { Base64 } from "../../utils/base64";
import { WaveDocs, WaveResult } from "./types";
import { readFile } from "node:fs/promises";
import path from "path";

let waveMapping: Map<string, string[]> | undefined = undefined;

export const waveConfig: ToolConfig<WaveResult> = {
    name: "WAVE",
    beforeAll: async () => {
        waveMapping = new Map<string, string[]>();
        const docs: Array<WaveDocs> = JSON.parse(await readFile(path.resolve(__dirname, "info.json"), {encoding: "utf-8"}));
        for (const doc of docs) {
            const guidelines = doc.guidelines
                .map(guideline => /(?<foundGuideline>^\d.\d.\d{1,2})/.exec(guideline.name)?.groups?.foundGuideline)
                .filter((guideline): guideline is string => guideline !== undefined);

            waveMapping!.set(doc.name, guidelines);
        }
    },
    evaluateWithoutPuppeteer: async (url: string) => {
        let result = await cacheResponse(Base64.encode(`wave:${url}`), () => WaveFetcher.fetch(url));
        return JSON.parse(result);
    },
    map: async (result: WaveResult) => {
        let categories = result.categories;
        let errors = categories?.error?.items === undefined ?
            [] :
            Object.values(categories?.error?.items);
        let alerts = categories?.alert?.items === undefined ?
            [] :
            Object.values(categories?.alert?.items);
        let contrastErrors = categories?.contrast?.items === undefined ?
            [] :
            Object.values(categories?.contrast?.items);
        return [...errors, /*...alerts,*/ ...contrastErrors]
            .flatMap(item => {
                const guidelineOccurrences = new Array<string>();
                const guidelines = waveMapping!.get(item.id) ?? [];
                for (let i = 0; i < item.count; i++) {
                    guidelineOccurrences.push(...guidelines);
                }
                return guidelineOccurrences;
            });
    }
}


class WaveFetcher {
    static keys = ["WKigBu692988", "hX2eStJP2989", "AmHFDc452990", "3qESWY7n2991"];
    static keysIndex: number = 0;

    static async fetch(url: string): Promise<string> {
        const query = `https://wave.webaim.org/api/request?key=${WaveFetcher.keys[WaveFetcher.keysIndex]}&reporttype=4&url=${encodeURIComponent(url)}`

        const response = await fetch(query);

        if (/^{"status":{"success":false/.test(response)) {
            console.log("Error querying WAVE. Trying next key.");

            if (WaveFetcher.keysIndex >= WaveFetcher.keys.length - 1) throw new Error("Could not query WAVE with any of the keys");

            WaveFetcher.keysIndex++;

            return await WaveFetcher.fetch(url);
        }

        return response;
    }
}
