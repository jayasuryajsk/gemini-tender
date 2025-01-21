// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'gemini-2.0-flash-exp',
    label: 'Gemini Flash 2.0',
    apiIdentifier: 'gemini-2.0-flash-exp',
    description: 'Experimental version of Gemini Flash 2.0',
  },
  {
    id: 'gemini-1.5-flash-latest',
    label: 'Gemini Flash 1.5',
    apiIdentifier: 'gemini-1.5-flash-latest',
    description: 'Latest version of Gemini Flash 1.5',
  }
] as const;

export const DEFAULT_MODEL_NAME: string = 'gemini-2.0-flash-exp';
