import { Country, Recipient, Transaction, TransactionStatus, Card, CardTransaction, AdvancedTransferLimits, Account, AccountType, CryptoAsset, CryptoHolding, SubscriptionService, SubscriptionServiceType, AppleCardDetails, AppleCardTransaction, SpendingCategory, TravelPlan, TravelPlanStatus, SecuritySettings, TrustedDevice, UserProfile, PlatformSettings, PlatformTheme, Task, Airport, FlightBooking, UtilityBiller, UtilityBill, UtilityType, AtmLocation, AirtimeProvider, AirtimePurchase, PushNotificationSettings, VirtualCard, FaqItem, LeadershipProfile, View, WalletDetails, WalletTransaction, CustomerReview, StaffProfile, Cause } from './types';

export const ALL_COUNTRIES: Country[] = [
    { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
    { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€' },
    { code: 'CA', name: 'Canada', currency: 'CAD', symbol: '$' },
    { code: 'AU', name: 'Australia', currency: 'AUD', symbol: '$' },
    { code: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥' },
    { code: 'FR', name: 'France', currency: 'EUR', symbol: '€' },
    { code: 'CN', name: 'China', currency: 'CNY', symbol: '¥' },
    { code: 'IN', name: 'India', currency: 'INR', symbol: '₹' },
    { code: 'BR', name: 'Brazil', currency: 'BRL', symbol: 'R$' },
    { code: 'RU', name: 'Russia', currency: 'RUB', symbol: '₽' },
    { code: 'IT', name: 'Italy', currency: 'EUR', symbol: '€' },
    { code: 'ES', name: 'Spain', currency: 'EUR', symbol: '€' },
    { code: 'MX', name: 'Mexico', currency: 'MXN', symbol: '$' },
    { code: 'KR', name: 'South Korea', currency: 'KRW', symbol: '₩' },
    { code: 'ID', name: 'Indonesia', currency: 'IDR', symbol: 'Rp' },
    { code: 'NL', name: 'Netherlands', currency: 'EUR', symbol: '€' },
    { code: 'CH', name: 'Switzerland', currency: 'CHF', symbol: 'CHF' },
    { code: 'TR', name: 'Turkey', currency: 'TRY', symbol: '₺' },
    { code: 'SE', name: 'Sweden', currency: 'SEK', symbol: 'kr' },
    { code: 'PL', name: 'Poland', currency: 'PLN', symbol: 'zł' },
    { code: 'BE', name: 'Belgium', currency: 'EUR', symbol: '€' },
    { code: 'AR', name: 'Argentina', currency: 'ARS', symbol: '$' },
    { code: 'AT', name: 'Austria', currency: 'EUR', symbol: '€' },
    { code: 'NO', name: 'Norway', currency: 'NOK', symbol: 'kr' },
    { code: 'AE', name: 'United Arab Emirates', currency: 'AED', symbol: 'د.إ' },
    { code: 'ZA', name: 'South Africa', currency: 'ZAR', symbol: 'R' },
    { code: 'DK', name: 'Denmark', currency: 'DKK', symbol: 'kr' },
    { code: 'SG', name: 'Singapore', currency: 'SGD', symbol: '$' },
    { code: 'MY', name: 'Malaysia', currency: 'MYR', symbol: 'RM' },
    { code: 'HK', name: 'Hong Kong', currency: 'HKD', symbol: '$' },
    { code: 'NZ', name: 'New Zealand', currency: 'NZD', symbol: '$' },
    { code: 'CL', name: 'Chile', currency: 'CLP', symbol: '$' },
    { code: 'PH', name: 'Philippines', currency: 'PHP', symbol: '₱' },
    { code: 'IE', name: 'Ireland', currency: 'EUR', symbol: '€' },
    { code: 'PT', name: 'Portugal', currency: 'EUR', symbol: '€' },
    { code: 'GR', name: 'Greece', currency: 'EUR', symbol: '€' },
    { code: 'CZ', name: 'Czech Republic', currency: 'CZK', symbol: 'Kč' },
    { code: 'HU', name: 'Hungary', currency: 'HUF', symbol: 'Ft' },
    { code: 'RO', name: 'Romania', currency: 'RON', symbol: 'lei' },
    { code: 'IL', name: 'Israel', currency: 'ILS', symbol: '₪' },
    { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', symbol: 'ر.س' },
    { code: 'QA', name: 'Qatar', currency: 'QAR', symbol: 'ر.ق' },
    { code: 'EG', name: 'Egypt', currency: 'EGP', symbol: '£' },
    { code: 'TH', name: 'Thailand', currency: 'THB', symbol: '฿' },
    { code: 'VN', name: 'Vietnam', currency: 'VND', symbol: '₫' },
    { code: 'PK', name: 'Pakistan', currency: 'PKR', symbol: '₨' },
    { code: 'BD', name: 'Bangladesh', currency: 'BDT', symbol: '৳' },
    { code: 'NG', name: 'Nigeria', currency: 'NGN', symbol: '₦' },
    { code: 'CO', name: 'Colombia', currency: 'COP', symbol: '$' },
    { code: 'PE', name: 'Peru', currency: 'PEN', symbol: 'S/.' },
    { code: 'VE', name: 'Venezuela', currency: 'VES', symbol: 'Bs.' },
    { code: 'UA', name: 'Ukraine', currency: 'UAH', symbol: '₴' },
    { code: 'FI', name: 'Finland', currency: 'EUR', symbol: '€' },
    { code: 'BG', name: 'Bulgaria', currency: 'BGN', symbol: 'лв' },
    { code: 'HR', name: 'Croatia', currency: 'EUR', symbol: '€' },
    { code: 'LT', name: 'Lithuania', currency: 'EUR', symbol: '€' },
    { code: 'LV', name: 'Latvia', currency: 'EUR', symbol: '€' },
    { code: 'EE', name: 'Estonia', currency: 'EUR', symbol: '€' },
    { code: 'SK', name: 'Slovakia', currency: 'EUR', symbol: '€' },
    { code: 'SI', name: 'Slovenia', currency: 'EUR', symbol: '€' },
    { code: 'LU', name: 'Luxembourg', currency: 'EUR', symbol: '€' },
    { code: 'CY', name: 'Cyprus', currency: 'EUR', symbol: '€' },
    { code: 'MT', name: 'Malta', currency: 'EUR', symbol: '€' },
    { code: 'IS', name: 'Iceland', currency: 'ISK', symbol: 'kr' },
    { code: 'EC', name: 'Ecuador', currency: 'USD', symbol: '$' },
    { code: 'GT', name: 'Guatemala', currency: 'GTQ', symbol: 'Q' },
    { code: 'CR', name: 'Costa Rica', currency: 'CRC', symbol: '₡' },
    { code: 'PA', name: 'Panama', currency: 'PAB', symbol: 'B/.' },
    { code: 'UY', name: 'Uruguay', currency: 'UYU', symbol: '$U' },
    { code: 'PY', name: 'Paraguay', currency: 'PYG', symbol: '₲' },
    { code: 'BO', name: 'Bolivia', currency: 'BOB', symbol: 'Bs.' },
    { code: 'SV', name: 'El Salvador', currency: 'USD', symbol: '$' },
    { code: 'HN', name: 'Honduras', currency: 'HNL', symbol: 'L' },
    { code: 'NI', name: 'Nicaragua', currency: 'NIO', symbol: 'C$' },
    { code: 'DO', name: 'Dominican Republic', currency: 'DOP', symbol: 'RD$' },
    { code: 'JM', name: 'Jamaica', currency: 'JMD', symbol: 'J$' },
    { code: 'TT', name: 'Trinidad and Tobago', currency: 'TTD', symbol: 'TT$' },
    { code: 'KE', name: 'Kenya', currency: 'KES', symbol: 'KSh' },
    { code: 'GH', name: 'Ghana', currency: 'GHS', symbol: 'GH₵' },
    { code: 'TZ', name: 'Tanzania', currency: 'TZS', symbol: 'TSh' },
    { code: 'UG', name: 'Uganda', currency: 'UGX', symbol: 'USh' },
    { code: 'MA', name: 'Morocco', currency: 'MAD', symbol: 'د.م.' },
    { code: 'DZ', name: 'Algeria', currency: 'DZD', symbol: 'د.ج' },
    { code: 'TN', name: 'Tunisia', currency: 'TND', symbol: 'د.ت' },
    { code: 'JO', name: 'Jordan', currency: 'JOD', symbol: 'JD' },
    { code: 'LB', name: 'Lebanon', currency: 'LBP', symbol: '£' },
    { code: 'OM', name: 'Oman', currency: 'OMR', symbol: 'ر.ع.' },
    { code: 'KW', name: 'Kuwait', currency: 'KWD', symbol: 'د.ك' },
    { code: 'BH', name: 'Bahrain', currency: 'BHD', symbol: '.د.ب' },
    { code: 'LK', name: 'Sri Lanka', currency: 'LKR', symbol: '₨' },
    { code: 'NP', name: 'Nepal', currency: 'NPR', symbol: '₨' },
    { code: 'GE', name: 'Georgia', currency: 'GEL', symbol: '₾' },
    { code: 'AM', name: 'Armenia', currency: 'AMD', symbol: '֏' },
    { code: 'AZ', name: 'Azerbaijan', currency: 'AZN', symbol: '₼' },
    { code: 'KZ', name: 'Kazakhstan', currency: 'KZT', symbol: '₸' },
    { code: 'UZ', name: 'Uzbekistan', currency: 'UZS', symbol: 'лв' },
    { code: 'MN', name: 'Mongolia', currency: 'MNT', symbol: '₮' },
    { code: 'KH', name: 'Cambodia', currency: 'KHR', symbol: '៛' },
    { code: 'LA', name: 'Laos', currency: 'LAK', symbol: '₭' },
    { code: 'MM', name: 'Myanmar', currency: 'MMK', symbol: 'K' },
    // Add more countries as needed
];

export const COUNTRY_CALLING_CODES: { [countryCode: string]: string } = {
    US: '1', GB: '44', DE: '49', CA: '1', AU: '61', JP: '81', FR: '33', CN: '86', IN: '91', BR: '55', RU: '7', IT: '39', ES: '34', MX: '52', KR: '82', ID: '62', NL: '31', CH: '41', TR: '90', SE: '46', PL: '48', BE: '32', AR: '54', AT: '43', NO: '47', AE: '971', ZA: '27', DK: '45', SG: '65', MY: '60', HK: '852', NZ: '64', CL: '56', PH: '63', IE: '353', PT: '351', GR: '30', CZ: '420', HU: '36', RO: '40', IL: '972', SA: '966', QA: '974', EG: '20', TH: '66', VN: '84', PK: '92', BD: '880', NG: '234', CO: '57', PE: '51', VE: '58', UA: '380', FI: '358', BG: '359', HR: '385', LT: '370', LV: '371', EE: '372', SK: '421', SI: '386', LU: '352', CY: '357', MT: '356', IS: '354', EC: '593', GT: '502', CR: '506', PA: '507', UY: '598', PY: '595', BO: '591', SV: '503', HN: '504', NI: '505', DO: '1', JM: '1', TT: '1', KE: '254', GH: '233', TZ: '255', UG: '256', MA: '212', DZ: '213', TN: '216', JO: '962', LB: '961', OM: '968', KW: '965', BH: '973', LK: '94', NP: '977', GE: '995', AM: '374', AZ: '994', KZ: '7', UZ: '998', MN: '976', KH: '855', LA: '856', MM: '95',
};

export const CURRENCIES_LIST = Array.from(new Map(ALL_COUNTRIES.map(c => [c.currency, c])).values())
    .map(c => ({
        code: c.currency,
        name: c.name, // country name as representative name
        symbol: c.symbol,
        countryCode: c.code
    }))
    .sort((a, b) => a.code.localeCompare(b.code));


export const TRANSFER_PURPOSES: string[] = [
    'Family Support',
    'Payment for Services',
    'Gift',
    'Investment',
    'Personal Expenses',
    'Loan Repayment',
    'Pay by Check',
    'Other',
];

export const TRANSACTION_CATEGORIES: string[] = [
    'Groceries',
    'Utilities',
    'Income',
    'Rent',
    'Travel',
    'Electronics',
    'Transport',
    'Food & Drink',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Education',
    'Business Expense',
    'Personal Care',
    'Other',
];


export const BANKS_BY_COUNTRY: { [countryCode: string]: { name: string; domain: string }[] } = {
  // North America
  US: [
    { name: 'Chase Bank', domain: 'chase.com' },
    { name: 'Bank of America', domain: 'bankofamerica.com' },
    { name: 'Wells Fargo', domain: 'wellsfargo.com' },
    { name: 'Citibank', domain: 'citi.com' },
    { name: 'PNC Bank', domain: 'pnc.com' },
    { name: 'U.S. Bank', domain: 'usbank.com' },
    { name: 'Capital One', domain: 'capitalone.com' },
  ],
  CA: [
    { name: 'Royal Bank of Canada', domain: 'rbc.com' },
    { name: 'TD Bank', domain: 'td.com' },
    { name: 'Scotiabank', domain: 'scotiabank.com' },
    { name: 'Bank of Montreal', domain: 'bmo.com' },
    { name: 'CIBC', domain: 'cibc.com' },
  ],
  MX: [
    { name: 'BBVA México', domain: 'bbva.mx' },
    { name: 'Banorte', domain: 'banorte.com' },
    { name: 'Santander México', domain: 'santander.com.mx' },
    { name: 'Inbursa', domain: 'inbursa.com' },
  ],

  // Europe
  GB: [
    { name: 'Barclays', domain: 'barclays.co.uk' },
    { name: 'HSBC', domain: 'hsbc.com' },
    { name: 'Lloyds Bank', domain: 'lloydsbank.com' },
    { name: 'NatWest', domain: 'natwest.com' },
    { name: 'Santander UK', domain: 'santander.co.uk' },
    { name: 'Standard Chartered', domain: 'sc.com' },
  ],
  DE: [
    { name: 'Deutsche Bank', domain: 'db.com' },
    { name: 'Commerzbank', domain: 'commerzbank.de' },
    { name: 'DZ Bank', domain: 'dzbank.de' },
    { name: 'KfW', domain: 'kfw.de' },
    { name: 'HypoVereinsbank (UniCredit)', domain: 'hypovereinsbank.de' },
  ],
  FR: [
    { name: 'BNP Paribas', domain: 'bnpparibas.com' },
    { name: 'Crédit Agricole', domain: 'credit-agricole.com' },
    { name: 'Société Générale', domain: 'societegenerale.com' },
    { name: 'Groupe BPCE', domain: 'bpce.fr' },
  ],
  ES: [
    { name: 'Banco Santander', domain: 'santander.com' },
    { name: 'BBVA', domain: 'bbva.com' },
    { name: 'CaixaBank', domain: 'caixabank.com' },
  ],
  IT: [
    { name: 'Intesa Sanpaolo', domain: 'intesasanpaolo.com' },
    { name: 'UniCredit', domain: 'unicreditgroup.eu' },
    { name: 'Banco BPM', domain: 'bancobpm.it' },
  ],
  NL: [
    { name: 'ING Group', domain: 'ing.com' },
    { name: 'ABN AMRO', domain: 'abnamro.com' },
    { name: 'Rabobank', domain: 'rabobank.nl' },
  ],
  CH: [
    { name: 'UBS', domain: 'ubs.com' },
    { name: 'Credit Suisse', domain: 'credit-suisse.com' },
    { name: 'Zürcher Kantonalbank', domain: 'zkb.ch' },
  ],
  SE: [
    { name: 'Nordea', domain: 'nordea.com' },
    { name: 'SEB', domain: 'sebgroup.com' },
    { name: 'Swedbank', domain: 'swedbank.com' },
    { name: 'Handelsbanken', domain: 'handelsbanken.com' },
  ],
  IE: [
    { name: 'Bank of Ireland', domain: 'bankofireland.com' },
    { name: 'AIB', domain: 'aib.ie' },
    { name: 'Ulster Bank', domain: 'ulsterbank.ie' },
  ],
  PL: [
    { name: 'PKO Bank Polski', domain: 'pkobp.pl' },
    { name: 'Bank Pekao', domain: 'pekao.com.pl' },
    { name: 'Santander Bank Polska', domain: 'santander.pl' },
    { name: 'mBank', domain: 'mbank.pl' },
  ],

  // Asia Pacific
  CN: [
    { name: 'ICBC', domain: 'icbc.com.cn' },
    { name: 'China Construction Bank', domain: 'ccb.com' },
    { name: 'Agricultural Bank of China', domain: 'abchina.com' },
    { name: 'Bank of China', domain: 'boc.cn' },
    { name: 'Bank of Communications', domain: 'bankcomm.com' },
  ],
  JP: [
    { name: 'MUFG Bank', domain: 'mufg.jp' },
    { name: 'Sumitomo Mitsui Banking Corporation', domain: 'smbc.co.jp' },
    { name: 'Mizuho Bank', domain: 'mizuhobank.com' },
  ],
  IN: [
    { name: 'State Bank of India', domain: 'sbi.co.in' },
    { name: 'HDFC Bank', domain: 'hdfcbank.com' },
    { name: 'ICICI Bank', domain: 'icicibank.com' },
    { name: 'Axis Bank', domain: 'axisbank.com' },
    { name: 'Punjab National Bank', domain: 'pnbindia.in' },
    { name: 'Kotak Mahindra Bank', domain: 'kotak.com' },
  ],
  AU: [
    { name: 'Commonwealth Bank', domain: 'commbank.com.au' },
    { name: 'Westpac', domain: 'westpac.com.au' },
    { name: 'ANZ', domain: 'anz.com.au' },
    { name: 'NAB', domain: 'nab.com.au' },
    { name: 'Macquarie Bank', domain: 'macquarie.com' },
  ],
  SG: [
    { name: 'DBS Bank', domain: 'dbs.com' },
    { name: 'OCBC Bank', domain: 'ocbc.com' },
    { name: 'United Overseas Bank (UOB)', domain: 'uobgroup.com' },
  ],
  KR: [
    { name: 'Shinhan Bank', domain: 'shinhan.com' },
    { name: 'KB Kookmin Bank', domain: 'kbfg.com' },
    { name: 'Hana Bank', domain: 'hanabank.com' },
  ],
  HK: [
    { name: 'HSBC Hong Kong', domain: 'hsbc.com.hk' },
    { name: 'Bank of China (Hong Kong)', domain: 'bochk.com' },
    { name: 'Hang Seng Bank', domain: 'hangseng.com' },
  ],
  ID: [
    { name: 'Bank Mandiri', domain: 'bankmandiri.co.id' },
    { name: 'Bank Rakyat Indonesia (BRI)', domain: 'bri.co.id' },
  ],
  MY: [
    { name: 'Maybank', domain: 'maybank.com' },
    { name: 'CIMB Group', domain: 'cimb.com' },
    { name: 'Public Bank Berhad', domain: 'pbebank.com' },
  ],

  // South America
  BR: [
    { name: 'Itaú Unibanco', domain: 'itau.com.br' },
    { name: 'Banco do Brasil', domain: 'bb.com.br' },
    { name: 'Bradesco', domain: 'bancobradesco.com.br' },
    { name: 'Santander Brasil', domain: 'santander.com.br' },
  ],
  AR: [
    { name: 'Banco de la Nación Argentina', domain: 'bna.com.ar' },
    { name: 'Banco Galicia', domain: 'bancogalicia.com' },
  ],
  CO: [
    { name: 'Grupo Aval', domain: 'grupoaval.com' },
    { name: 'Bancolombia', domain: 'bancolombia.com' },
  ],
  CL: [
    { name: 'Banco de Chile', domain: 'bancochile.cl' },
    { name: 'Banco Santander-Chile', domain: 'santander.cl' },
  ],

  // Middle East
  AE: [
    { name: 'First Abu Dhabi Bank', domain: 'bankfab.com' },
    { name: 'Emirates NBD', domain: 'emiratesnbd.com' },
  ],
  SA: [
    { name: 'Saudi National Bank (SNB)', domain: 'alahli.com' },
    { name: 'Al Rajhi Bank', domain: 'alrajhibank.com.sa' },
  ],
  QA: [
    { name: 'Qatar National Bank (QNB)', domain: 'qnb.com' },
    { name: 'Qatar Islamic Bank', domain: 'qib.com.qa' },
  ],
  IL: [
    { name: 'Bank Leumi', domain: 'leumi.co.il' },
    { name: 'Bank Hapoalim', domain: 'bankhapoalim.co.il' },
  ],
  KW: [{ name: 'National Bank of Kuwait (NBK)', domain: 'nbk.com' }],

  // Africa
  ZA: [
    { name: 'Standard Bank', domain: 'standardbank.com' },
    { name: 'FirstRand', domain: 'firstrand.co.za' },
    { name: 'Absa Group', domain: 'absa.africa' },
  ],
  NG: [
    { name: 'Access Bank', domain: 'accessbankplc.com' },
    { name: 'Zenith Bank', domain: 'zenithbank.com' },
    { name: 'UBA', domain: 'ubagroup.com' },
    { name: 'First Bank of Nigeria', domain: 'firstbanknigeria.com' },
    { name: 'Guaranty Trust Bank', domain: 'gtbank.com' },
  ],
  EG: [
    { name: 'National Bank of Egypt', domain: 'nbe.com.eg' },
    { name: 'Banque Misr', domain: 'banquemisr.com' },
  ],
  KE: [
    { name: 'Equity Bank', domain: 'equitygroupholdings.com' },
    { name: 'KCB Bank Kenya', domain: 'kcbgroup.com' },
  ],
  GH: [
    { name: 'Ecobank Ghana', domain: 'ecobank.com' },
    { name: 'GCB Bank', domain: 'gcbbank.com.gh' },
  ],
};

export const BANK_ACCOUNT_CONFIG: { [countryCode: string]: any } = {
  US: {
    field1: { name: 'routingNumber', label: 'Routing Number', placeholder: 'e.g., 110000000', maxLength: 9, format: (v: string) => v.replace(/\D/g, ''), validate: (v: string) => /^\d{9}$/.test(v) ? null : 'Routing number must be exactly 9 digits.' },
    field2: { name: 'accountNumber', label: 'Account Number', placeholder: 'e.g., 123456789', maxLength: 17, format: (v: string) => v.replace(/\D/g, ''), validate: (v: string) => v.length > 5 ? null : 'Account number is too short.' },
  },
  GB: {
    field1: { name: 'sortCode', label: 'Sort Code', placeholder: 'e.g., 20-30-40', maxLength: 8, format: (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1-').slice(0, 8), validate: (v: string) => v.replace(/-/g, '').length === 6 ? null : 'Sort code must be 6 digits (e.g., 20-30-40).' },
    field2: { name: 'accountNumber', label: 'Account Number', placeholder: 'e.g., 12345678', maxLength: 8, format: (v: string) => v.replace(/\D/g, ''), validate: (v: string) => v.length === 8 ? null : 'Must be 8 digits.' },
  },
  IN: {
    field1: { name: 'ifsc', label: 'IFSC Code', placeholder: 'e.g., SBIN0000001', maxLength: 11, format: (v: string) => v.toUpperCase(), validate: (v: string) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v) ? null : 'Invalid IFSC code format.' },
    field2: { name: 'accountNumber', label: 'Account Number', placeholder: 'e.g., 12345678901', maxLength: 18, format: (v: string) => v.replace(/\D/g, ''), validate: (v: string) => v.length >= 9 ? null : 'Account number is too short.' },
  },
  NG: {
    field1: { name: 'nuban', label: 'NUBAN Account Number', placeholder: 'e.g., 0123456789', maxLength: 10, format: (v: string) => v.replace(/\D/g, ''), validate: (v: string) => /^\d{10}$/.test(v) ? null : 'NUBAN must be exactly 10 digits.' },
  },
  DE: {
    field1: { name: 'iban', label: 'IBAN', placeholder: 'e.g., DE89 3704 0044 0532 0130 00', maxLength: 43, format: (v: string) => (v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().match(/.{1,4}/g) || []).join(' '), validate: (v: string) => v.replace(/\s/g, '').length === 22 ? null : 'Invalid IBAN format. Must be 22 characters for Germany.' },
    field2: { name: 'swiftBic', label: 'BIC/SWIFT', placeholder: 'e.g., COBADEFFXXX', maxLength: 11, format: (v: string) => v.toUpperCase(), validate: (v: string) => /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(v) ? null : 'Invalid BIC/SWIFT code.' },
  },
  default: {
    field1: { name: 'iban', label: 'IBAN / Account Number', placeholder: 'Enter account number', maxLength: 34, format: (v: string) => v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(), validate: (v: string) => v.length > 5 ? null : 'Account number is too short.' },
    field2: { name: 'swiftBic', label: 'BIC/SWIFT (Optional)', placeholder: 'Enter BIC/SWIFT code', maxLength: 11, format: (v: string) => v.toUpperCase(), validate: (v: string) => !v || /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(v) ? null : 'Invalid BIC/SWIFT code.' },
  }
};

export const INITIAL_RECIPIENTS: Recipient[] = [
  {
    id: 'rec_1',
    fullName: 'Jane Doe',
    nickname: 'Design Contractor',
    phone: '+1-212-555-0187',
    bankName: 'Chase Bank',
    accountNumber: '**** **** **** 1234',
    country: ALL_COUNTRIES.find(c => c.code === 'US')!,
    streetAddress: '123 Main St',
    city: 'New York',
    stateProvince: 'NY',
    postalCode: '10001',
    deliveryOptions: {
      bankDeposit: true,
      cardDeposit: true,
      cashPickup: false,
    },
    realDetails: {
      accountNumber: '9876543210981234',
      swiftBic: 'CHASUS33',
    },
    recipientType: 'bank',
  },
  {
    id: 'rec_2',
    fullName: 'John Smith',
    nickname: 'London Office Rent',
    phone: '+44-20-7946-0958',
    bankName: 'HSBC',
    accountNumber: '**** **** **** 5678',
    country: ALL_COUNTRIES.find(c => c.code === 'GB')!,
    streetAddress: '10 Downing Street',
    city: 'London',
    stateProvince: '',
    postalCode: 'SW1A 2AA',
    deliveryOptions: {
      bankDeposit: true,
      cardDeposit: false,
      cashPickup: true,
    },
    realDetails: {
      accountNumber: '1234567890125678',
      swiftBic: 'MIDLGB22',
    },
    recipientType: 'bank',
  },
  {
    id: 'rec_3',
    fullName: 'Peter Jones',
    nickname: 'Office Supplies',
    phone: '+1-415-555-0132',
    bankName: 'Wells Fargo',
    accountNumber: '**** **** **** 9012',
    country: ALL_COUNTRIES.find(c => c.code === 'US')!,
    streetAddress: '456 Market St',
    city: 'San Francisco',
    stateProvince: 'CA',
    postalCode: '94105',
    deliveryOptions: {
        bankDeposit: true,
        cardDeposit: true,
        cashPickup: true,
    },
    realDetails: {
        accountNumber: '5432109876549012',
        swiftBic: 'WFBIUS6S',
    },
    recipientType: 'bank',
  }
];

export const SELF_RECIPIENT: Recipient = {
  id: 'self_0',
  fullName: 'Randy M. Chitwood',
  phone: '+1-252-555-0199',
  bankName: 'Card Deposit',
  accountNumber: '**** **** **** 8842', // User's own card/account
  country: ALL_COUNTRIES.find(c => c.code === 'US')!, // Assuming user is in the US for this
  streetAddress: '3797 Yorkshire Circle',
  city: 'Greenville',
  stateProvince: 'NC',
  postalCode: '27834',
  deliveryOptions: {
    bankDeposit: true,
    cardDeposit: true,
    cashPickup: false,
  },
  realDetails: {
    accountNumber: '4242424242428842',
    swiftBic: 'ICUUS33',
  },
  recipientType: 'bank',
};


export const INITIAL_ACCOUNTS: Account[] = [
    { id: 'acc_checking_1', type: AccountType.CHECKING, nickname: 'Main Checking', accountNumber: '**** 1234', fullAccountNumber: '1234567890121234', balance: 1978620.38, features: ['International Transfers', 'Debit Card', 'FDIC Insured'], status: 'Active' },
    { id: 'acc_savings_1', type: AccountType.SAVINGS, nickname: 'Emergency Fund', accountNumber: '**** 5678', fullAccountNumber: '9876543210985678', balance: 2500, features: ['4.5% APY', 'Goal Setting', 'Automated Savings'], status: 'Active' },
    { id: 'acc_business_1', type: AccountType.BUSINESS, accountNumber: '**** 9012', fullAccountNumber: '5432109876549012', balance: 0, features: ['Multi-user Access', 'Invoicing Tools', 'Expense Tracking'], status: 'Active' },
];

export const NEW_USER_ACCOUNTS_TEMPLATE: Omit<Account, 'id' | 'fullAccountNumber'>[] = [
    { type: AccountType.CHECKING, nickname: 'Main Checking', accountNumber: '**** ****', balance: 0, features: ['International Transfers', 'Debit Card', 'FDIC Insured'], status: 'Under Review' },
    { type: AccountType.SAVINGS, nickname: 'High-Yield Savings', accountNumber: '**** ****', balance: 0, features: ['4.5% APY', 'Goal Setting', 'Automated Savings'], status: 'Under Review' },
    { type: AccountType.BUSINESS, nickname: 'Business Pro', accountNumber: '**** ****', balance: 0, features: ['Multi-user Access', 'Invoicing Tools', 'Expense Tracking'], status: 'Under Review' },
];

const now = new Date();

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: `txn_${now.getTime() - 10000}`, // 10 seconds ago
    accountId: 'acc_checking_1',
    recipient: INITIAL_RECIPIENTS[2], // Peter Jones for office supplies
    sendAmount: 750.00,
    receiveAmount: 750.00, // Assuming domestic
    fee: 5,
    exchangeRate: 1,
    status: TransactionStatus.SUBMITTED, // This will start the animation
    estimatedArrival: new Date(now.getTime() + 86400000 * 2), // 2 days from now
    statusTimestamps: {
        [TransactionStatus.SUBMITTED]: new Date(now.getTime() - 10000),
    },
    description: "Office Supplies Purchase",
    type: 'debit',
    purpose: 'Business Expense',
    reviewed: false,
    requiresAuth: false, // This will go through without being flagged
  },
  {
    id: `txn_${now.getTime() - 86400000}`,
    accountId: 'acc_checking_1',
    recipient: INITIAL_RECIPIENTS[1],
    sendAmount: 1000,
    receiveAmount: 785.50,
    fee: 10,
    exchangeRate: 0.7855,
    status: TransactionStatus.FUNDS_ARRIVED,
    estimatedArrival: new Date(now.getTime() - 86400000),
    statusTimestamps: {
        [TransactionStatus.SUBMITTED]: new Date(now.getTime() - 86400000 * 3),
        [TransactionStatus.CONVERTING]: new Date(now.getTime() - 86400000 * 3 + 30000), // 30s later
        [TransactionStatus.IN_TRANSIT]: new Date(now.getTime() - 86400000 * 2),
        [TransactionStatus.FUNDS_ARRIVED]: new Date(now.getTime() - 86400000),
    },
    description: "Payment for services",
    type: 'debit',
    purpose: 'Payment for Services',
    reviewed: true,
  },
  {
    id: `txn_${now.getTime() - 3600000}`,
    accountId: 'acc_checking_1',
    recipient: INITIAL_RECIPIENTS[0],
    sendAmount: 500,
    receiveAmount: 490.00,
    fee: 5,
    exchangeRate: 1,
    status: TransactionStatus.FLAGGED_AWAITING_CLEARANCE,
    estimatedArrival: new Date(now.getTime() + 86400000 * 3),
    statusTimestamps: {
        [TransactionStatus.SUBMITTED]: new Date(now.getTime() - 3600000),
        [TransactionStatus.CONVERTING]: new Date(now.getTime() - 3600000 + 4000),
        [TransactionStatus.FLAGGED_AWAITING_CLEARANCE]: new Date(now.getTime() - 3600000 + 12000),
    },
    description: "Family support",
    type: 'debit',
    purpose: 'Family Support',
    reviewed: false,
    requiresAuth: true,
  },
  {
    id: `txn_${now.getTime() - 86400000 * 5}`,
    accountId: 'acc_savings_1',
    recipient: SELF_RECIPIENT,
    sendAmount: 500,
    receiveAmount: 500,
    fee: 0,
    exchangeRate: 1,
    status: TransactionStatus.FUNDS_ARRIVED,
    estimatedArrival: new Date(now.getTime() - 86400000 * 5),
    statusTimestamps: {
        [TransactionStatus.SUBMITTED]: new Date(now.getTime() - 86400000 * 5),
        [TransactionStatus.FUNDS_ARRIVED]: new Date(now.getTime() - 86400000 * 5),
    },
    description: "Initial Deposit",
    type: 'credit',
    purpose: 'Account Deposit',
    reviewed: false,
  },
  {
    id: `txn_${now.getTime() - 86400000 * 10}`,
    accountId: 'acc_checking_1',
    recipient: SELF_RECIPIENT,
    sendAmount: 1250.75,
    receiveAmount: 1250.75,
    fee: 0,
    exchangeRate: 1,
    status: TransactionStatus.FUNDS_ARRIVED,
    estimatedArrival: new Date(now.getTime() - 86400000 * 10),
    statusTimestamps: {
      [TransactionStatus.SUBMITTED]: new Date(now.getTime() - 86400000 * 12),
      [TransactionStatus.FUNDS_ARRIVED]: new Date(now.getTime() - 86400000 * 10),
    },
    description: "Mobile Cheque Deposit #1234",
    type: 'credit',
    purpose: 'Account Deposit',
    chequeDetails: {
      chequeNumber: '1234',
      images: {
        front: 'https://placehold.co/800x333/E2E8F0/4A5568/png?text=iCredit+Union®%0APay+to%3A+Randy+M.+Chitwood....%241,250.75',
        back: 'https://placehold.co/800x333/E2E8F0/4A5568/png?text=Endorse+Here%0AFor+Mobile+Deposit+at+iCU+Only',
      }
    },
    reviewed: false,
  },
];

export const STANDARD_FEE = 5.00; // in USD
export const EXPRESS_FEE = 15.00; // in USD
export const DOMESTIC_WIRE_FEE = 25.00;
export const INTERNATIONAL_WIRE_FEE = 45.00;
export const EXCHANGE_RATES: { [key: string]: number } = {
    USD: 1,
    GBP: 0.79,
    EUR: 0.92,
    CAD: 1.37,
    AUD: 1.51,
    JPY: 157.25,
    CNY: 7.24,
    INR: 83.55,
    BRL: 5.37,
    RUB: 88.50,
    MXN: 18.38,
    KRW: 1378.50,
    CHF: 0.89,
    ZAR: 18.75,
    SGD: 1.35,
    HKD: 7.81,
    NZD: 1.62,
};

export const INITIAL_ADVANCED_TRANSFER_LIMITS: AdvancedTransferLimits = {
  p2p: { daily: 2500, monthly: 10000 },
  ach: { daily: 25000, monthly: 100000 },
  wire: { perTransaction: 50000, daily: 100000, monthly: 250000 },
  internal: { perTransaction: 'Unlimited', daily: 'Unlimited', monthly: 'Unlimited' },
};

export const INITIAL_CARDS: Card[] = [
    {
        id: 'card_1',
        lastFour: '8842',
        cardholderName: 'Randy M. Chitwood',
        expiryDate: '12/28',
        fullNumber: '4242 4242 4242 8842',
        cvc: '123',
        network: 'Visa',
        cardType: 'DEBIT',
        linkedAccountId: 'acc_checking_1',
        rewards: {
            cashBackBalance: 12.34,
            earnRates: [
                { category: 'Groceries', rate: 3, unit: '%' },
                { category: 'Transport', rate: 2, unit: '%' },
                { category: 'All', rate: 1, unit: '%' },
            ],
        },
        controls: {
            isFrozen: false,
            onlinePurchases: true,
            internationalTransactions: true,
            transactionLimits: { perTransaction: 1000, daily: 2500 },
            blockedCategories: [],
        },
    },
    {
        id: 'card_2',
        lastFour: '5555',
        cardholderName: 'Randy M. Chitwood',
        expiryDate: '06/29',
        fullNumber: '5555 5555 5555 5555',
        cvc: '456',
        network: 'Mastercard',
        cardType: 'CREDIT',
        creditDetails: {
            creditLimit: 15000,
            currentBalance: 2345.67,
            statementBalance: 2100.89,
            minimumPayment: 50.00,
            paymentDueDate: new Date(now.getFullYear(), now.getMonth() + 1, 15),
            apr: 19.99,
        },
        rewards: {
            pointsBalance: 78520,
            earnRates: [
                { category: 'Travel', rate: 5, unit: 'points' },
                { category: 'Food & Drink', rate: 3, unit: 'points' },
                { category: 'All', rate: 1, unit: 'points' },
            ],
        },
        controls: {
            isFrozen: false,
            onlinePurchases: true,
            internationalTransactions: false,
            transactionLimits: { perTransaction: null, daily: null },
            blockedCategories: ['Entertainment'],
        },
    }
];

export const INITIAL_VIRTUAL_CARDS: VirtualCard[] = [
    {
        id: 'vc_1',
        nickname: 'Netflix Subscription',
        lastFour: '7890',
        fullNumber: '4111 2222 3333 7890',
        expiryDate: '12/29',
        cvc: '789',
        spendingLimit: 20,
        spentThisMonth: 15.49,
        lockedToMerchant: 'Netflix.com',
        isFrozen: false,
        linkedCardId: 'card_1',
    }
];


export const INITIAL_CARD_TRANSACTIONS: CardTransaction[] = [
    { id: 'ctx_1', description: 'Amazon Marketplace', amount: 75.50, date: new Date(now.getTime() - 86400000 * 1), category: 'Shopping', status: 'Posted', rewardsEarned: { cashBack: 0.76 }, merchantInfo: { name: 'Amazon.com' } },
    { id: 'ctx_2', description: 'Starbucks', amount: 8.30, date: new Date(now.getTime() - 86400000 * 2), category: 'Food & Drink', status: 'Posted', rewardsEarned: { points: 25 }, merchantInfo: { name: 'Starbucks' } },
    { id: 'ctx_3', description: 'Netflix Subscription', amount: 15.49, date: new Date(now.getTime() - 86400000 * 3), category: 'Entertainment', status: 'Posted', rewardsEarned: { cashBack: 0.15 }, merchantInfo: { name: 'Netflix' } },
    { id: 'ctx_4', description: 'Uber Trip', amount: 24.12, date: new Date(now.getTime() - 86400000 * 4), category: 'Transport', status: 'Pending', rewardsEarned: { cashBack: 0.48 }, merchantInfo: { name: 'Uber Technologies' } },
    { id: 'ctx_5', description: 'Whole Foods', amount: 112.87, date: new Date(now.getTime() - 86400000 * 5), category: 'Groceries', status: 'Posted', rewardsEarned: { cashBack: 3.39 }, merchantInfo: { name: 'Whole Foods' } },
];

export const USER_PIN = '1234';
export const USER_PASSWORD = 'iCU.P@ssw0rd!2024';
export const NETWORK_AUTH_CODE = '987654';
export const CLEARANCE_CODE = 'IMF-772-CLR';

// --- Crypto Constants ---

const generatePriceHistory = (base: number, points: number, volatility: number): number[] => {
    const history = [base];
    for (let i = 1; i < points; i++) {
        const change = (Math.random() - 0.5) * volatility * history[i - 1];
        history.push(history[i - 1] + change);
    }
    return history;
};

export const getInitialCryptoAssets = (Icons: any): CryptoAsset[] => ([
    {
        id: 'btc',
        name: 'Bitcoin',
        symbol: 'BTC',
        icon: Icons.BtcIcon,
        price: 68420.73,
        change24h: 1.25,
        marketCap: 1350000000000,
        priceHistory: generatePriceHistory(68420.73, 50, 0.005),
    },
    {
        id: 'eth',
        name: 'Ethereum',
        symbol: 'ETH',
        icon: Icons.EthIcon,
        price: 3550.48,
        change24h: -0.89,
        marketCap: 426000000000,
        priceHistory: generatePriceHistory(3550.48, 50, 0.008),
    },
    {
        id: 'shell',
        name: 'Shell Coin',
        symbol: 'SHL',
        icon: Icons.ShellIcon,
        price: 1.23,
        change24h: 5.72,
        marketCap: 123000000,
        priceHistory: generatePriceHistory(1.23, 50, 0.02),
    },
]);

export const INITIAL_CRYPTO_HOLDINGS: CryptoHolding[] = [
    { assetId: 'btc', amount: 0.05, avgBuyPrice: 65000 },
    { assetId: 'eth', amount: 2.5, avgBuyPrice: 3200 },
];

export const CRYPTO_TRADE_FEE_PERCENT = 0.005; // 0.5%

// --- Services & Subscriptions ---
export const INITIAL_SUBSCRIPTIONS: SubscriptionService[] = [
    { id: 'sub1', provider: 'Comcast', plan: 'Gigabit Internet', amount: 79.99, dueDate: new Date(now.getFullYear(), now.getMonth(), 25), type: SubscriptionServiceType.INTERNET, isPaid: false },
    { id: 'sub2', provider: 'Netflix', plan: 'Premium Plan', amount: 22.99, dueDate: new Date(now.getFullYear(), now.getMonth(), 10), type: SubscriptionServiceType.TV, isPaid: true },
    { id: 'sub3', provider: 'DirecTV', plan: 'Choice Package', amount: 84.99, dueDate: new Date(now.getFullYear() + 1, 1), type: SubscriptionServiceType.SATELLITE, isPaid: false },
];

// --- Apple Card ---
export const INITIAL_APPLE_CARD_DETAILS: AppleCardDetails = {
    lastFour: '1005',
    balance: 478.52,
    creditLimit: 10000,
    availableCredit: 9521.48,
    spendingLimits: [
        { category: 'Food & Drink', limit: 300 },
        { category: 'Shopping', limit: 500 },
    ],
};
export const INITIAL_APPLE_CARD_TRANSACTIONS: AppleCardTransaction[] = [
    { id: 'apl1', vendor: 'Apple.com', category: 'Electronics', amount: 1199.00, date: new Date(now.getTime() - 86400000 * 5) },
    { id: 'apl2', vendor: 'Uber Eats', category: 'Food & Drink', amount: 34.50, date: new Date(now.getTime() - 86400000 * 2) },
    { id: 'apl3', vendor: 'Starbucks', category: 'Food & Drink', amount: 12.80, date: new Date(now.getTime() - 86400000 * 1) },
];

// --- Travel Check-In ---
export const INITIAL_TRAVEL_PLANS: TravelPlan[] = [
    { id: 'travel1', country: ALL_COUNTRIES.find(c => c.code === 'GB')!, startDate: new Date(now.getTime() - 86400000 * 2), endDate: new Date(now.getTime() + 86400000 * 5), status: TravelPlanStatus.ACTIVE },
    { id: 'travel2', country: ALL_COUNTRIES.find(c => c.code === 'FR')!, startDate: new Date(now.getTime() + 86400000 * 10), endDate: new Date(now.getTime() + 86400000 * 20), status: TravelPlanStatus.UPCOMING },
];

// --- Security ---
export const INITIAL_SECURITY_SETTINGS: SecuritySettings = {
    mfa: {
        enabled: true,
        method: 'app',
    },
    biometricsEnabled: true,
};

export const INITIAL_PUSH_SETTINGS: PushNotificationSettings = {
    transactions: true,
    security: true,
    promotions: true,
};

export const INITIAL_TRUSTED_DEVICES: TrustedDevice[] = [
    { id: 'dev1', deviceType: 'desktop', browser: 'Chrome on macOS', location: 'New York, NY', lastLogin: new Date(), isCurrent: true },
    { id: 'dev2', deviceType: 'mobile', browser: 'Safari on iOS', location: 'New York, NY', lastLogin: new Date(now.getTime() - 86400000 * 3), isCurrent: false },
];

export const USER_PROFILE: UserProfile = {
    name: 'Randy M. Chitwood',
    email: 'randy.m.chitwood@icreditunion.com',
    phone: '+1-252-555-0199',
    profilePictureUrl: 'https://i.postimg.cc/q7bL4JgD/h5-I5-T2-P.jpg',
    lastLogin: {
        date: new Date(now.getTime() - 3600000 * 5),
        from: 'New York, NY'
    }
};

export const NEW_USER_PROFILE_TEMPLATE: UserProfile = {
    name: '', // Will be filled from form
    email: '', // Will be filled from form
    phone: '', // Will be filled from form
    profilePictureUrl: `https://avatar.iran.liara.run/public/boy?username=${Date.now()}`, // Generic, but unique-ish
    lastLogin: {
        date: new Date(),
        from: 'New Registration'
    }
};

// --- Platform ---
export const INITIAL_PLATFORM_SETTINGS: PlatformSettings = {
    hapticsEnabled: true,
    theme: 'blue',
};

export const THEME_COLORS: { [key in PlatformTheme]: { [key: string]: string } } = {
    blue: {
        '50': '230 238 255', '100': '204 222 255', '200': '153 189 255', '300': '102 155 255', '400': '51 122 255',
        '500': '0 82 255', '600': '0 66 204', '700': '0 49 153', '800': '0 33 102', '900': '0 16 51',
    },
    green: {
        '50': '240 253 244', '100': '220 252 231', '200': '187 247 208', '300': '134 239 172', '400': '74 222 128',
        '500': '34 197 94', '600': '22 163 74', '700': '21 128 61', '800': '22 101 52', '900': '20 83 45',
    },
    purple: {
        '50': '245 243 255', '100': '237 233 254', '200': '221 214 254', '300': '196 181 253', '400': '167 139 250',
        '500': '139 92 246', '600': '124 58 237', '700': '109 40 217', '800': '91 33 182', '900': '76 29 149',
    },
};

// --- Tasks ---
const getFutureDate = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
export const INITIAL_TASKS: Task[] = [
    { id: 'task1', text: 'Review Q2 business expenses', completed: false, dueDate: getFutureDate(3) },
    { id: 'task2', text: 'Set up automatic savings transfer', completed: true },
    { id: 'task3', text: 'Pay credit card bill', completed: false, dueDate: getFutureDate(0) },
];

// --- Flights ---
export const AIRPORTS: Airport[] = [
    { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
    { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK' },
    { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
    { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
    { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan' },
    { code: 'SYD', name: 'Sydney Airport', city: 'Sydney', country: 'Australia' },
];
export const INITIAL_FLIGHT_BOOKINGS: FlightBooking[] = [];

// --- Utilities ---
export const getUtilityBillers = (Icons: any): UtilityBiller[] => ([
    { id: 'util1', name: 'Con Edison', type: UtilityType.ELECTRICITY, icon: Icons.LightningBoltIcon, accountNumber: '****5678-1' },
    { id: 'util2', name: 'National Grid', type: UtilityType.GAS, icon: Icons.FireIcon, accountNumber: '****1234-2' },
    { id: 'util3', name: 'NYC Water Board', type: UtilityType.WATER, icon: Icons.WaterDropIcon, accountNumber: '****9012-3' },
    { id: 'util4', name: 'Verizon Fios', type: UtilityType.INTERNET, icon: Icons.WifiIcon, accountNumber: '****4321-4' },
]);
export const INITIAL_UTILITY_BILLS: UtilityBill[] = [
    { id: 'bill1', billerId: 'util1', amount: 125.43, dueDate: getFutureDate(5), isPaid: false },
    { id: 'bill2', billerId: 'util4', amount: 89.99, dueDate: getFutureDate(10), isPaid: false },
    { id: 'bill3', billerId: 'util2', amount: 45.50, dueDate: new Date(now.getTime() - 86400000 * 15), isPaid: true },
];

export const ATM_LOCATIONS: AtmLocation[] = [
    { id: 'atm1', name: 'Chase Bank ATM', address: '123 Main St', city: 'New York', state: 'NY', zip: '10001', network: 'Visa Plus', lat: 40.7128, lng: -74.0060 },
    { id: 'atm2', name: 'Allpoint at CVS', address: '456 Broadway', city: 'New York', state: 'NY', zip: '10012', network: 'Allpoint', lat: 40.7252, lng: -73.9984 },
    { id: 'atm3', name: 'iCredit Union® Financial Center', address: '789 Wall St', city: 'New York', state: 'NY', zip: '10005', network: 'iCredit Union®', lat: 40.7061, lng: -74.0088 },
];

export const getAirtimeProviders = (Icons: any): AirtimeProvider[] => ([
    { id: 'att', name: 'AT&T', logo: Icons.ATTIcon },
    { id: 'tmobile', name: 'T-Mobile', logo: Icons.TMobileIcon },
    { id: 'verizon', name: 'Verizon', logo: Icons.VerizonIcon },
]);

export const INITIAL_AIRTIME_PURCHASES: AirtimePurchase[] = [];

export const FAQS: FaqItem[] = [
    { question: 'What are your international transfer fees?', answer: 'Our standard international transfer fee is $5.00, with an express option for $15.00. Fees may vary based on the destination country and transfer amount.' },
    { question: 'How long do transfers take?', answer: 'Standard transfers typically arrive within 2-3 business days. Express transfers are usually completed within 24 hours. Delivery times can be affected by bank holidays and recipient bank processing times.' },
    { question: 'How do I increase my transfer limits?', answer: 'You can request a limit increase through the Security Center. Limit increases are subject to additional verification (KYC) and account review.' },
];

export const LEADERSHIP_TEAM: LeadershipProfile[] = [
    { name: 'John Doe', title: 'Chief Executive Officer', imageUrl: 'https://i.postimg.cc/PqYvK1Y9/Qp-Yg-Sg-U.jpg', bio: 'Visionary leader with 20+ years in fintech.' },
    { name: 'Jane Smith', title: 'Chief Technology Officer', imageUrl: 'https://i.postimg.cc/13S31JjH/r-O0s-A8a.jpg', bio: 'Expert in scalable, secure financial platforms.' },
    { name: 'Peter Jones', title: 'Chief Financial Officer', imageUrl: 'https://i.postimg.cc/q7bL4JgD/h5-I5-T2-P.jpg', bio: 'Drives financial strategy and global growth.' },
    { name: 'Emily White', title: 'Chief Compliance Officer', imageUrl: 'https://i.postimg.cc/j2bW2V20/s-C3a3t-A.jpg', bio: 'Ensures adherence to global financial regulations.' },
];

export const LEGAL_CONTENT = {
    TERMS_OF_USE: `<h3>Terms of Use</h3><p>Welcome to iCredit Union®. By using our services, you agree to these terms...</p>`,
    CAREERS_INFO: `<h3>Careers at iCredit Union®</h3><p>We're always looking for talented individuals to join our team. Explore our open positions...</p>`,
    PRESS_ROOM_INFO: `<h3>Press Room</h3><p>For all media inquiries, please contact our press team...</p>`,
    SITE_MAP_CONTENT: `<h3>Site Map</h3><ul><li><a href="#">Dashboard</a></li><li><a href="#">Accounts</a></li><li><a href="#">Send Money</a></li></ul>`,
    ONLINE_BANKING_GUARANTEE: `<h3>Online Banking Guarantee</h3><p>We guarantee that you will not be liable for unauthorized online banking transactions when you have met your security responsibilities.</p>`,
    COOKIE_POLICY: `<h3>Cookie Policy</h3><p>We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.</p>`,
};

export const INITIAL_WALLET_DETAILS: WalletDetails = {
    balance: 1250.75,
    currency: 'USD',
    cardLastFour: '9876',
};

export const INITIAL_WALLET_TRANSACTIONS: WalletTransaction[] = [
    { id: 'wtx1', description: 'Top Up from Checking', amount: 500.00, date: new Date(now.getTime() - 86400000 * 1), type: 'credit' },
    { id: 'wtx2', description: 'Payment to Jane Doe', amount: 75.50, date: new Date(now.getTime() - 3600000 * 10), type: 'debit' },
    { id: 'wtx3', description: 'Online Purchase - Shopify', amount: 129.99, date: new Date(now.getTime() - 3600000 * 5), type: 'debit' },
];

export const CUSTOMER_REVIEWS: CustomerReview[] = [
    { id: 'rev1', author: 'Sarah L.', location: 'London, UK', rating: 5, comment: 'The best app for international transfers! So fast and the fees are very reasonable.', date: new Date('2024-05-20') },
    { id: 'rev2', author: 'Carlos G.', location: 'Miami, FL', rating: 5, comment: 'I love the security features. I feel very safe using iCredit Union for my business.', date: new Date('2024-05-15') },
    { id: 'rev3', author: 'Kenji T.', location: 'Tokyo, JP', rating: 4, comment: 'Great service. I wish there were more options for cash pickup in my area, but bank transfers are perfect.', date: new Date('2024-05-10') },
];

export const TOP_RATED_STAFF: StaffProfile[] = [
    // FIX: Add missing 'rating' property to the staff profile object to match the 'StaffProfile' type.
    { id: 'staff1', name: 'Jessica Miller', title: 'Senior Support Specialist', imageUrl: 'https://i.postimg.cc/pTfCqSjN/IOe9-Qna.jpg', bio: 'Specializes in complex international transfers and compliance.', rating: 5 },
];

// FIX: Added missing INITIAL_CAUSES constant to resolve import error in GlobalAid.tsx.
export const INITIAL_CAUSES: Omit<Cause, 'details'>[] = [
  {
    id: 'cause1',
    title: 'Emergency Medical Supplies',
    shortDescription: 'Provide critical medical aid to disaster-stricken regions.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2940&auto=format&fit=crop',
  },
  {
    id: 'cause2',
    title: 'Clean Water & Sanitation',
    shortDescription: 'Fund projects to bring clean drinking water to communities in need.',
    imageUrl: 'https://images.unsplash.com/photo-1599394551392-50226958c283?q=80&w=2940&auto=format&fit=crop',
  },
  {
    id: 'cause3',
    title: 'Childhood Education',
    shortDescription: 'Support educational programs for children in underserved areas.',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2940&auto=format&fit=crop',
  },
];
