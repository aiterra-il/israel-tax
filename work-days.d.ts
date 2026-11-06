export type WeekPattern = 'sun-thu' | 'sun-fri';
export type WorkSettings = {
    week: WeekPattern;
    countEves: boolean;
    countCholHamoed: boolean;
};
export type SpecialKind = 'rest' | 'eve' | 'chol-hamoed' | 'chol-hamoed-eve';
export type SpecialDay = {
    day: number;
    name: string;
    kind: SpecialKind;
};
export type ParsedDate = {
    ok: true;
    day: number;
} | {
    ok: false;
    reason: 'empty' | 'invalid' | 'out-of-range';
};
export type ParsedCount = {
    ok: true;
    value: number;
} | {
    ok: false;
    reason: 'empty' | 'invalid' | 'out-of-range';
};
export type RangeCount = {
    workDays: number;
    calendarDays: number;
    weekendDays: number;
    offDays: SpecialDay[];
};
export type DeadlineResult = {
    due: number;
    calendarDays: number;
    weekendDays: number;
    offDays: SpecialDay[];
};
export type PaymentBasis = 'month-end' | 'invoice';
export type PaymentResult = {
    anchor: number;
    due: number;
    dueIsWorkDay: boolean;
    dueSpecial: SpecialDay | null;
    nextWorkDay: number;
    calendarDays: number;
    workDaysUntil: number;
};
export type MonthSummary = {
    month: number;
    workDays: number;
    strictWorkDays: number;
    restDays: SpecialDay[];
};
export type YearSummary = {
    year: number;
    months: MonthSummary[];
    workDays: number;
    strictWorkDays: number;
};
export declare const MIN_YEAR = 2020;
export declare const MAX_YEAR = 2099;
export declare const MIN_DATE = "2020-01-01";
export declare const MAX_DATE = "2099-12-31";
export declare const MAX_WORK_DAYS = 2000;
export declare const MAX_TERM_DAYS = 365;
export declare const DEFAULT_SETTINGS: WorkSettings;
export declare const STRICT_SETTINGS: WorkSettings;
export declare const MONTH_NAMES: string[];
export declare const dayFromParts: (year: number, month: number, date: number) => number;
export declare const weekdayOf: (day: number) => number;
export declare const yearOf: (day: number) => number;
export declare const monthOf: (day: number) => number;
export declare const dateOf: (day: number) => number;
export declare const isoFromDay: (day: number) => string;
export declare const dayFromIso: (iso: string) => number;
export declare const todayIso: () => string;
export declare const lastDayOfMonth: (day: number) => number;
export declare const firstDayOfMonth: (day: number) => number;
export declare const weekdayName: (day: number) => string;
export declare const formatShortDate: (day: number) => string;
export declare const formatDayMonth: (day: number) => string;
export declare const formatDate: (day: number) => string;
export declare const formatLongDate: (day: number) => string;
export declare const formatMonthDay: (day: number) => string;
export declare const workDaysText: (count: number) => string;
export declare const daysText: (count: number) => string;
export declare function parseDate(value: string): ParsedDate;
export declare function parseCount(value: string, min: number, max: number): ParsedCount;
export declare function roshHashanah(year: number): number | null;
export declare function specialDaysForYear(year: number): SpecialDay[] | null;
export declare function specialDaysBetween(from: number, to: number): Map<number, SpecialDay> | null;
export declare const calendarAvailable: () => boolean;
export declare const isWeekend: (day: number, week: WeekPattern) => boolean;
export declare const blocksWork: (special: SpecialDay, settings: WorkSettings) => boolean;
export declare function countWorkDays(from: number, to: number, settings: WorkSettings): RangeCount | null;
export declare function addWorkDays(start: number, count: number, settings: WorkSettings): DeadlineResult | null;
export declare function nextWorkDay(day: number, settings: WorkSettings): number | null;
export declare function paymentDue(invoice: number, termDays: number, basis: PaymentBasis, settings: WorkSettings): PaymentResult | null;
export type CalcMode = 'between' | 'deadline' | 'payment';
export type TermChoice = '30' | '45' | '60' | '90' | 'custom';
export type CalcInputs = {
    start: string;
    end: string;
    includeStart: boolean;
    includeEnd: boolean;
    from: string;
    count: string;
    invoice: string;
    term: TermChoice;
    customTerm: string;
    basis: PaymentBasis;
};
export type Segment = {
    text: string;
    strong?: boolean;
};
export type Detail = {
    label: string;
    value: string;
};
export type CalcOutcome = {
    kind: 'incomplete' | 'invalid' | 'unsupported';
    message: string;
} | {
    kind: 'result';
    sentence: Segment[];
    details: Detail[];
    steps: string[];
    notice: string;
    offDays: SpecialDay[];
    text: string;
};
export declare const DEFAULT_MODE: CalcMode;
export declare const calcModes: {
    id: CalcMode;
    label: string;
    hint: string;
    hash: string;
    question: string;
}[];
export declare const modeFromHash: (hash: string) => CalcMode | null;
export declare const termOptions: {
    value: TermChoice;
    label: string;
}[];
export declare const dateError: (value: string) => "" | "אפשר לבחור תאריך בין 1 בינואר 2020 ל-31 בדצמבר 2099." | "התאריך לא תקין. בחרו יום, חודש ושנה.";
export declare const countError: (value: string, min: number, max: number) => string;
export declare const endBeforeStart: (inputs: CalcInputs) => boolean;
export declare function calculate(mode: CalcMode, inputs: CalcInputs, settings: WorkSettings): CalcOutcome;
export declare function yearSummary(year: number): YearSummary | null;
