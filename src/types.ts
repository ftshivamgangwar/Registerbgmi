export interface UserProfile {
  uid: string;
  email: string;
  realName: string;
  bgmiId: string;
  bgmiName: string;
  upiId: string;
  instagramId: string;
  whatsappNumber: string;
  createdAt: any; // Firestore Timestamp or Date ISO string
}

export interface BgmiIdMap {
  uid: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}
