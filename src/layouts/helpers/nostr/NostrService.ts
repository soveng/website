import { RelayPool } from "applesauce-relay";
import { completeOnEose } from "applesauce-relay/operators";
import { lastValueFrom, toArray } from "rxjs";
import type { Filter, NostrEvent } from "nostr-tools";
import {
  HASHTAGS,
  ALLOWED_PUBKEYS,
  CURATOR_PUBKEYS,
  COHORT_D_TAGS,
  COHORT_START_TIMESTAMP,
  COHORT_END_TIMESTAMP,
  DEFAULT_RELAYS,
} from "./config";

export interface NostrProfile {
  name?: string;
  displayName?: string;
  display_name?: string;
  about?: string;
  picture?: string;
  image?: string;
  banner?: string;
  nip05?: string;
  lud16?: string;
}

export interface PageData {
  allowlistPubkeys: string[];
  allowlistSource: "nostr" | "fallback";
  cohortListCount: number;
  demos: NostrEvent[];
  profiles: Map<string, NostrProfile>;
}

export class NostrService {
  private pool: RelayPool;

  constructor() {
    // Browser has native WebSocket — no need to inject `ws` like the SSR
    // version does. Lower EOSE timeout for snappy in-browser fetches.
    this.pool = new RelayPool({ eoseTimeout: 1200 });
  }

  private async fetchEvents(
    filters: Filter | Filter[],
  ): Promise<NostrEvent[]> {
    try {
      return await lastValueFrom(
        this.pool
          .req(DEFAULT_RELAYS, filters)
          .pipe(completeOnEose(), toArray()),
      );
    } catch (err) {
      console.error("[NostrService] fetchEvents threw:", err);
      return [];
    }
  }

  /**
   * Single-round-trip fetch: cohort lists + demo events + profiles in one REQ.
   * Relays process all three filters in parallel and emit one EOSE.
   */
  async fetchPageData(): Promise<PageData> {
    const filters: Filter[] = [
      {
        kinds: [30000],
        authors: CURATOR_PUBKEYS,
        "#d": COHORT_D_TAGS,
      },
      {
        kinds: [1],
        authors: ALLOWED_PUBKEYS,
        "#t": HASHTAGS,
        since: COHORT_START_TIMESTAMP,
        until: COHORT_END_TIMESTAMP,
        limit: 200,
      },
      {
        kinds: [0],
        authors: ALLOWED_PUBKEYS,
      },
    ];

    const events = await this.fetchEvents(filters);

    const cohortListEvents = events.filter((e) => e.kind === 30000);
    const demoEventsRaw = events.filter((e) => e.kind === 1);
    const profileEvents = events.filter((e) => e.kind === 0);

    // Resolve allowlist (cohort list union, fallback to hardcoded)
    let allowlistPubkeys: string[] = ALLOWED_PUBKEYS;
    let allowlistSource: "nostr" | "fallback" = "fallback";
    if (cohortListEvents.length > 0) {
      const set = new Set<string>();
      cohortListEvents.forEach((e) => {
        e.tags
          .filter((t) => t[0] === "p" && t[1])
          .forEach((t) => set.add(t[1]));
      });
      if (set.size > 0) {
        allowlistPubkeys = Array.from(set);
        allowlistSource = "nostr";
      }
    }

    const allowlistSet = new Set(allowlistPubkeys);
    const demoMap = new Map<string, NostrEvent>();
    for (const e of demoEventsRaw) {
      if (allowlistSet.has(e.pubkey) && !demoMap.has(e.id))
        demoMap.set(e.id, e);
    }
    const demos = Array.from(demoMap.values()).sort(
      (a, b) => b.created_at - a.created_at,
    );

    const latestProfile = new Map<string, NostrEvent>();
    for (const e of profileEvents) {
      const prev = latestProfile.get(e.pubkey);
      if (!prev || e.created_at > prev.created_at)
        latestProfile.set(e.pubkey, e);
    }
    const profiles = new Map<string, NostrProfile>();
    for (const [pubkey, event] of latestProfile) {
      try {
        profiles.set(pubkey, JSON.parse(event.content) as NostrProfile);
      } catch {
        // ignore malformed profile JSON
      }
    }

    return {
      allowlistPubkeys,
      allowlistSource,
      cohortListCount: cohortListEvents.length,
      demos,
      profiles,
    };
  }

  extractTitle(event: NostrEvent): string {
    const titleTag = event.tags.find((tag) => tag[0] === "title");
    if (titleTag) return titleTag[1];
    const firstLine = event.content.split("\n")[0].trim();
    return firstLine.length > 140
      ? `${firstLine.substring(0, 137)}...`
      : firstLine || "(untitled demo)";
  }

  extractImage(event: NostrEvent): string | undefined {
    const imageTag = event.tags.find((tag) => tag[0] === "image");
    if (imageTag) return imageTag[1];
    const m = event.content.match(
      /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp))/i,
    );
    return m?.[0];
  }

  extractVideoUrl(event: NostrEvent): string | undefined {
    const m = event.content.match(/(https?:\/\/[^\s]+\.(?:mp4|webm|mov))/i);
    return m?.[0];
  }
}

export const nostrService = new NostrService();
