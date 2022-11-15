import { Page } from "puppeteer";
import { default as HtmlCSNamespace, Message } from "html_codesniffer";
import { ToolConfig } from "../../types/ToolConfig";
import path from "path";

declare const HTMLCS: typeof HtmlCSNamespace;
declare const HTMLCS_RUNNER: { run: (standard: string) => void }

type SanitizedMessage = Omit<Message, "element"> & { element?: Element };

export const htmlcsConfig: ToolConfig<Array<SanitizedMessage>> = {
    name: "HTML_CodeSniffer",
    setupPage: async (page: Page) => await page.addScriptTag({path: path.resolve(__dirname, '/htmlcs_lib/HTMLCS.js')}),
    evaluate: async (page: Page) => page.evaluate(() => {
        HTMLCS_RUNNER.run('WCAG2AAA');
        const messages: Message[] = HTMLCS.getMessages();

        // circular dependencies
        return messages.map(message => {
            const copy: SanitizedMessage = {...message};
            delete copy.element;
            return copy;
        });
    }),
    map: (violations: SanitizedMessage[]) => {
        return violations
            .filter(violation => violation.type === HTMLCSResultTypes.ERROR)
            .map(el => el.code)
            .map(code => /^WCAG2AAA\.Principle\d\.Guideline\d_\d\.(?<wcagCode>\d_\d_\d)/.exec(code))
            .filter((execResult): execResult is RegExpExecArray => execResult !== null)
            .map(execResult => execResult!.groups!.wcagCode as string)
            .filter((wcagCode): wcagCode is string => wcagCode !== null)
            .map(match => match.replace(/_/g, "."));
    }
}

enum HTMLCSResultTypes {
    ERROR = 1,
    WARNING = 2,
    NOTICE = 3
}