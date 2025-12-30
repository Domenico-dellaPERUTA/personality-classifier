// frontend/src/types.ts

export interface PersonalityType {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

export interface Contact {
  id: number;
  name: string;
  surname: string | null;
  relationship: string | null;
  personality_type_id: number | null;
  personality_code: string | null;
  personality_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactFormData {
  name: string;
  surname: string;
  relationship: string;
  personality_type_id: string | number;
  notes: string;
}

export interface Statistics {
  total: number;
  byType: {
    code: string;
    name: string;
    count: number;
  }[];
}