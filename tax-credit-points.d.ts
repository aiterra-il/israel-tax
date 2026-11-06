import { type ParsedNumber } from './vat-calculator.js';
export type Gender = 'man' | 'woman';
export type ChildBand = 'birth' | 'toTwo' | 'three' | 'fourFive' | 'sixSeventeen' | 'eighteen';
export type DegreeKind = 'none' | 'first' | 'second';
export type MonthYear = {
    month: number;
    year: number;
};
export type CreditLine = {
    key: string;
    label: string;
    twelfths: number;
};
export type CreditInput = {
    gender: Gender;
    children: Record<ChildBand, number>;
    degree: DegreeKind;
    oleh: MonthYear | null;
    soldier: {
        discharge: MonthYear;
        fullService: boolean;
    } | null;
};
export type CreditResult = {
    lines: CreditLine[];
    twelfths: number;
    points: number;
    yearly: number;
    monthly: number;
};
export declare const TAX_YEAR = 2026;
export declare const REVIEWED_DATE = "2026-10-24";
export declare const REVIEWED_LABEL = "24.10.2026";
export declare const POINT_VALUE_MONTHLY = 242;
export declare const POINT_VALUE_ANNUAL = 2904;
export declare const MAX_CHILDREN_PER_BAND = 20;
export declare const RESIDENT_TWELFTHS = 24;
export declare const COMMUTE_TWELFTHS = 3;
export declare const WOMAN_TWELFTHS = 6;
export declare const CHILD_BANDS: ChildBand[];
export declare const CHILD_POINTS_TWELFTHS: Record<Gender, Record<ChildBand, number>>;
export declare const childBandLabel: (band: ChildBand) => string;
export declare const OLEH_SCHEDULE: {
    months: number;
    twelfths: number;
}[];
export declare const OLEH_FIRST_ALIYAH_YEAR = 2022;
export declare const SOLDIER_MONTHS = 36;
export declare const SOLDIER_TWELFTHS_FULL = 2;
export declare const SOLDIER_TWELFTHS_SHORT = 1;
export declare const DEGREE_TWELFTHS: Record<DegreeKind, number>;
export declare function olehTwelfthsInYear(aliyah: MonthYear, taxYear?: number): number;
export declare function soldierTwelfthsInYear(discharge: MonthYear, fullService: boolean, taxYear?: number): number;
export declare function childrenTwelfths(gender: Gender, children: Record<ChildBand, number>): number;
export declare function calculateCredits(input: CreditInput): CreditResult;
export declare function parseCount(input: string): ParsedNumber;
export declare const formatShekels: (amount: number) => string;
export declare const formatPoints: (twelfths: number) => string;
export declare function resultToText(result: CreditResult): string;
