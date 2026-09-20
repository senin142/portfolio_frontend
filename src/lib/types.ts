export type Role = 'admin' | 'editor';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  body: string;
  published: boolean;
  authorId: string;
  author?: { id: string; name: string; email: string };
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicArticle extends Article {
  related?: Article[];
}

export interface ArticleInput {
  slug: string;
  title: string;
  body: string;
  published?: boolean;
  tags?: string[];
}

export interface MediaUsage {
  usedBytes: number;
  capBytes: number;
  percentUsed: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actorUserId: string | null;
  actorEmail: string | null;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}
