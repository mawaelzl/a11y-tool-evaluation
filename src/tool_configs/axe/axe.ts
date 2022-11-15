import { Page } from "puppeteer";
import { AxeResults, default as AxeNamespace } from "axe-core";
import { ToolConfig } from "../../types/ToolConfig";

declare const axe: typeof AxeNamespace;

export const axeConfig: ToolConfig<AxeResults> = {
    name: "axe",
    setupPage: async (page: Page) => await page.addScriptTag({path: 'node_modules/axe-core/axe.min.js'}),
    evaluate: async (page: Page) => page.evaluate(async () => await axe.run()),
    map: (result: AxeResults) => {
        return result.violations.flatMap(violation => violation.tags)
            .map(tag => /^wcag(?<guidelinePart>\d{3,4})$/.exec(tag))
            .filter((execResult): execResult is RegExpExecArray => execResult !== null)
            .map(execResult => execResult!.groups!.guidelinePart as string)
            .map(guidelinePart => {
                let wcagGuideline = `${guidelinePart[0]}.${guidelinePart[1]}.${guidelinePart[2]}`;
                if (guidelinePart.length === 4) wcagGuideline += guidelinePart[3];
                return wcagGuideline;
            });
    }
}