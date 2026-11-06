export type Sector = 'private' | 'public' | 'branch';
export type RecuperationInput = {
    year: string;
    months: string;
    percent: string;
    sector: Sector;
    rate: string;
};
export type SeniorityRow = {
    from: number;
    to: number | null;
    days: number;
};
export type RecuperationResult = {
    kind: 'result';
    year: number;
    tableDays: number;
    months: number;
    percent: number;
    rate: number;
    days: number;
    amount: number;
    topUp: number | null;
};
export type RecuperationOutcome = RecuperationResult | {
    kind: 'incomplete';
    message: string;
} | {
    kind: 'invalid';
    message: string;
} | {
    kind: 'not-eligible';
    message: string;
} | {
    kind: 'other-sector';
    sector: Exclude<Sector, 'private'>;
    message: string;
};
export type RecuperationErrors = {
    months?: string;
    percent?: string;
    rate?: string;
};
export declare const DAY_RATE_AGOROT = 45150;
export declare const PREVIOUS_RATE_AGOROT = 41800;
export declare const DAY_RATE_TEXT = "451.50";
export declare const RECUPERATION_YEAR = 2026;
export declare const MAX_YEAR_OPTION = 20;
export declare const seniorityTable: SeniorityRow[];
export declare const sectorOptions: {
    value: Sector;
    label: string;
    hint: string;
}[];
export declare const yearOptions: {
    value: string;
    label: string;
}[];
export declare const emptyRecuperationInput: RecuperationInput;
export declare const daysForYear: (year: number) => number;
export declare function computeYear(year: number, months: number, percent: number, rate: number): {
    tableDays: number;
    days: number;
    amount: number;
};
export declare function recuperationErrors(input: RecuperationInput): RecuperationErrors;
export declare function calculateRecuperation(input: RecuperationInput): RecuperationOutcome;
export declare const formatShekels: (agorot: number) => string;
export declare const formatRate: (agorot: number) => string;
export declare const formatDays: (days: number) => string;
export declare const daysLabel: (days: number) => string;
export declare const formatPercent: (hundredths: number) => string;
export declare const yearLabel: (year: number) => string;
export declare const seniorityLabel: ({ from, to }: SeniorityRow) => string;
export declare function daysExpression(result: RecuperationResult): string;
export declare const amountExpression: (result: RecuperationResult) => string;
export type TableRow = {
    years: string;
    days: number;
    full: string;
    half: string;
};
export declare function rateTable(): TableRow[];
export type ExampleLine = {
    label: string;
    days: number;
    amount: number;
};
export type RecuperationExample = {
    title: string;
    lines: ExampleLine[];
    totalDays: number;
    totalAmount: number;
};
export declare function recuperationExamples(): RecuperationExample[];
export declare function resultToText(result: RecuperationResult): string;
