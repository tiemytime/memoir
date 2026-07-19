export interface LearningSession {
  id: string;
  url: string;
  pageTitle: string;
  createdAt: number;
  updatedAt: number;
  notes: string;
  aiExpansion?: string;
  tags: string[];
}
