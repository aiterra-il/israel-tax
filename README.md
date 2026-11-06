<div dir="rtl">

# israel-tax · מחשבוני מס ושכר לישראל 2026

[![npm](https://img.shields.io/npm/v/israel-tax?color=2447D6)](https://www.npmjs.com/package/israel-tax)
[![tests](https://github.com/aiterra-il/israel-tax/actions/workflows/tests.yml/badge.svg)](https://github.com/aiterra-il/israel-tax/actions/workflows/tests.yml)
[![license](https://img.shields.io/badge/license-MIT-3E96F9)](LICENSE)
![dependencies](https://img.shields.io/badge/dependencies-0-060B22)

כל החישובים שמערכות שכר, הנהלת חשבונות ואפליקציות פיננסיות בישראל צריכות, לפי השיעורים של 2026:

| פונקציה | מה היא מחשבת |
|---|---|
| `netSalary` | שכר נטו מברוטו: מס הכנסה לפי מדרגות, נקודות זיכוי, ביטוח לאומי ומס בריאות, פנסיה, קרן השתלמות, ועלות מעסיק |
| `grossForNet` | כמה ברוטו צריך כדי לקבל נטו מסוים |
| `vat` | הוספת מע״מ 18% או חילוץ שלו מסכום כולל |
| `purchaseTax` | מס רכישה לדירה יחידה, לדירה נוספת ולעולה חדש |
| `selfEmployedTax` | מס הכנסה וביטוח לאומי לעצמאי לפי הכנסות והוצאות |
| `severancePay` | פיצויי פיטורים, כולל תקרת הפטור |
| `creditPoints` | נקודות זיכוי: ילדים לפי גיל, תואר, עולה חדש, חייל משוחרר |
| `recuperationPay` | דמי הבראה לפי ותק והיקף משרה |
| `minimumWage` | שכר מינימום לחודש, לשעה וליום, גם לנוער |

## התקנה

```bash
npm install israel-tax
```

בלי תלויות, עם טיפוסים ל-TypeScript. עובד ב-Node.js 18 ומעלה ובדפדפן. כל הסכומים בשקלים.

## שימוש

```js
import { netSalary, grossForNet, vat, purchaseTax, selfEmployedTax, severancePay } from 'israel-tax'

const salary = netSalary({ gross: 15000 })
salary.net            // 11550
salary.tax            // מס הכנסה אחרי זיכוי פנסיה
salary.btl.total      // ביטוח לאומי ומס בריאות
salary.employer.cost  // עלות מעסיק

netSalary({ gross: 15000, gender: 'woman', creditPoints: 4.75, hishtalmut: true })

grossForNet(10000)                       // 12494
vat(100)                                 // { net: 100, vat: 18, gross: 118, rate: 18 }
vat(118, { mode: 'extract' })            // { net: 100, vat: 18, gross: 118, rate: 18 }
purchaseTax(2500000).tax                 // 20538
purchaseTax(2500000, 'additional').tax   // 200000
selfEmployedTax({ revenue: 300000, expenses: 60000 }).net
severancePay({ start: '2020-01-01', end: '2025-12-31', salary: 12000 }).severance
```

```js
import { creditPoints, recuperationPay, minimumWage } from 'israel-tax'

creditPoints({ gender: 'woman', children: { sixSeventeen: 2 } }).points  // 6.75
recuperationPay({ seniorityYear: 3 }).amount                             // 2709
minimumWage().monthly                                                    // 6443.85
minimumWage({ age: 'age17' }).hourly
```

לכל תחום יש גם מודול מלא, עם כל הקבועים והפונקציות הפנימיות: `salaryModule`, `selfEmployedModule`, `vatModule`, `purchaseTaxModule`, `severanceModule`, `creditPointsModule`, `recuperationModule`, `minimumWageModule`.

## מאיפה המספרים

השיעורים נבדקו מול המקורות הרשמיים באוקטובר 2026:

- [רשות המסים: לוח עזר לחישוב מס הכנסה ממשכורת, 2026](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf): מדרגות המס, מס יסף, נקודת זיכוי של 242 ₪ לחודש
- [ביטוח לאומי: דמי ביטוח לעובדים שכירים](https://www.btl.gov.il/Insurance/Rates/Pages/%D7%9C%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D%20%D7%A9%D7%9B%D7%99%D7%A8%D7%99%D7%9D.aspx): המדרגה המופחתת של 7,703 ₪ והתקרה של 51,910 ₪
- [כל זכות: מדרגות מס הכנסה](https://www.kolzchut.org.il/he/%D7%9E%D7%93%D7%A8%D7%92%D7%95%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94), זיכוי בגין הפרשות לפנסיה, קרן השתלמות, נקודות זיכוי, דמי הבראה ושכר מינימום
- מדרגות מס הרכישה בתוקף מ-16.1.2024 עד 15.1.2028

**חשוב:** החישוב הוא הערכה. הוא לא מחליף תלוש שכר, רואה חשבון או יועץ מס, והוא לא מכסה כל מצב: תיאום מס, הטבות לפריפריה, הפקדות מעל התקרה וכו׳. השיעורים מתעדכנים כל שנה, ולכן כדאי להשתמש בגרסה האחרונה.

## לנסות בלי קוד

המחשבונים באתר של Aiterra, על אותו קוד:

[שכר נטו](https://www.aiterra.co.il/tools/net-salary-calculator) · [מע״מ](https://www.aiterra.co.il/tools/vat-calculator) · [מס רכישה](https://www.aiterra.co.il/tools/purchase-tax-calculator) · [מס לעצמאי](https://www.aiterra.co.il/tools/self-employed-tax-calculator) · [פיצויים](https://www.aiterra.co.il/tools/severance-pay-calculator) · [נקודות זיכוי](https://www.aiterra.co.il/tools/tax-credit-points-calculator) · [דמי הבראה](https://www.aiterra.co.il/tools/recuperation-pay-calculator) · [שכר מינימום](https://www.aiterra.co.il/tools/minimum-wage-2026)

---

נבנה ב-**[Aiterra](https://www.aiterra.co.il)**, סטודיו לבניית אתרים, אוטומציה וסוכני AI בישראל. צריכים מערכת שכר, CRM או אוטומציה לחשבוניות? [דברו איתנו](https://www.aiterra.co.il/contact). רישיון MIT.

</div>

## English

Israeli tax and payroll calculators with 2026 rates: net salary from gross (income tax brackets, credit points, National Insurance and health tax, pension, study fund, employer cost), gross from net, VAT at 18%, purchase tax for first, additional and new-immigrant homes, self-employed income tax and National Insurance, severance pay with the exemption ceiling, credit points, recuperation pay and minimum wage. Amounts are in shekels. Rates were checked against the Israel Tax Authority, National Insurance and Kol Zchut in October 2026. Results are estimates, not tax advice. No dependencies, TypeScript types included, MIT, by [Aiterra](https://www.aiterra.co.il).
