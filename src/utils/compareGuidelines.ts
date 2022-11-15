import assert from "assert";

export const compareGuidelines = (guideline1: string, guideline2: string) => {
    const guideline1Parts = guideline1.split(".");
    const guideline2Parts = guideline2.split(".");

    assert(guideline1Parts.length === 3 &&
        guideline1Parts.length === 3 &&
        [...guideline1Parts, ...guideline2Parts].every(part => /^\d+$/.test(part)),
        "Guidelines are not in correct format");

    const guideline1Value = 1000 * parseInt(guideline1Parts[0]) + 100 * parseInt(guideline1Parts[1]) + parseInt(guideline1Parts[2]);
    const guideline2Value = 1000 * parseInt(guideline2Parts[0]) + 100 * parseInt(guideline2Parts[1]) + parseInt(guideline2Parts[2]);

    return guideline1Value - guideline2Value;
}