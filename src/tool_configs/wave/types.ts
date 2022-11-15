export interface WaveResult {
    status: Status;
    statistics: Statistics;
    categories: Categories;
}

export interface Status {
    success: boolean;
    httpstatuscode: number;
}

export interface Statistics {
    pagetitle: string;
    pageurl: string;
    time: number;
    creditsremaining: number;
    allitemcount: number;
    totalelements: number;
    waveurl: string;
}

export interface Categories {
    error?: Error;
    contrast?: Contrast;
    alert?: Alert;
    feature?: Feature;
    structure?: Structure;
    aria?: Aria;
}

export interface Error {
    description: string;
    count: number;
    items?: Items;
}

export interface Items {
    [item: string]: Item;
}

export interface Item {
    id: string;
    description: string;
    count: number;
    selectors?: (string)[] | null;
}

export interface Contrast {
    description: string;
    count: number;
    items?: { contrast: ContrastItem };
}

export interface ContrastItem extends Item {
    contrastdata: Array<[number, string, string, boolean]>
}

export interface Alert {
    description: string;
    count: number;
    items?: Items;
}

export interface Feature {
    description: string;
    count: number;
    items?: Items;
}

export interface Structure {
    description: string;
    count: number;
    items?: Items;
}

export interface Aria {
    description: string;
    count: number;
    items?: Items;
}

export interface WaveDocs {
    name: string;
    title: string;
    type: string;
    summary: string;
    guidelines: Guideline[];
}

export interface Guideline {
    name: string;
    link: string;
}
