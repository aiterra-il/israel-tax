import { parseAmount, type ParsedNumber } from './vat-calculator.js';
export type Period = 'year' | 'month';
export type Gender = 'man' | 'woman';
export type TaxInput = {
    revenueAgorot: number;
    expensesAgorot: number;
    creditPointsHundredths: number;
    months: number;
};
export type BracketRow = {
    from: number;
    to: number | null;
    rateBasisPoints: number;
    income: number;
    tax: number;
};
export type BtlBreakdown = {
    base: number;
    reducedLimit: number;
    reducedPart: number;
    fullPart: number;
    nationalReduced: number;
    nationalFull: number;
    healthReduced: number;
    healthFull: number;
    national: number;
    health: number;
    total: number;
    deductible: number;
    minimumApplied: boolean;
    ceilingApplied: boolean;
};
export type IncomeTaxBreakdown = {
    taxable: number;
    rows: BracketRow[];
    surtaxThreshold: number;
    surtaxIncome: number;
    surtax: number;
    gross: number;
    creditPointsHundredths: number;
    creditValue: number;
    creditUsed: number;
    net: number;
};
export type TaxResult = {
    months: number;
    revenue: number;
    expenses: number;
    profit: number;
    loss: boolean;
    btl: BtlBreakdown;
    incomeTax: IncomeTaxBreakdown;
    total: number;
    net: number;
    effectiveRate: number;
    marginalRateBasisPoints: number;
    advanceRate: number;
};
export declare const TAX_YEAR = 2026;
export declare const MONTHS_IN_YEAR = 12;
export declare const CREDIT_POINT_ANNUAL = 2904;
export declare const DEFAULT_CREDIT_POINTS: Record<Gender, number>;
export declare const WOMAN_EXTRA_POINTS = 50;
export declare const MAX_CREDIT_POINTS = 40;
export declare const ANNUAL_TAX_BRACKETS: {
    upTo: number | null;
    rateBasisPoints: number;
}[];
export declare const ANNUAL_SURTAX_THRESHOLD = 721560;
export declare const SURTAX_RATE_BASIS_POINTS = 300;
export declare const BTL_REDUCED_LIMIT_MONTHLY = 7703;
export declare const BTL_MAX_INCOME_MONTHLY = 51910;
export declare const BTL_MIN_INCOME_MONTHLY = 3442;
export declare const BTL_RATES: {
    national: {
        reduced: number;
        full: number;
    };
    health: {
        reduced: number;
        full: number;
    };
};
export declare const BTL_DEDUCTIBLE_BASIS_POINTS = 5200;
export declare const monthsFor: (period: Period) => 1 | 12;
export declare function calculateBtl(profit: number, months: number): BtlBreakdown;
export declare function calculateIncomeTax(taxable: number, creditPointsHundredths: number, months: number): IncomeTaxBreakdown;
export declare function calculateTax({ revenueAgorot, expensesAgorot, creditPointsHundredths, months }: TaxInput): TaxResult;
export declare const toAnnual: (amount: number, months: number) => number;
export declare const toMonthly: (amount: number, months: number) => number;
export declare function parsePoints(input: string): ParsedNumber;
export { parseAmount };
export declare const formatShekels: (amount: number) => string;
export declare const formatNumber: (amount: number) => string;
export declare const formatPoints: (hundredths: number) => string;
export declare const formatBasisPoints: (basisPoints: number) => string;
export declare const formatRatio: (ratio: number) => string;
export declare function bracketLabel(row: BracketRow): string;
export declare function resultToText(result: TaxResult, period: Period): string;
