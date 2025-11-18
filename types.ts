

export interface NewsArticle {
    id: number;
    title: string;
    date: string;
    excerpt: string;
}

export type Year = '1st year' | '2nd year' | '3rd year' | '4th year';

// FIX: Add AspectRatio type for video generation.
export type AspectRatio = '16:9' | '9:16';

export interface User {
    name: string;
    year: Year | null;
    idNumber?: string;
    interests?: string[];
    profilePicture?: string;
    lastLogin?: string;
    loginCount?: number;
}

// NEW: Define file types
export type FileType = 'pdf' | 'presentation' | 'document' | 'spreadsheet';

// REPLACED: PdfFile with SubjectFile
export interface SubjectFile {
  id: number;
  name: string;
  link: string;
  type: FileType;
}

// REPLACED: ResourcePdf with ResourceFile
export interface ResourceFile extends SubjectFile {
  year: Year;
  semester: 1 | 2;
  subjectName: string;
}

// UPDATED: Subject interface
export interface Subject {
  id: number;
  name: string;
  year: Year;
  semester: 1 | 2;
  files: SubjectFile[];
}

export type CodingTopicDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface CodingTopic {
    id: string;
    name: string;
    description: string;
    category: 'language' | 'concept';
    difficulty: CodingTopicDifficulty;
}

export interface SavedPracticeProblem {
    id: string;
    topicName: string;
    topicId: string;
    question: string;
}

export interface TeamMember {
    id: number;
    name: string;
    role: string;
    bio: string;
    imageUrl: string;
}

export interface AnalyticsEvent {
    type: 'pageView' | 'featureUse';
    name: string;
    timestamp: string;
    userName?: string;
    payload?: Record<string, any>;
}
