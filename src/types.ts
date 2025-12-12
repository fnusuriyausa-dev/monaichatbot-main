
export interface TranslationResponse {
  source_language: string;
  translation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text?: string; // For user messages
  data?: TranslationResponse; // For model messages (parsed JSON)
  rawResponse?: string; // Fallback for model messages if JSON parsing fails
  timestamp: number;
  isError?: boolean;
}

export type SuggestionStatus = 'pending' | 'approved' | 'rejected';

export interface VocabularyItem {
  id: string;
  original: string;
  suggestion: string;
  context?: string;
  status: SuggestionStatus;
  timestamp: any; // Firestore timestamp or number
}
