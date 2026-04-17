import { useEffect, useState } from "react";
import {
  nostrService,
  type NostrProfile,
} from "../helpers/nostr/NostrService";
import type { NostrEvent } from "nostr-tools";

const BRAND_RED = "#ED3238";

function VideoModal({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      {/* Phone-sized container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(375px, 90vw)",
          maxHeight: "85vh",
          borderRadius: "1.5rem",
          overflow: "hidden",
          background: "#000",
          border: "3px solid #27272a",
          cursor: "default",
        }}
      >
        <video
          src={src}
          controls
          autoPlay
          playsInline
          style={{
            display: "block",
            width: "100%",
            maxHeight: "85vh",
            objectFit: "contain",
            background: "#000",
          }}
        />
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.7)",
            border: "1px solid #555",
            color: "#fff",
            fontSize: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function formatRelativeTime(unixSeconds: number): string {
  const diffSec = Math.floor(Date.now() / 1000) - unixSeconds;
  const day = 24 * 60 * 60;
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < day) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / day)}d ago`;
}

interface DemoCardProps {
  event: NostrEvent;
  profile?: NostrProfile;
  onExpand?: (videoUrl: string) => void;
}

function DemoCard({ event, profile, onExpand }: DemoCardProps) {
  const title = nostrService.extractTitle(event);
  const videoUrl = nostrService.extractVideoUrl(event);
  const imageUrl = nostrService.extractImage(event);
  const authorName =
    profile?.display_name ||
    profile?.displayName ||
    profile?.name ||
    `${event.pubkey.slice(0, 8)}…${event.pubkey.slice(-4)}`;
  const avatarSrc = profile?.picture || profile?.image;

  return (
    <article
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: "1rem",
        border: "1px solid #27272a",
        background: "#09090b",
        padding: "1.5rem",
      }}
    >
      {/* Header: avatar + author + time */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={authorName}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
              background: "#fff",
            }}
          />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#27272a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#71717a",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {authorName.charAt(0).toUpperCase()}
          </div>
        )}
        <div
          style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}
        >
          <span
            style={{ fontSize: 14, fontWeight: 500, color: "#f4f4f5" }}
          >
            {authorName}
          </span>
          <span style={{ fontSize: 12, color: "#a1a1aa" }}>
            {formatRelativeTime(event.created_at)}
          </span>
        </div>
      </div>

      {/* Video thumbnail — compact 16:9 preview. Clicking the expand
          button opens a phone-sized modal instead of native fullscreen. */}
      {videoUrl && (
        <div
          style={{ position: "relative", marginBottom: "1rem" }}
        >
          <video
            src={videoUrl}
            controls
            playsInline
            controlsList="nofullscreen"
            className="demo-video-thumb"
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              objectFit: "cover",
              background: "#000",
              borderRadius: "0.5rem",
              display: "block",
            }}
          />
          <button
            onClick={() => onExpand?.(videoUrl)}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: 6,
              background: "rgba(0,0,0,0.7)",
              border: "1px solid #555",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Watch at phone size"
          >
            ⛶
          </button>
        </div>
      )}
      {!videoUrl && imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            objectFit: "cover",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
          }}
        />
      )}

      {/* Title */}
      <h3
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          lineHeight: 1.25,
          color: "#fff",
          margin: 0,
          flex: 1,
        }}
      >
        {title}
      </h3>

      {/* Footer link */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: "0.5rem",
          borderTop: "1px solid #27272a",
        }}
      >
        <a
          href={`https://njump.me/${event.id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: BRAND_RED,
            textDecoration: "none",
          }}
        >
          View on Nostr →
        </a>
      </div>
    </article>
  );
}

export default function DemoGallery() {
  const [demos, setDemos] = useState<NostrEvent[]>([]);
  const [profiles, setProfiles] = useState<Map<string, NostrProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [allowlistSource, setAllowlistSource] = useState<
    "nostr" | "fallback"
  >("fallback");
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    nostrService.fetchPageData().then((data) => {
      if (cancelled) return;
      setDemos(data.demos);
      setProfiles(data.profiles);
      setAllowlistSource(data.allowlistSource);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "3rem",
          color: "#a1a1aa",
        }}
      >
        Loading demos from Nostr...
      </div>
    );
  }

  if (demos.length === 0) {
    return (
      <div
        style={{
          borderRadius: "1rem",
          border: "1px dashed #3f3f46",
          background: "#09090b",
          padding: "3rem",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 16, fontWeight: 500, color: "#e4e4e7" }}>
          No demos posted yet for this cohort.
        </p>
        <p
          style={{ marginTop: "0.5rem", fontSize: 14, color: "#a1a1aa" }}
        >
          Cohort participants: post a kind:1 note tagged{" "}
          <code style={{ color: BRAND_RED }}>#demoday</code> from your npub
          to appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "#a1a1aa",
          marginBottom: "1.5rem",
        }}
      >
        {demos.length} live demo{demos.length === 1 ? "" : "s"} pulled from
        Nostr ·{" "}
        {allowlistSource === "nostr"
          ? "curator-published allowlist"
          : "hardcoded cohort fallback"}
      </div>
      {expandedVideo && (
        <VideoModal
          src={expandedVideo}
          onClose={() => setExpandedVideo(null)}
        />
      )}
      <div className="cohort-masonry">
        {demos.map((event) => (
          <DemoCard
            key={event.id}
            event={event}
            profile={profiles.get(event.pubkey)}
            onExpand={setExpandedVideo}
          />
        ))}
      </div>
    </>
  );
}
