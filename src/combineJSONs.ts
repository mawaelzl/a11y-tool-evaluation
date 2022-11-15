// import { writeFile, readdir } from "node:fs/promises";
//
// const combineJSONs = async () => {
//     const dir = readdir(path)
//     await writeFile(`./tool_results/result/${toolName}.json`, JSON.stringify(toolResult));
// }
//
// try {
//
//     await writeFile(`./tool_results/level/${toolName}.json`, JSON.stringify(levelViolations));
//     await writeFile(`./tool_results/guideline/${toolName}.json`, JSON.stringify(guidelineViolations));
// } catch (e) {
//     console.log(`Could not save result of ${toolName}`, e)
// }