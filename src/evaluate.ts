import { Browser } from "puppeteer";
import { toolConfigs } from "./tool_configs/toolConfigs";
import { ToolConfig } from "./types/ToolConfig";
import { isPromise } from "util/types";
import { compareGuidelines } from "./utils/compareGuidelines";
import { waitUntilHTMLRendered } from "./utils/waitUntilHTMLRendered";
import { timeoutPromise } from "./utils/timeoutPromise";
import { urls } from "./urls";
import { ToolError } from "./types/ToolError";
import { EvaluationResult } from "./types/EvaluationResult";
import { ToolResult } from "./types/ToolResult";
import { writeResults } from "./utils/writeResults";
import { readFile } from "node:fs/promises";

const puppeteer = require('puppeteer-core');

const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const toolTimeout = 120000;
let toolTimeoutMessage = "Tool did not finish in time";
const maxPageLoadWaitTime = 21000;
const fixupRun = false;

const startEvaluation = async () => {
    const browser = await puppeteer.launch({
        executablePath,
        // devtools: true,
        args: ['--ignore-certificate-errors'],
    });

    const violationsByTool = new Map<string, ToolResult>();

    for (let toolConfig of toolConfigs) {
        const urlsToEvaluate = fixupRun ?
            (await getPreviousResult(toolConfig.name)).errors.map(error => error.website) :
            urls;

        await toolConfig.beforeAll?.();
        const violationsOfTool = await runTool(browser, toolConfig, urlsToEvaluate);
        violationsByTool.set(toolConfig.name, violationsOfTool);
        await toolConfig.afterAll?.();

        const violationsToWrite = fixupRun ? await mergeResults(toolConfig.name, violationsOfTool) : violationsOfTool;

        await writeResults(toolConfig.name, violationsToWrite);
    }

    console.log(violationsByTool);

    await browser.close();
}

const mergeResults = async (toolName: string, newResult: ToolResult) => {
    const resultToFix = await getPreviousResult(toolName);
    resultToFix.result = new Map(Object.entries(resultToFix.result))

    resultToFix.errors = newResult.errors;

    for (let [guideline, occurrences] of newResult.result.entries()) {
        if (resultToFix.result.has(guideline)) {
            let previousOccurrences = resultToFix.result.get(guideline)!;
            previousOccurrences.websites = [...new Set([...previousOccurrences.websites, ...occurrences.websites])]
            previousOccurrences.occurrences += occurrences.occurrences;
        } else {
            resultToFix.result.set(guideline, occurrences)
        }
    }

    return resultToFix;
}

const getPreviousResult = async (toolName: string): Promise<ToolResult> => {
    try {
        const rawResult = await readFile(`./tool_results/result/${toolName}.json`, {encoding: "utf-8"});
        return JSON.parse(rawResult);
    } catch (e) {
        throw new Error(`Could not get previous result for ${toolName}`);
    }
}

const runTool = async <T>(browser: Browser, toolConfig: ToolConfig<T>, urlsToCheck: string[]): Promise<ToolResult> => {
    const violationsForTool: EvaluationResult = new Map();
    const errors: ToolError[] = [];

    for (let url of urlsToCheck) {
        console.log(`Using "${toolConfig.name}" to test ${url}`)

        const violationsPerUrl = new Map<string, number>();

        let violations: string[] = [];

        try {
            violations = await evaluatePage(browser, url, toolConfig);
        } catch (e) {
            console.log(`Could not evaluate "${url}"`);
            console.log(e);
            errors.push({website: url, cause: (e as Error).message});
        }

        violations.forEach(violation => violationsPerUrl.set(
            violation,
            violationsPerUrl.has(violation) ? violationsPerUrl.get(violation)! + 1 : 1)
        );

        for (let [id, count] of violationsPerUrl.entries()) {
            if (violationsForTool.has(id)) {
                let violationForTool = violationsForTool.get(id);
                violationForTool!.websites.includes(url) || violationForTool!.websites.push(url);
                violationForTool!.occurrences += count;
            } else {
                violationsForTool.set(id, {websites: [url], occurrences: count})
            }
        }
    }

    let result = new Map([...violationsForTool].sort((a, b) => compareGuidelines(a[0], b[0])));
    return {errors, result};
}

const evaluatePage = async <T>(browser: Browser, url: string, toolConfig: ToolConfig<T>) => {
    const result = toolConfig.evaluateWithoutPuppeteer === undefined ?
        await evaluateWithPuppeteer(browser, url, toolConfig) :
        await timeoutPromise(toolConfig.evaluateWithoutPuppeteer(url), toolTimeout, toolTimeoutMessage);

    const mappingResult = toolConfig.map(result);

    return isPromise(mappingResult) ? await mappingResult : mappingResult;
}

async function evaluateWithPuppeteer<T>(browser: Browser, url: string, toolConfig: ToolConfig<T>) {
    const page = await browser.newPage();

    await page.goto(url, {waitUntil: 'load', timeout: 120000});

    await waitUntilHTMLRendered(page, maxPageLoadWaitTime);

    await toolConfig.setupPage?.(page);

    // page.on('console', msg => {
    //     console.log(msg.text());
    // });

    if (toolConfig.evaluate === undefined) throw new Error("ToolConfig.evaluate must be set to run with Puppeteer");

    const result = await timeoutPromise(toolConfig.evaluate(page), toolTimeout, toolTimeoutMessage);

    await page.close();

    return result;
}

startEvaluation();