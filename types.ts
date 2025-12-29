
export enum UserRole {
  STUDENT = 'student',
  CREATOR = 'creator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  learningPoints: number;
}

export interface Companion {
  id: string;
  name: string;
  roleDescription: string;
  category: string;
  avatarEmoji: string;
  colorClass: string;
  costPoints: number;
  description: string;
  quote: string;
  difyPromptLink?: string;
  difyApiKey?: string;
  remarks?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  stats: {
    rating: number;
    currentSubscribers: number;
    totalSubscribersEver: number;
  };
}

export interface CompanionAssignment {
  id: string;
  companionId: string;
  creatorId: string;
  assignedBy: string;
  assignedAt: string;
}

export interface UserCompanion {
  id: string;
  userId: string;
  companionId: string;
  recruitedAt: string;
  isActive: boolean;
  totalMessages: number;
  lastInteractionAt?: string;
}
