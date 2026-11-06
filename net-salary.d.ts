import { BTL_MAX_INCOME_MONTHLY, BTL_REDUCED_LIMIT_MONTHLY, CREDIT_POINT_ANNUAL, DEFAULT_CREDIT_POINTS, TAX_YEAR, WOMAN_EXTRA_POINTS, formatBasisPoints, formatPoints, formatShekels, parseAmount, parsePoints, type Gender, type IncomeTaxBreakdown } from './self-employed-tax.js';
export { BTL_MAX_INCOME_MONTHLY, BTL_REDUCED_LIMIT_MONTHLY, CREDIT_POINT_ANNUAL, DEFAULT_CREDIT_POINTS, TAX_YEAR, WOMAN_EXTRA_POINTS, formatBasisPoints, formatPoints, formatShekels, parseAmount, parsePoints, type Gender, };
export type Severance = 'partial' | 'full';
export type SalaryInput = {
    gross: number;
    creditPointsHundredths: number;
    hishtalmut: boolean;
    severance: Severance;
};
export type RatePair = {
    reduced: number;
    full: number;
};
export type BtlSplit = {
    base: number;
    reducedPart: number;
    fullPart: number;
    national: number;
    health: number;
    total: number;
};
export type SalaryResult = {
    gross: number;
    hishtalmutBenefit: number;
    taxable: number;
    incomeTax: IncomeTaxBreakdown;
    pensionCredit: number;
    tax: number;
    btl: BtlSplit;
    pension: number;
    hishtalmut: number;
    deductions: number;
    net: number;
    employer: {
        btl: number;
        pension: number;
        severance: number;
        severanceBasisPoints: number;
        hishtalmut: number;
        total: number;
        cost: number;
    };
};
export declare const REVIEWED_LABEL = "28.10.2026";
export declare const SOURCES: {
    readonly taxBooklet: {
        readonly href: "https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf";
        readonly label: "רשות המסים: לוח עזר לחישוב מס הכנסה ממשכורת ושכר עבודה לחודש ינואר 2026 ואילך";
        readonly note: "מדרגות המס החודשיות של 2026, סף מס היסף ונקודת זיכוי של 242 ₪ לחודש";
    };
    readonly taxBrackets: {
        readonly href: "https://www.kolzchut.org.il/he/%D7%9E%D7%93%D7%A8%D7%92%D7%95%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94";
        readonly label: "כל זכות: מדרגות מס הכנסה";
        readonly note: "טבלת המדרגות של 2026 לשנה ולחודש ודוגמה לחישוב מס על 15,000 ₪";
    };
    readonly btlEmployee: {
        readonly href: "https://www.btl.gov.il/Insurance/Rates/Pages/%D7%9C%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D%20%D7%A9%D7%9B%D7%99%D7%A8%D7%99%D7%9D.aspx";
        readonly label: "הביטוח הלאומי: שיעורי דמי ביטוח לעובדים שכירים";
        readonly note: "שיעורי העובד והמעסיק, המדרגה המופחתת של 7,703 ₪ והתקרה של 51,910 ₪ מ-1 בינואר 2026";
    };
    readonly pensionCredit: {
        readonly href: "https://www.kolzchut.org.il/he/%D7%96%D7%99%D7%9B%D7%95%D7%99_%D7%9E%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_%D7%91%D7%92%D7%99%D7%9F_%D7%94%D7%A4%D7%A8%D7%A9%D7%95%D7%AA_%D7%9C%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%A4%D7%A0%D7%A1%D7%99%D7%95%D7%A0%D7%99";
        readonly label: "כל זכות: זיכוי ממס הכנסה בגין הפרשות לביטוח פנסיוני";
        readonly note: "זיכוי של 35% על הפרשות העובד עד 7% מהשכר, עד הכנסה מבוטחת של 9,700 ₪ לחודש ב-2026 (סעיף 45א)";
    };
    readonly hishtalmut: {
        readonly href: "https://www.kolzchut.org.il/he/%D7%A7%D7%A8%D7%9F_%D7%94%D7%A9%D7%AA%D7%9C%D7%9E%D7%95%D7%AA";
        readonly label: "כל זכות: קרן השתלמות";
        readonly note: "תקרת שכר של 15,712 ₪ לחודש להפקדת המעסיק בפטור ממס, נכון ל-2026";
    };
    readonly pensionOrder: {
        readonly href: "https://www.kolzchut.org.il/he/%D7%97%D7%95%D7%91%D7%AA_%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%A4%D7%A0%D7%A1%D7%99%D7%95%D7%A0%D7%99_%D7%9C%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D";
        readonly label: "כל זכות: חובת ביטוח פנסיוני לעובדים";
        readonly note: "שיעורי ההפרשה בצו ההרחבה: 6% עובד, 6.5% מעסיק לתגמולים ו-6% לפיצויים";
    };
};
export declare const BTL_EMPLOYEE_RATES: {
    national: {
        reduced: number;
        full: number;
    };
    health: {
        reduced: number;
        full: number;
    };
};
export declare const BTL_EMPLOYER_RATES: RatePair;
export declare const PENSION_EMPLOYEE_BASIS_POINTS = 600;
export declare const PENSION_EMPLOYER_BASIS_POINTS = 650;
export declare const SEVERANCE_BASIS_POINTS: Record<Severance, number>;
export declare const HISHTALMUT_EMPLOYEE_BASIS_POINTS = 250;
export declare const HISHTALMUT_EMPLOYER_BASIS_POINTS = 750;
export declare const HISHTALMUT_SALARY_CEILING_MONTHLY = 15712;
export declare const PENSION_CREDIT_RATE_BASIS_POINTS = 3500;
export declare const PENSION_CREDIT_SHARE_BASIS_POINTS = 700;
export declare const PENSION_CREDIT_SALARY_CEILING_MONTHLY = 9700;
export declare const MAX_GROSS_MONTHLY = 1000000;
export declare function pensionCreditFor(gross: number): number;
export declare function calculateSalary({ gross, creditPointsHundredths, hishtalmut, severance }: SalaryInput): SalaryResult;
export declare function grossForNet(targetNet: number, options: Omit<SalaryInput, 'gross'>): number | null;
export declare const defaultPoints: (gender: Gender) => number;
export declare const ratio: (part: number, whole: number) => number;
export declare const formatRatio: (value: number) => string;
export declare function resultToText(result: SalaryResult): string;
