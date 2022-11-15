import { ToolError } from "./ToolError";
import { EvaluationResult } from "./EvaluationResult";

export interface ToolResult {
    errors: ToolError[],
    result: EvaluationResult
}