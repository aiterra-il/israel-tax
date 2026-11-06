export type Section14 = 'none' | 'full';
export type SeveranceInput = {
    start: string;
    end: string;
    salary: string;
    section14: Section14;
};
export declare const EXEMPTION_CEILING_YEAR = 2026;
export declare const EXEMPTION_CEILING_PER_YEAR = 13750;
export declare const MIN_SENIORITY_YEARS = 1;
export declare const SECTION_14_RATE = 8.33;
export declare const MAX_SALARY = 1000000;
export declare const defaultInput: () => SeveranceInput;
export type FieldErrors = {
    start?: string;
    end?: string;
    salary?: string;
};
export declare function fieldErrors(input: SeveranceInput): FieldErrors;
export type Tenure = {
    months: number;
    extraDays: number;
    years: number;
};
export declare function tenureBetween(startDay: number, endDay: number): Tenure;
export type SeveranceResult = {
    kind: 'result';
    tenure: Tenure;
    salary: number;
    eligibleBySeniority: boolean;
    section14: Section14;
    severance: number;
    exempt: number | null;
    taxable: number | null;
    endYear: number;
    startDay: number;
    endDay: number;
};
export type SeveranceOutcome = SeveranceResult | {
    kind: 'incomplete';
    message: string;
} | {
    kind: 'invalid';
    message: string;
};
export declare function calculateSeverance(input: SeveranceInput): SeveranceOutcome;
export declare const shekel: (value: number) => string;
export declare const formatYears: (value: number) => string;
export declare const tenureText: (tenure: Tenure) => string;
export declare function resultToText(result: SeveranceResult): string;
