export interface LinkSummary {
  id: string;
  destination_url: string;
  created_at: Date;
  expires_at: Date;
  user_id: string | null;
  total_accesses: number;
}

export interface Count {
  value: string;
  count: number;
}

export interface LinkStats {
  link: Omit<LinkSummary, 'total_accesses'>;
  total_accesses: number;
  unique_visitors: number; // aproximação: IPs + user-agents distintos
  accesses_by_day: { day: string; count: number }[];
  top_referers: Count[];
  top_user_agents: Count[];
}

export interface AdminOverview {
  users: number;
  links: { total: number; owned: number; anonymous: number };
  accesses: { total: number; on_anonymous_links: number };
  top_links: LinkSummary[];
}

export interface AccessRow {
  accessed_at: Date;
  ip: string | null;
  user_agent: string | null;
  referer: string | null;
}
