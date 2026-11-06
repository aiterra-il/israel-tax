import { BTL_MAX_INCOME_MONTHLY, BTL_REDUCED_LIMIT_MONTHLY, CREDIT_POINT_ANNUAL, DEFAULT_CREDIT_POINTS, TAX_YEAR, WOMAN_EXTRA_POINTS, calculateIncomeTax, formatBasisPoints, formatPoints, formatShekels, parseAmount, parsePoints, } from './self-employed-tax.js';
export { BTL_MAX_INCOME_MONTHLY, BTL_REDUCED_LIMIT_MONTHLY, CREDIT_POINT_ANNUAL, DEFAULT_CREDIT_POINTS, TAX_YEAR, WOMAN_EXTRA_POINTS, formatBasisPoints, formatPoints, formatShekels, parseAmount, parsePoints, };
export const REVIEWED_LABEL = '28.10.2026';
export const SOURCES = {
    taxBooklet: {
        href: 'https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf',
        label: 'רשות המסים: לוח עזר לחישוב מס הכנסה ממשכורת ושכר עבודה לחודש ינואר 2026 ואילך',
        note: 'מדרגות המס החודשיות של 2026, סף מס היסף ונקודת זיכוי של 242 ₪ לחודש',
    },
    taxBrackets: {
        href: 'https://www.kolzchut.org.il/he/%D7%9E%D7%93%D7%A8%D7%92%D7%95%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94',
        label: 'כל זכות: מדרגות מס הכנסה',
        note: 'טבלת המדרגות של 2026 לשנה ולחודש ודוגמה לחישוב מס על 15,000 ₪',
    },
    btlEmployee: {
        href: 'https://www.btl.gov.il/Insurance/Rates/Pages/%D7%9C%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D%20%D7%A9%D7%9B%D7%99%D7%A8%D7%99%D7%9D.aspx',
        label: 'הביטוח הלאומי: שיעורי דמי ביטוח לעובדים שכירים',
        note: 'שיעורי העובד והמעסיק, המדרגה המופחתת של 7,703 ₪ והתקרה של 51,910 ₪ מ-1 בינואר 2026',
    },
    pensionCredit: {
        href: 'https://www.kolzchut.org.il/he/%D7%96%D7%99%D7%9B%D7%95%D7%99_%D7%9E%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_%D7%91%D7%92%D7%99%D7%9F_%D7%94%D7%A4%D7%A8%D7%A9%D7%95%D7%AA_%D7%9C%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%A4%D7%A0%D7%A1%D7%99%D7%95%D7%A0%D7%99',
        label: 'כל זכות: זיכוי ממס הכנסה בגין הפרשות לביטוח פנסיוני',
        note: 'זיכוי של 35% על הפרשות העובד עד 7% מהשכר, עד הכנסה מבוטחת של 9,700 ₪ לחודש ב-2026 (סעיף 45א)',
    },
    hishtalmut: {
        href: 'https://www.kolzchut.org.il/he/%D7%A7%D7%A8%D7%9F_%D7%94%D7%A9%D7%AA%D7%9C%D7%9E%D7%95%D7%AA',
        label: 'כל זכות: קרן השתלמות',
        note: 'תקרת שכר של 15,712 ₪ לחודש להפקדת המעסיק בפטור ממס, נכון ל-2026',
    },
    pensionOrder: {
        href: 'https://www.kolzchut.org.il/he/%D7%97%D7%95%D7%91%D7%AA_%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%A4%D7%A0%D7%A1%D7%99%D7%95%D7%A0%D7%99_%D7%9C%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D',
        label: 'כל זכות: חובת ביטוח פנסיוני לעובדים',
        note: 'שיעורי ההפרשה בצו ההרחבה: 6% עובד, 6.5% מעסיק לתגמולים ו-6% לפיצויים',
    },
};
export const BTL_EMPLOYEE_RATES = { national: { reduced: 104, full: 700 }, health: { reduced: 323, full: 517 } };
export const BTL_EMPLOYER_RATES = { reduced: 451, full: 760 };
export const PENSION_EMPLOYEE_BASIS_POINTS = 600;
export const PENSION_EMPLOYER_BASIS_POINTS = 650;
export const SEVERANCE_BASIS_POINTS = { partial: 600, full: 833 };
export const HISHTALMUT_EMPLOYEE_BASIS_POINTS = 250;
export const HISHTALMUT_EMPLOYER_BASIS_POINTS = 750;
export const HISHTALMUT_SALARY_CEILING_MONTHLY = 15_712;
export const PENSION_CREDIT_RATE_BASIS_POINTS = 3_500;
export const PENSION_CREDIT_SHARE_BASIS_POINTS = 700;
export const PENSION_CREDIT_SALARY_CEILING_MONTHLY = 9_700;
export const MAX_GROSS_MONTHLY = 1_000_000;
const FULL = 10_000;
const applyRate = (amount, basisPoints) => Math.round((amount * basisPoints) / FULL);
function splitBtl(income, rates) {
    const base = Math.min(Math.max(0, income), BTL_MAX_INCOME_MONTHLY);
    const reducedPart = Math.min(base, BTL_REDUCED_LIMIT_MONTHLY);
    const fullPart = base - reducedPart;
    const national = applyRate(reducedPart, rates.national.reduced) + applyRate(fullPart, rates.national.full);
    const health = applyRate(reducedPart, rates.health.reduced) + applyRate(fullPart, rates.health.full);
    return { base, reducedPart, fullPart, national, health, total: national + health };
}
export function pensionCreditFor(gross) {
    const eligibleSalary = Math.min(gross, PENSION_CREDIT_SALARY_CEILING_MONTHLY);
    const eligibleDeposit = Math.min((gross * PENSION_EMPLOYEE_BASIS_POINTS) / FULL, (eligibleSalary * PENSION_CREDIT_SHARE_BASIS_POINTS) / FULL);
    return applyRate(eligibleDeposit, PENSION_CREDIT_RATE_BASIS_POINTS);
}
export function calculateSalary({ gross, creditPointsHundredths, hishtalmut, severance }) {
    const hishtalmutBenefit = hishtalmut
        ? applyRate(Math.max(0, gross - HISHTALMUT_SALARY_CEILING_MONTHLY), HISHTALMUT_EMPLOYER_BASIS_POINTS)
        : 0;
    const taxable = gross + hishtalmutBenefit;
    const incomeTax = calculateIncomeTax(taxable, creditPointsHundredths, 1);
    const pensionCredit = Math.min(incomeTax.net, pensionCreditFor(gross));
    const tax = incomeTax.net - pensionCredit;
    const btl = splitBtl(taxable, BTL_EMPLOYEE_RATES);
    const pension = applyRate(gross, PENSION_EMPLOYEE_BASIS_POINTS);
    const employeeHishtalmut = hishtalmut ? applyRate(gross, HISHTALMUT_EMPLOYEE_BASIS_POINTS) : 0;
    const deductions = tax + btl.total + pension + employeeHishtalmut;
    const employerBtl = splitBtl(taxable, {
        national: BTL_EMPLOYER_RATES,
        health: { reduced: 0, full: 0 },
    }).national;
    const employerPension = applyRate(gross, PENSION_EMPLOYER_BASIS_POINTS);
    const severanceBasisPoints = SEVERANCE_BASIS_POINTS[severance];
    const employerSeverance = applyRate(gross, severanceBasisPoints);
    const employerHishtalmut = hishtalmut ? applyRate(gross, HISHTALMUT_EMPLOYER_BASIS_POINTS) : 0;
    const employerTotal = employerBtl + employerPension + employerSeverance + employerHishtalmut;
    return {
        gross,
        hishtalmutBenefit,
        taxable,
        incomeTax,
        pensionCredit,
        tax,
        btl,
        pension,
        hishtalmut: employeeHishtalmut,
        deductions,
        net: gross - deductions,
        employer: {
            btl: employerBtl,
            pension: employerPension,
            severance: employerSeverance,
            severanceBasisPoints,
            hishtalmut: employerHishtalmut,
            total: employerTotal,
            cost: gross + employerTotal,
        },
    };
}
export function grossForNet(targetNet, options) {
    if (targetNet <= 0)
        return 0;
    let low = 0;
    let high = MAX_GROSS_MONTHLY;
    if (calculateSalary({ ...options, gross: high }).net < targetNet)
        return null;
    while (high - low > 1) {
        const middle = Math.floor((low + high) / 2);
        if (calculateSalary({ ...options, gross: middle }).net >= targetNet)
            high = middle;
        else
            low = middle;
    }
    return high;
}
export const defaultPoints = (gender) => DEFAULT_CREDIT_POINTS[gender];
export const ratio = (part, whole) => (whole > 0 ? part / whole : 0);
const percentFormat = new Intl.NumberFormat('he-IL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const formatRatio = (value) => `${percentFormat.format(value * 100)}%`;
export function resultToText(result) {
    const lines = [
        `מחשבון שכר נטו ועלות מעביד ${TAX_YEAR}, הערכה בלבד`,
        `ברוטו לחודש: ${formatShekels(result.gross)}`,
        `מס הכנסה: ${formatShekels(result.tax)}`,
        `ביטוח לאומי: ${formatShekels(result.btl.national)}`,
        `דמי ביטוח בריאות: ${formatShekels(result.btl.health)}`,
        `פנסיה (עובד): ${formatShekels(result.pension)}`,
    ];
    if (result.hishtalmut > 0)
        lines.push(`קרן השתלמות (עובד): ${formatShekels(result.hishtalmut)}`);
    lines.push(`נטו לחודש: ${formatShekels(result.net)}`, `נקודות זיכוי: ${formatPoints(result.incomeTax.creditPointsHundredths)}`, `עלות מעביד לחודש: ${formatShekels(result.employer.cost)}`);
    return lines.join('\n');
}
