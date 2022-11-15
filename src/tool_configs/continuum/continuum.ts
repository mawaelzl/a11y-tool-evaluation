import { Page } from "puppeteer";
import { ToolConfig } from "../../types/ToolConfig";
import { Continuum } from "./Continuum.community";
import path from "path";
import { JSDOM } from "jsdom";
import { fetch } from "../../utils/fetch";
import { readFile, writeFile } from "node:fs/promises";
import { AccessibilityConcern } from "./types";

declare const continuum: typeof Continuum;

let mapping: Map<number, Array<string>> | undefined;
let wcagMappingPath = path.resolve(__dirname, 'wcag.json');

export const continuumConfig: ToolConfig<AccessibilityConcern[]> = {
    name: "Access Continuum",
    setupPage: async (page: Page) => {
        let rawMapping = await readFile(wcagMappingPath, {encoding: 'utf8'});
        mapping = new Map(Object.entries(JSON.parse(rawMapping)).map(entry => [parseInt(entry[0]), entry[1] as string[]]));

        for (const fileName of ['continuum.conf', 'AccessEngine.community', 'Continuum.community']) {
            await page.addScriptTag({
                path: path.resolve(__dirname, `${fileName}.js`)
            })
                .catch(_ => {
                    console.log(`Level Access Continuum: Could not load ${fileName} script`);
                });
        }
    },
    evaluate: async (page: Page) => page.evaluate(async () => {
        await continuum.setUp(null, null, window);
        return await continuum.runAllTests();
    }),
    map: async (accessibilityConcerns: AccessibilityConcern[]) =>
        (await Promise.all(accessibilityConcerns.map(concern => resolveWCAG(concern._bestPracticeId))))
            .flat(),
    afterAll: async () => mapping !== undefined && await writeFile(wcagMappingPath, JSON.stringify(Object.fromEntries(mapping)))
}

const resolveWCAG = async (violationId: number) => {
    let result: string[];
    if (mapping!.has(violationId)) {
        result = mapping!.get(violationId)!;
    } else {
        const wcags = await fetchWCAG(violationId);
        mapping!.set(violationId, wcags);
        result = wcags;
    }
    return result;
}

const fetchWCAG = async (violationId: number) => {
    const html = await fetch(`https://amp.levelaccess.net/public/standards/view_best_practice.php?violation_id=${violationId}`);

    const dom = new JSDOM(html);

    const standards = dom.window.document.querySelector("#STANDARDS-content>div>div>ul");

    if (standards === null) return [];

    return [...standards.childNodes.values()]
        .filter(node => node.textContent !== null && /WCAG 2.1 Level A{1,3}/.test(node.textContent))
        .flatMap(wcagGuidelineList => [...wcagGuidelineList.childNodes])
        .map(wcagGuidelineListElement => wcagGuidelineListElement.textContent)
        .filter((wcagGuidelineText): wcagGuidelineText is string => wcagGuidelineText !== null)
        .map(wcagGuidelineText => /^(?<wcagGuideline>\d.\d.\d)/.exec(wcagGuidelineText)?.groups?.wcagGuideline)
        .filter((wcagGuideline): wcagGuideline is string => wcagGuideline !== undefined);
}