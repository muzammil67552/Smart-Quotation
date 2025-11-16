// LocalStorage utilities for persistent data storage

export interface CompanyProfile {
  companyName: string;
  email: string;
  contactNumber: string;
  logo: string; // base64 encoded image
  referralCode: string;
}

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  clientName: string;
  clientContact: string;
  clientEmail: string;
  date: string;
  items: QuotationItem[];
  subtotal: number;
  taxPercent: number;
  discountPercent: number;
  grandTotal: number;
  termsAndConditions?: string;
}

const STORAGE_KEYS = {
  COMPANY_PROFILE: 'companyProfile',
  QUOTATION_HISTORY: 'quotationHistory',
  LAST_QUOTATION_NUMBER: 'lastQuotationNumber',
} as const;

// Company Profile
export const saveCompanyProfile = (profile: CompanyProfile): void => {
  localStorage.setItem(STORAGE_KEYS.COMPANY_PROFILE, JSON.stringify(profile));
};

export const getCompanyProfile = (): CompanyProfile | null => {
  const data = localStorage.getItem(STORAGE_KEYS.COMPANY_PROFILE);
  return data ? JSON.parse(data) : null;
};

// Quotation History
export const saveQuotation = (quotation: Quotation): void => {
  const history = getQuotationHistory();
  history.unshift(quotation);
  localStorage.setItem(STORAGE_KEYS.QUOTATION_HISTORY, JSON.stringify(history));
};

export const getQuotationHistory = (): Quotation[] => {
  const data = localStorage.getItem(STORAGE_KEYS.QUOTATION_HISTORY);
  return data ? JSON.parse(data) : [];
};

export const deleteQuotation = (id: string): void => {
  const history = getQuotationHistory().filter(q => q.id !== id);
  localStorage.setItem(STORAGE_KEYS.QUOTATION_HISTORY, JSON.stringify(history));
};

export const updateQuotation = (updatedQuotation: Quotation): void => {
  const history = getQuotationHistory();
  const index = history.findIndex(q => q.id === updatedQuotation.id);
  if (index !== -1) {
    history[index] = updatedQuotation;
    localStorage.setItem(STORAGE_KEYS.QUOTATION_HISTORY, JSON.stringify(history));
  }
};

// Generate unique quotation number
export const generateQuotationNumber = (): string => {
  const lastNumber = localStorage.getItem(STORAGE_KEYS.LAST_QUOTATION_NUMBER);
  const nextNumber = lastNumber ? parseInt(lastNumber) + 1 : 1001;
  localStorage.setItem(STORAGE_KEYS.LAST_QUOTATION_NUMBER, nextNumber.toString());
  return `QT-${nextNumber}`;
};

// Backup and Restore
export const exportData = (): string => {
  const data = {
    companyProfile: getCompanyProfile(),
    quotationHistory: getQuotationHistory(),
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.companyProfile) {
      saveCompanyProfile(data.companyProfile);
    }
    if (data.quotationHistory) {
      localStorage.setItem(STORAGE_KEYS.QUOTATION_HISTORY, JSON.stringify(data.quotationHistory));
    }
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};
