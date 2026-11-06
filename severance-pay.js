import { dayFromParts, formatDate, isoFromDay } from './work-days.js';
export const EXEMPTION_CEILING_YEAR = 2026;
export const EXEMPTION_CEILING_PER_YEAR = 13750;
export const MIN_SENIORITY_YEARS = 1;
export const SECTION_14_RATE = 8.33;
export const MAX_SALARY = 1000000;
const MIN_YEAR = 1950;
const MAX_YEAR = 2099;
const DAYS_IN_MONTH_FOR_FRACTION = 30;
export const defaultInput = () => ({ start: '', end: '', salary: '', section14: 'none' });
const parseIso = (value) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match)
        return null;
    const [year, month, date] = [Number(match[1]), Number(match[2]), Number(match[3])];
    if (year < MIN_YEAR || year > MAX_YEAR)
        return null;
    const day = dayFromParts(year, month, date);
    return isoFromDay(day) === value.trim() ? day : null;
};
const parseMoney = (value) => {
    const cleaned = value.replace(/[,\s₪]/g, '');
    if (!/^\d+(\.\d{1,2})?$/.test(cleaned))
        return null;
    const parsed = Number(cleaned);
    return parsed > 0 && parsed <= MAX_SALARY ? parsed : null;
};
export function fieldErrors(input) {
    const errors = {};
    const start = input.start.trim() ? parseIso(input.start) : null;
    const end = input.end.trim() ? parseIso(input.end) : null;
    if (input.start.trim() && start === null)
        errors.start = 'תאריך לא תקין.';
    if (input.end.trim() && end === null)
        errors.end = 'תאריך לא תקין.';
    if (start !== null && end !== null && end < start)
        errors.end = 'סיום העבודה לפני תחילתה.';
    if (input.salary.trim() && parseMoney(input.salary) === null) {
        errors.salary = `הקלידו סכום חיובי עד ${MAX_SALARY.toLocaleString('he-IL')} ש״ח.`;
    }
    return errors;
}
const partsOf = (day) => {
    const date = new Date(day * 86400000);
    return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, date: date.getUTCDate() };
};
export function tenureBetween(startDay, endDay) {
    const exclusiveEnd = endDay + 1;
    const from = partsOf(startDay);
    const to = partsOf(exclusiveEnd);
    let months = (to.year - from.year) * 12 + (to.month - from.month);
    if (to.date < from.date)
        months -= 1;
    const anchorMonth = from.month - 1 + months;
    const anchor = dayFromParts(from.year + Math.floor(anchorMonth / 12), (anchorMonth % 12) + 1, from.date);
    const extraDays = Math.max(0, exclusiveEnd - anchor);
    const fraction = Math.min(extraDays, DAYS_IN_MONTH_FOR_FRACTION) / DAYS_IN_MONTH_FOR_FRACTION;
    return { months, extraDays, years: (months + fraction) / 12 };
}
export function calculateSeverance(input) {
    if (Object.values(fieldErrors(input)).some(Boolean)) {
        return { kind: 'invalid', message: 'כדי לראות את התוצאה, תקנו את השדה שמתחתיו הודעת שגיאה.' };
    }
    const start = parseIso(input.start);
    const end = parseIso(input.end);
    const salary = parseMoney(input.salary);
    if (start === null || end === null || salary === null) {
        return { kind: 'incomplete', message: 'כדי לראות את התוצאה, מלאו תאריך תחילת עבודה, תאריך סיום ושכר חודשי אחרון.' };
    }
    const tenure = tenureBetween(start, end);
    const eligibleBySeniority = tenure.months >= MIN_SENIORITY_YEARS * 12;
    const severance = eligibleBySeniority ? Math.round(salary * tenure.years * 100) / 100 : 0;
    const endYear = partsOf(end).year;
    const ceilingApplies = endYear === EXEMPTION_CEILING_YEAR && eligibleBySeniority;
    const exempt = ceilingApplies
        ? Math.min(severance, Math.round(EXEMPTION_CEILING_PER_YEAR * tenure.years * 100) / 100)
        : null;
    return {
        kind: 'result',
        tenure,
        salary,
        eligibleBySeniority,
        section14: input.section14,
        severance,
        exempt,
        taxable: exempt === null ? null : Math.round((severance - exempt) * 100) / 100,
        endYear,
        startDay: start,
        endDay: end,
    };
}
const shekelFormat = new Intl.NumberFormat('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const decimalFormat = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 });
export const shekel = (value) => `${shekelFormat.format(Math.round(value))} ש״ח`;
export const formatYears = (value) => decimalFormat.format(Math.round(value * 100) / 100);
export const tenureText = (tenure) => {
    const years = Math.floor(tenure.months / 12);
    const months = tenure.months % 12;
    const parts = [];
    if (years)
        parts.push(years === 1 ? 'שנה אחת' : `${years} שנים`);
    if (months)
        parts.push(months === 1 ? 'חודש אחד' : `${months} חודשים`);
    if (!years && !months)
        parts.push(tenure.extraDays === 1 ? 'יום אחד' : `${tenure.extraDays} ימים`);
    else if (tenure.extraDays > 0)
        parts.push(tenure.extraDays === 1 ? 'יום אחד' : `${tenure.extraDays} ימים`);
    return parts.join(' ו');
};
export function resultToText(result) {
    const lines = [
        `מחשבון פיצויי פיטורים: ותק ${tenureText(result.tenure)} (${formatYears(result.tenure.years)} שנים), ${formatDate(result.startDay)} עד ${formatDate(result.endDay)}`,
        `שכר חודשי אחרון: ${shekel(result.salary)}`,
    ];
    if (!result.eligibleBySeniority) {
        lines.push('פחות משנה אצל אותו מעסיק: אין זכאות לפיצויי פיטורים לפי החוק, אלא אם יש הסכם או נוהג.');
    }
    else if (result.section14 === 'full') {
        lines.push(`פיצויים מלאים לפי החוק: ${shekel(result.severance)}, מכוסים בהפקדות לפי סעיף 14.`);
    }
    else {
        lines.push(`פיצויי פיטורים: ${shekel(result.severance)}`);
    }
    if (result.exempt !== null && result.taxable !== null) {
        lines.push(`פטור ממס עד ${shekel(result.exempt)}, חלק חייב במס ${shekel(result.taxable)}`);
    }
    lines.push('חישוב עזר לפי חוק פיצויי פיטורים, התשכ״ג-1963. אינו ייעוץ משפטי.');
    lines.push('https://www.aiterra.co.il/tools/severance-pay-calculator');
    return lines.join('\n');
}
