// ─── GST Calculator ─────────────────────────

export function calculateGst(amount: number, rate: number, type: 'intra' | 'inter' = 'intra') {
  const gstAmount = (amount * rate) / 100;
  if (type === 'intra') {
    return {
      cgst: gstAmount / 2,
      sgst: gstAmount / 2,
      igst: 0,
      totalTax: gstAmount,
      total: amount + gstAmount,
    };
  }
  return { cgst: 0, sgst: 0, igst: gstAmount, totalTax: gstAmount, total: amount + gstAmount };
}

// ─── GST Validation ─────────────────────────

export function validateGstin(gstin: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!gstin) {
    errors.push('GSTIN is required');
    return { valid: false, errors };
  }
  if (gstin.length !== 15) errors.push('GSTIN must be 15 characters');
  if (!/^\d{2}/.test(gstin)) errors.push('First 2 characters must be state code (digits)');
  if (!/[A-Z]{5}/.test(gstin.slice(2, 7))) errors.push('Characters 3-7 must be PAN (5 letters)');
  if (!/\d{4}/.test(gstin.slice(7, 11))) errors.push('Characters 8-11 must be digits');
  if (!/[A-Z]/.test(gstin[11])) errors.push('Character 12 must be a letter');
  if (gstin[12] !== 'Z') errors.push('Character 13 must be Z');
  if (!/[A-Z0-9]/.test(gstin[13])) errors.push('Character 14 must be alphanumeric');
  return { valid: errors.length === 0, errors };
}

export function validatePan(pan: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!pan) {
    errors.push('PAN is required');
    return { valid: false, errors };
  }
  if (pan.length !== 10) errors.push('PAN must be 10 characters');
  if (!/^[A-Z]{5}/.test(pan)) errors.push('First 5 characters must be letters');
  if (!/\d{4}/.test(pan.slice(5, 9))) errors.push('Characters 6-9 must be digits');
  if (!/[A-Z]/.test(pan[9])) errors.push('Last character must be a letter');
  return { valid: errors.length === 0, errors };
}

// ─── GST Due Dates ──────────────────────────

export function getGstDueDates(year: number, month: number) {
  const gstr1Due = new Date(year, month, 11); // 11th of next month
  const gstr3bDue = new Date(year, month, 20); // 20th of next month
  const gstr9Due = new Date(year + 1, 0, 31); // Annual return

  return {
    gstr1: {
      period: `${year}-${String(month).padStart(2, '0')}`,
      dueDate: gstr1Due.toISOString().split('T')[0],
      form: 'GSTR-1',
    },
    gstr3b: {
      period: `${year}-${String(month).padStart(2, '0')}`,
      dueDate: gstr3bDue.toISOString().split('T')[0],
      form: 'GSTR-3B',
    },
    gstr9: {
      period: `${year}`,
      dueDate: gstr9Due.toISOString().split('T')[0],
      form: 'GSTR-9 (Annual)',
    },
  };
}

// ─── Penalty Calculator ─────────────────────

export function calculatePenalty(params: {
  taxAmount: number;
  daysLate: number;
  formType: 'gstr1' | 'gstr3b';
}) {
  let penalty = 0;
  let lateFee = 0;

  if (params.formType === 'gstr1') {
    lateFee = Math.min(params.daysLate * 200, 10000); // ₹200/day, max ₹10,000
    if (params.daysLate > 0) {
      penalty = params.taxAmount * 0.1; // 18% p.a. interest
    }
  } else {
    lateFee = Math.min(params.daysLate * 50, 10000); // ₹50/day for nil, ₹200 otherwise
    if (params.daysLate > 0) {
      penalty = (params.taxAmount * 18 * params.daysLate) / (365 * 100);
    }
  }

  return {
    lateFee,
    penalty: Number(penalty.toFixed(2)),
    total: Number((lateFee + penalty).toFixed(2)),
    daysLate: params.daysLate,
  };
}

// ─── ITC Suggestions ────────────────────────

export function getItcSuggestions(
  expenses: Array<{
    vendor: string;
    gstin?: string;
    amount: number;
    gstAmount?: number;
    category: string;
  }>,
) {
  const eligibleCategories = [
    'SOFTWARE',
    'OFFICE_SUPPLIES',
    'EQUIPMENT',
    'TELECOMMUNICATIONS',
    'PROFESSIONAL_SERVICES',
    'MAINTENANCE',
    'TRAVEL',
  ];
  const suggestions: Array<{
    vendor: string;
    amount: number;
    gstAmount: number;
    eligible: boolean;
    reason: string;
  }> = [];

  for (const exp of expenses) {
    const eligible =
      eligibleCategories.includes(exp.category) && !!exp.gstin && (exp.gstAmount || 0) > 0;
    suggestions.push({
      vendor: exp.vendor,
      amount: exp.amount,
      gstAmount: exp.gstAmount || 0,
      eligible,
      reason: eligible
        ? 'Eligible for ITC — valid GSTIN and eligible category'
        : !exp.gstin
          ? 'Missing GSTIN — cannot claim ITC without supplier GSTIN'
          : !exp.gstAmount
            ? 'No GST amount found'
            : 'Category not eligible for ITC',
    });
  }

  const totalEligible = suggestions
    .filter((s) => s.eligible)
    .reduce((sum, s) => sum + s.gstAmount, 0);
  const totalIneligible = suggestions
    .filter((s) => !s.eligible)
    .reduce((sum, s) => sum + s.gstAmount, 0);

  return {
    suggestions,
    summary: {
      totalEligible,
      totalIneligible,
      eligibleCount: suggestions.filter((s) => s.eligible).length,
      totalCount: suggestions.length,
    },
  };
}

// ─── GST Summary Report ─────────────────────

export function generateGstSummary(params: {
  sales: Array<{ taxable: number; cgst: number; sgst: number; igst: number }>;
  purchases: Array<{ taxable: number; cgst: number; sgst: number; igst: number }>;
}) {
  const totalSales = params.sales.reduce(
    (acc, s) => ({
      taxable: acc.taxable + s.taxable,
      cgst: acc.cgst + s.cgst,
      sgst: acc.sgst + s.sgst,
      igst: acc.igst + s.igst,
    }),
    { taxable: 0, cgst: 0, sgst: 0, igst: 0 },
  );

  const totalPurchases = params.purchases.reduce(
    (acc, p) => ({
      taxable: acc.taxable + p.taxable,
      cgst: acc.cgst + p.cgst,
      sgst: acc.sgst + p.sgst,
      igst: acc.igst + p.igst,
    }),
    { taxable: 0, cgst: 0, sgst: 0, igst: 0 },
  );

  const outputGst = totalSales.cgst + totalSales.sgst + totalSales.igst;
  const inputTaxCredit = totalPurchases.cgst + totalPurchases.sgst + totalPurchases.igst;
  const netGstPayable = Math.max(0, outputGst - inputTaxCredit);

  return {
    sales: totalSales,
    purchases: totalPurchases,
    outputGst,
    inputTaxCredit,
    netGstPayable,
    refund: Math.max(0, inputTaxCredit - outputGst),
  };
}
