export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string; // This will hold the consensus text
  rawResponses?: { provider: string; text: string }[];
  attachment?: { name: string };
}

export interface EvidenceFile {
  name: string;
  sha512: string;
  file: File;
}

export interface SealedPackage {
  name: string;
  sha512: string;
  blobUrl: string;
  createdAt: string;
}