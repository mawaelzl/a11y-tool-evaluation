export interface AccessibilityConcern {
    _path: string;
    _engineTestId: number;
    _attribute: string;
    _bestPracticeId: number;
    _element: string;
    _fixType?: FixType | null;
    _needsReview: boolean;
    _rawEngineJsonObject: RawEngineJsonObject;
    _bestPracticeDescription: string;
    _severity: number;
    _noticeability: number;
    _tractability: number;
    _bestPracticeDetailsUrl: string;
    _bestPracticeStandards?: (BestPracticeStandard)[] | null;
}

export interface RawEngineJsonObject {
    engineTestId: number;
    bestPracticeId: number;
    attribute: string;
    attributeDetail: string;
    element: string;
    testResult: number;
    path: string;
    fixType: FixType | string;
    fingerprint: Fingerprint;
}

export interface FixType {
    fixType: number;
    domSpec: boolean;
    helperText: string;
    fix?: Fix;
}
export interface Fix {
    [property: string]: any;
}
export interface Fingerprint {
    version: number;
    css: string;
    attNo: number;
    encoding?: (number)[] | null;
}
export interface BestPracticeStandard {
    id: number;
    name: string;
}
