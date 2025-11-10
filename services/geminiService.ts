import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { NewsArticle, InsuranceProduct, LoanProduct, SystemUpdate, AccountType, VerificationLevel, AdvisorResponse, Cause } from '../types';

let ai: GoogleGenAI | undefined;
if (process.env.API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} else {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

export interface TranslationResult {
  translatedText: string;
  isError: boolean;
}

export const translateWithGemini = async (text: string, targetLanguage: string): Promise<TranslationResult> => {
    if (!ai) {
        return { translatedText: `(AI offline) ${text}`, isError: true };
    }
     if (!text || !text.trim()) {
        return { translatedText: "", isError: false };
    }
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate the following text to ${targetLanguage}. Return only the translated text, without any additional formatting or explanations. Text to translate: "${text}"`,
        });
        // FIX: Removed optional chaining from response.text as it is not nullable.
        return { translatedText: response.text.trim(), isError: false };
    } catch (error) {
        // FIX: Cast error to any to prevent potential type errors with console.error and maintain consistency.
        console.error(`Error translating text to ${targetLanguage}:`, error as any);
        return { translatedText: `(Translation Error) ${text}`, isError: true };
    }
};

export interface BankingTipResult {
  tip: string;
  isError: boolean;
}

const tipCache = new Map<string, BankingTipResult>();

export const getCountryBankingTip = async (countryName: string): Promise<BankingTipResult> => {
  if (tipCache.has(countryName)) {
    return tipCache.get(countryName)!;
  }

  if (!ai) {
    const result: BankingTipResult = {
      tip: `Standard banking information is required for ${countryName}.`,
      isError: false,
    };
    tipCache.set(countryName, result);
    return result;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a single, concise, and helpful banking tip for a user sending money to a bank account in ${countryName}. The tip should focus on a specific local requirement, a common mistake to avoid, or a best practice for that country. For example, for the UK, you might mention using a Sort Code. Frame the tip as direct advice.`,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tip: {
              type: Type.STRING,
              description: `A short, one-sentence banking tip for sending money to ${countryName}.`
            }
          }
        }
      }
    });
    
    // FIX: Removed optional chaining as `text` is guaranteed on a successful response.
    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    const parsedJson = JSON.parse(responseText.trim());
    const result: BankingTipResult = { tip: parsedJson.tip, isError: false };
    tipCache.set(countryName, result);
    return result;
  } catch (error) {
    console.error("Error fetching banking tip from Gemini:", error as any);
    const errorResult: BankingTipResult = { 
        tip: `Could not fetch banking tips at this time. Please ensure you have the correct details for ${countryName}.`, 
        isError: true 
    };
    tipCache.set(countryName, errorResult);
    return errorResult;
  }
};

export interface FinancialNewsResult {
  articles: NewsArticle[];
  isError: boolean;
}

const newsCache = new Map<string, FinancialNewsResult>();
const newsCacheKey = 'financialNews';

export const getFinancialNews = async (): Promise<FinancialNewsResult> => {
  if (newsCache.has(newsCacheKey)) {
    return newsCache.get(newsCacheKey)!;
  }

  if (!ai) {
    const result = {
      articles: [
        { title: 'Global Markets Show Mixed Signals', summary: 'Major indices are fluctuating as investors weigh inflation concerns against positive corporate earnings.', category: 'Market Analysis' },
      ],
      isError: false,
    };
    newsCache.set(newsCacheKey, result);
    return result;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate 3 brief, synthetic financial news headlines and summaries relevant to international finance.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                articles: {
                    type: Type.ARRAY,
                    description: "A list of three financial news articles.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            summary: { type: Type.STRING },
                            category: { type: Type.STRING }
                        }
                    }
                }
            }
        }
      }
    });
    
    // FIX: Removed optional chaining as `text` is guaranteed on a successful response.
    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    const parsedJson = JSON.parse(responseText.trim());
    const articles = parsedJson.articles;
    const result = { articles, isError: false };
    newsCache.set(newsCacheKey, result);
    return result;

  } catch (error) {
    console.error("Error fetching financial news from Gemini:", error as any);
    const errorResult = {
        articles: [ { title: 'AI News Feed Unavailable', summary: 'We are experiencing a temporary issue with our AI news service.', category: 'System Alert' } ],
        isError: true,
    };
    newsCache.set(newsCacheKey, errorResult);
    return errorResult;
  }
};


const insuranceCache = new Map<string, { product: InsuranceProduct | null; isError: boolean }>();

export const getInsuranceProductDetails = async (productName: string): Promise<{ product: InsuranceProduct | null; isError: boolean; }> => {
  if (insuranceCache.has(productName)) {
    return insuranceCache.get(productName)!;
  }

  if (!ai) {
    const fallbackData: { [key: string]: InsuranceProduct } = { /* ... fallback data as before ... */ };
    const product = fallbackData[productName] || null;
    const result = { product, isError: !product };
    if(product) insuranceCache.set(productName, result);
    return result;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a compelling marketing description and exactly 3 key benefits for a financial insurance product called "${productName}" offered by a fintech, iCredit Union®.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            benefits: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    
    // FIX: Removed optional chaining as `text` is guaranteed on a successful response.
    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    const parsedJson = JSON.parse(responseText.trim());
    const product: InsuranceProduct = { name: productName, description: parsedJson.description, benefits: parsedJson.benefits };
    const result = { product, isError: false };
    insuranceCache.set(productName, result);
    return result;
  } catch (error) {
    console.error(`Error fetching insurance details for ${productName} from Gemini:`, error as any);
    const errorResult = { product: null, isError: true };
    insuranceCache.set(productName, errorResult);
    return errorResult;
  }
};

// FIX: Add missing getFinancialAnalysis function.
export const getFinancialAnalysis = async (financialDataJSON: string): Promise<{ analysis: AdvisorResponse | null, isError: boolean }> => {
  if (!ai) {
    return { analysis: null, isError: true };
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following financial data for a user and provide an overall summary, a financial score (0-100), a list of insights, and product recommendations. Data: ${financialDataJSON}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallSummary: { type: Type.STRING },
            financialScore: { type: Type.INTEGER },
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  insight: { type: Type.STRING },
                  priority: { type: Type.STRING },
                },
              },
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productType: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  suggestedAction: { type: Type.STRING },
                  linkTo: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });
    
    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    const parsedJson = JSON.parse(responseText.trim());
    return { analysis: parsedJson, isError: false };
  } catch (error) {
    console.error("Error fetching financial analysis from Gemini:", error as any);
    return { analysis: null, isError: true };
  }
};

// FIX: Add missing getLoanProducts function.
export const getLoanProducts = async (): Promise<{ products: LoanProduct[], isError: boolean }> => {
  if (!ai) {
    const fallbackProducts: LoanProduct[] = [
        { id: 'loan1', name: 'Personal Loan', description: 'Flexible financing for life\'s big moments.', benefits: ['Fixed rates', 'No origination fees', 'Quick funding'], interestRate: { min: 7.99, max: 19.99 } },
        { id: 'loan2', name: 'Auto Loan', description: 'Competitive rates for new and used vehicles.', benefits: ['Flexible terms up to 72 months', 'Pre-approval available', 'Easy online application'], interestRate: { min: 5.49, max: 12.49 } },
        { id: 'loan3', name: 'Home Improvement Loan', description: 'Fund your next renovation project with a simple, fixed-rate loan.', benefits: ['Borrow up to $50,000', 'No home equity required', 'Fast decision process'], interestRate: { min: 6.99, max: 15.99 } },
    ];
    return { products: fallbackProducts, isError: false };
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate 3 synthetic and compelling loan products for a fintech called iCredit Union®. Include a unique id, name, description, 3 benefits, and min/max interest rates for each.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "A unique ID for the loan, e.g., loan1" },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
                  interestRate: {
                    type: Type.OBJECT,
                    properties: {
                      min: { type: Type.NUMBER },
                      max: { type: Type.NUMBER },
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    const parsedJson = JSON.parse(responseText.trim());
    return { products: parsedJson.products, isError: false };
  } catch (error) {
    console.error("Error fetching loan products from Gemini:", error as any);
    return { products: [], isError: true };
  }
};

// FIX: Add missing getSystemUpdates function.
export const getSystemUpdates = async (): Promise<{ updates: SystemUpdate[], isError: boolean }> => {
  if (!ai) {
    const fallback: SystemUpdate[] = [
        { id: 'upd1', title: 'Scheduled Maintenance', date: new Date().toISOString(), description: 'System will be briefly unavailable for scheduled upgrades.', category: 'Maintenance' },
        { id: 'upd2', title: 'New Feature: Virtual Cards', date: new Date(Date.now() - 86400000 * 5).toISOString(), description: 'You can now create virtual cards for secure online shopping.', category: 'New Feature' }
    ];
    return { updates: fallback, isError: false };
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate 3 recent, synthetic system updates for iCredit Union®. Include id, title, date (YYYY-MM-DD), description, and category ('New Feature', 'Improvement', 'Maintenance').",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            updates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  date: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    });
    
    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    const parsedJson = JSON.parse(responseText.trim());
    return { updates: parsedJson.updates, isError: false };
  } catch (error) {
    console.error("Error fetching system updates from Gemini:", error as any);
    return { updates: [], isError: true };
  }
};

// FIX: Add missing getSupportAnswer function.
export const getSupportAnswer = async (query: string): Promise<{ answer: string, isError: boolean }> => {
  if (!ai) {
    return { answer: "Our AI assistant is currently offline. Please check back later.", isError: true };
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a helpful support agent for iCredit Union®. Answer the following user query concisely and clearly. User query: "${query}"`,
      config: {
        temperature: 0.1,
      }
    });
    
    const answer = response.text;
    if (!answer || answer.trim() === '') {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    return { answer: answer.trim(), isError: false };
  } catch (error) {
    console.error("Error fetching support answer from Gemini:", error as any);
    return { answer: "Sorry, I was unable to process your request at this time.", isError: true };
  }
};

// FIX: Add missing getAccountPerks function.
export const getAccountPerks = async (accountType: AccountType, verificationLevel: VerificationLevel): Promise<{ perks: string[], isError: boolean }> => {
    if (!ai) {
        return { perks: ["Enhanced fraud monitoring.", "Priority customer support."], isError: false };
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a list of exactly 2 compelling, synthetic "Advanced Security Perks" for a user with a "${accountType}" account and a verification level of "${verificationLevel}".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        perks: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A list of exactly two security perk descriptions."
                        }
                    }
                }
            }
        });

        const responseText = response.text;
        if (!responseText || responseText.trim() === '') {
            throw new Error('Received empty or invalid response from Gemini API.');
        }
        const parsedJson = JSON.parse(responseText.trim());
        return { perks: parsedJson.perks, isError: false };
    } catch (error) {
        console.error("Error fetching account perks from Gemini:", error as any);
        return { perks: [], isError: true };
    }
};

// FIX: Add missing getCauseDetails function.
export const getCauseDetails = async (causeTitle: string): Promise<{ details: Cause['details'] | null; isError: boolean; }> => {
  if (!ai) {
    return { details: { description: 'Provides essential aid and relief to those in need, focusing on immediate impact.', impacts: ['$25 provides a family with clean water for a week.', '$100 supplies a classroom with essential learning materials.'] }, isError: false };
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `For a charity cause titled "${causeTitle}", generate a slightly more detailed one-sentence description and a list of 2 specific, compelling impacts of a donation.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            impacts: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    
    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    const parsedJson = JSON.parse(responseText.trim());
    return { details: parsedJson, isError: false };
  } catch (error) {
    console.error(`Error fetching cause details for ${causeTitle} from Gemini:`, error as any);
    return { details: null, isError: true };
  }
};