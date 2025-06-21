export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}