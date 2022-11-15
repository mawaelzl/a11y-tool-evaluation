import { ToolConfig } from "../types/ToolConfig";
import { aCheckerConfig } from "./aChecker/aChecker";
import { alfaConfig } from "./alfa/alfa";
import { axeConfig } from "./axe/axe";
import { htmlcsConfig } from "./htmlCodeSniffer/htmlCodeSniffer";
import { qualwebConfig } from "./qualweb/qualweb";
import { continuumConfig } from "./continuum/continuum";
import { waveConfig } from "./wave/wave";

export const toolConfigs: ToolConfig<any>[] = [
    // aCheckerConfig,
    // alfaConfig,
    axeConfig,
    // continuumConfig,
    // htmlcsConfig,
    // qualwebConfig,
    // waveConfig,
];
