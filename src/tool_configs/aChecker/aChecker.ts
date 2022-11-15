import { Page } from "puppeteer";
import { ToolConfig } from "../../types/ToolConfig";
import { ICheckerError, ICheckerResult, ReportResult } from "accessibility-checker/lib/api/IChecker";
import * as aChecker from "accessibility-checker";

let ruleMap: Map<string, string[]>;

export const aCheckerConfig: ToolConfig<ICheckerResult> = {
    name: "IBM Equal Access Accessibility Checker",
    beforeAll: async () => {
        const rules: Array<any> = await aChecker.getRules();
        ruleMap = rules.reduce((acc: Map<string, Array<string>>, curr: any) => {

            acc.set(curr.id, curr.rulesets.flatMap((set: any) => set.num));

            return acc;
        }, new Map<string, Array<string>>());
    },
    evaluate: async (page: Page) => await aChecker.getCompliance(page, Date.now().toString()),
    map: (checkerResult: ICheckerResult) => {
        if (hasErrors(checkerResult.report)) throw new Error("Equal Access Accessibility Checker: could not evaluate")

        return checkerResult.report.results
            .flatMap(result => ruleMap.get(result.ruleId))
            .filter((violatedWcag): violatedWcag is string => violatedWcag !== undefined);
    }
}

const hasErrors = (result: ReportResult): result is ICheckerError => {
    return !result.hasOwnProperty("results");
}