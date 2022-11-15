import { Page } from "puppeteer";
import rules, { Question } from "@siteimprove/alfa-rules";
import { Audit, Outcome } from "@siteimprove/alfa-act";
import { Puppeteer } from "@siteimprove/alfa-puppeteer";
import { ToolConfig } from "../../types/ToolConfig";
import { Page as AlfaPage } from "@siteimprove/alfa-web";
import { Criterion } from "@siteimprove/alfa-wcag/src/criterion.js";

type AlfaOutcome = Outcome<AlfaPage, rules.Target, Question.Metadata, rules.Subject>;

export const alfaConfig: ToolConfig<AlfaOutcome[]> = {
    name: "Alfa",
    setupPage: async (page: Page) => await page.addScriptTag({path: 'node_modules/axe-core/axe.min.js'}),
    evaluate: async (page: Page) => {
        const document: Puppeteer.Type = await page.evaluateHandle(() => window.document) as unknown as Puppeteer.Type;
        let alfaInput = await Puppeteer.toPage(document);
        const results = [...await Audit.of(alfaInput, rules).evaluate()] as unknown as AlfaOutcome[];

        return results.filter(result => result.toJSON().outcome === "failed");
    },
    map: (result: AlfaOutcome[]) => {
        return result.flatMap(violation => violation.rule.requirements)
            .filter((requirement): requirement is Criterion => (<any>requirement).chapter !== undefined)
            .map(criterion => criterion.chapter);
    }
}