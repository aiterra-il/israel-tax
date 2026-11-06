export type VatMode = 'add' | 'extract';
export type VatRateChoice = 'standard' | 'eilat' | 'custom';
export type VatBreakdown = {
    net: number;
    vat: number;
    gross: number;
};
export type ParsedNumber = {
    ok: true;
    hundredths: number;
} | {
    ok: false;
    reason: 'empty' | 'invalid' | 'too-large';
};
export type VatResult = {
    lines: VatBreakdown[];
    total: VatBreakdown;
    roundingGap: boolean;
};
export declare const STANDARD_VAT_RATE = 18;
export declare const MAX_AMOUNT_SHEKELS = 100000000;
export declare const MAX_LINES = 20;
export declare function parseHundredths(input: string): ParsedNumber;
export declare function parseAmount(input: string): ParsedNumber;
export declare function parseRate(input: string): ParsedNumber;
export declare function rateBasisPoints(choice: VatRateChoice, customRate: string): number | null;
export declare function breakdown(agorot: number, mode: VatMode, basisPoints: number): VatBreakdown;
export declare function calculateVat(amounts: number[], mode: VatMode, basisPoints: number): VatResult;
export declare const formatShekels: (agorot: number) => string;
export declare const formatRate: (basisPoints: number) => string;
export declare const formatMultiplier: (basisPoints: number) => string;
export declare function formulaText(total: VatBreakdown, mode: VatMode, basisPoints: number): string;
export declare function resultToText(result: VatResult, basisPoints: number): string;
