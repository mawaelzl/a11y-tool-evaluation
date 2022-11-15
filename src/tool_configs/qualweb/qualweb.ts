import { ToolConfig } from "../../types/ToolConfig";
import { EvaluationReport, QualWeb } from "@qualweb/core";

const {executablePath} = require('puppeteer');

export const qualwebConfig: ToolConfig<EvaluationReport> = {
    name: "QualWeb",
    evaluateWithoutPuppeteer: async (url: string) => {
        const qualWeb = new QualWeb();
        await qualWeb.start(undefined, {executablePath: executablePath()});
        const report = await qualWeb.evaluate({url});
        await qualWeb.stop();
        return report[url];
    },
    map: (result: EvaluationReport) => {
        let wcagTechniqueAssertions = result.modules["wcag-techniques"] === undefined ?
            [] :
            Object.values(result.modules["wcag-techniques"].assertions);
        let actRuleAssertions = result.modules["act-rules"] === undefined ?
            [] :
            Object.values(result.modules["act-rules"].assertions);
        let bestPracticeAssertions = result.modules["best-practices"] === undefined ?
            [] :
            Object.values(result.modules["best-practices"].assertions);

        const violationsPerElement = [...wcagTechniqueAssertions, ...actRuleAssertions, ...bestPracticeAssertions]
            .reduce((acc: Map<string, Set<string>>, assertions) => {
                const guidelines = assertions.metadata["success-criteria"]?.map(criteria => criteria.name.trim());
                let failures = assertions.results.filter(result => result.verdict === "failed");

                for (let {pointer} of failures.flatMap(failure => failure.elements)) {
                    if (guidelines !== undefined && pointer !== undefined) {
                        if (acc.has(pointer)) {
                            const setPerElement = acc.get(pointer);
                            setPerElement && guidelines.forEach(guideline => setPerElement.add(guideline));
                        } else {
                            acc.set(pointer, new Set(guidelines));
                        }
                    }
                }
                return acc;
            }, new Map());

        return [...violationsPerElement.values()].flatMap(violations => [...violations.values()]);
    }
}