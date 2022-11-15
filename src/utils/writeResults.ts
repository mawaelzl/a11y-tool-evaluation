import { ToolResult } from "../types/ToolResult";
import { BarrierLevel, guidelineToBarrierLevel } from "./guidelineToBarrierLevel";
import { writeFile } from "node:fs/promises";

export const writeResults = async (toolName: string, result: ToolResult) => {
    let occurrencesByLevel = [...result.result.entries()].reduce((acc, entry) => {
        let level = guidelineToBarrierLevel[entry[0]];

        const websiteSets: Array<Set<string>> = []
        // noinspection FallThroughInSwitchStatementJS
        switch (level) {
            case BarrierLevel.A:
                websiteSets.push(acc.get(BarrierLevel.A)!);
            case BarrierLevel.AA:
                websiteSets.push(acc.get(BarrierLevel.AA)!);
            case BarrierLevel.AAA:
                websiteSets.push(acc.get(BarrierLevel.AAA)!);
        }

        entry[1].websites.forEach(website => websiteSets.forEach(set => set.add(website)));

        return acc;
    }, new Map<string, Set<string>>([[BarrierLevel.A, new Set()], [BarrierLevel.AA, new Set()], [BarrierLevel.AAA, new Set()]]));

    const toolResult = {errors: result.errors, result: Object.fromEntries(result.result)};

    const levelViolations: { [level: string]: number } = Object.fromEntries(
        [...occurrencesByLevel.entries()]
            .map(entry => [entry[0], entry[1].size]));
    levelViolations["Error"] = result.errors.length;

    const guidelineViolations = Object.fromEntries([...result.result.entries()].map(entry => [entry[0], entry[1].occurrences]));

    try {
        await writeFile(`./tool_results/result/${toolName}.json`, JSON.stringify(toolResult));
        await writeFile(`./tool_results/level/${toolName}.json`, JSON.stringify(levelViolations));
        await writeFile(`./tool_results/guideline/${toolName}.json`, JSON.stringify(guidelineViolations));
    } catch (e) {
        console.log(`Could not save result of ${toolName}`, e)
    }
}