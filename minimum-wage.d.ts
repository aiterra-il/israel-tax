export type WagePeriodId = '2026' | '2025';
export type AgeGroup = 'adult' | 'age17' | 'age16' | 'under16' | 'apprentice';
export type PayBasis = 'monthly' | 'hourly' | 'daily';
export type WorkWeek = '5' | '6';
type AdultRates = {
    monthly: number;
    hourly182: number;
    hourly186: number;
    daily5: number;
    daily6: number;
};
export type WagePeriod = {
    id: WagePeriodId;
    label: string;
    short: string;
    adult: AdultRates;
};
export declare const wagePeriods: WagePeriod[];
export declare const CURRENT_PERIOD: WagePeriodId;
export declare const NEXT_UPDATE_TEXT = "1 \u05D1\u05D0\u05E4\u05E8\u05D9\u05DC 2027";
export declare const YOUTH_HOURS_DIVISOR = 173;
export type AgeGroupInfo = {
    id: AgeGroup;
    label: string;
    short: string;
    percent: number;
};
export declare const ageGroups: AgeGroupInfo[];
export declare const payBases: {
    id: PayBasis;
    label: string;
}[];
export declare const MAX_HOURS = 400;
export declare const MAX_DAYS = 31;
export declare const isYouth: (age: AgeGroup) => age is "age17" | "age16" | "under16" | "apprentice";
export declare const fullMonthly: (periodId: WagePeriodId, age: AgeGroup) => number;
export declare const hourlyRate: (periodId: WagePeriodId, age: AgeGroup) => number;
export declare const lawHourlyRate: (periodId: WagePeriodId) => number;
export declare const dailyRate: (periodId: WagePeriodId, week: WorkWeek) => number;
export declare const basesFor: (age: AgeGroup) => {
    id: PayBasis;
    label: string;
}[];
export type MinimumWageInput = {
    period: WagePeriodId;
    age: AgeGroup;
    basis: PayBasis;
    scope: string;
    hours: string;
    days: string;
    week: WorkWeek;
    paid: string;
};
export declare const defaultInput: MinimumWageInput;
export type FieldErrors = {
    scope?: string;
    hours?: string;
    days?: string;
    paid?: string;
};
export declare function fieldErrors(input: MinimumWageInput): FieldErrors;
export type WageCheck = {
    paid: number;
    gap: number;
    meets: boolean;
    totalGap: number | null;
};
export type MinimumWageResult = {
    kind: 'result';
    period: WagePeriod;
    age: AgeGroupInfo;
    basis: PayBasis;
    minimum: number;
    unit: string;
    fullMonthly: number;
    scopeHundredths: number | null;
    quantity: {
        count: number;
        label: string;
        total: number;
    } | null;
    lawHourly: number | null;
    check: WageCheck | null;
};
export type MinimumWageOutcome = MinimumWageResult | {
    kind: 'invalid';
    message: string;
};
export declare function calculateMinimumWage(input: MinimumWageInput): MinimumWageOutcome;
export declare const formatMoney: (agorot: number) => string;
export declare const formatCount: (hundredths: number) => string;
export declare const formatPercent: (hundredths: number) => string;
export type YouthRow = {
    id: AgeGroup;
    label: string;
    percent: number;
    monthly: number;
    hourly: number;
};
export declare function youthTable(periodId: WagePeriodId): YouthRow[];
export type AdultRow = {
    label: string;
    current: number;
    previous: number;
};
export declare function adultTable(): AdultRow[];
export type ScopeRow = {
    scope: number;
    current: number;
    previous: number;
};
export declare function scopeTable(scopes?: number[]): ScopeRow[];
export declare function resultToText(result: MinimumWageResult): string;
export {};
