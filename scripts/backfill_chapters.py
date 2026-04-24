#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import math
import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

REPO = Path('/tmp/soveng-website')
XML_PATH = REPO / 'public' / 'dialogues.xml'
CHAPTERS_DIR = REPO / 'public' / 'chapters'
PODCAST_DIR = Path('/data/podcast')

STOPWORDS = {
    'a', 'about', 'actually', 'after', 'again', 'all', 'almost', 'also', 'always', 'an', 'and', 'any', 'are', 'as', 'at',
    'back', 'be', 'because', 'been', 'before', 'being', 'between', 'both', 'but', 'by', 'can', 'counts', 'did', 'do', 'does',
    'doing', 'dont', 'down', 'early', 'else', 'even', 'every', 'few', 'for', 'from', 'full', 'get', 'gets', 'go', 'going',
    'good', 'had', 'has', 'have', 'he', 'her', 'here', 'him', 'his', 'how', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
    'just', 'kind', 'less', 'let', 'like', 'many', 'may', 'more', 'most', 'much', 'need', 'new', 'no', 'not', 'now', 'of',
    'off', 'on', 'once', 'one', 'only', 'or', 'other', 'our', 'out', 'over', 'own', 'part', 'people', 'piece', 'pieces',
    'real', 'really', 'same', 'so', 'some', 'still', 'stuff', 'such', 'than', 'that', 'the', 'their', 'them', 'then',
    'there', 'these', 'they', 'thing', 'things', 'this', 'those', 'through', 'to', 'too', 'under', 'up', 'use', 'user',
    'users', 'using', 'very', 'vs', 'want', 'was', 'way', 'we', 'what', 'when', 'where', 'which', 'while', 'why', 'with',
    'world', 'would', 'you', 'your', 'yours', 'yes'
}

ITEM_RE = re.compile(r'<item>([\s\S]*?)</item>')


@dataclass
class Cue:
    start: float
    end: float
    text: str
    norm: str
    tokens: set[str]


@dataclass
class EpisodeMeta:
    number: str
    title: str
    slug: str
    duration: int
    audio_url: str
    item_xml: str


def slugify(title: str) -> str:
    title = re.sub(r'^#', '', title)
    title = re.sub(r'[^a-zA-Z0-9\s-]', '', title).strip()
    return re.sub(r'\s+', '-', title).lower()


def extract_tag(block: str, tag: str) -> str:
    m = re.search(rf'<{re.escape(tag)}[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?</{re.escape(tag)}>', block)
    return m.group(1).strip() if m else ''


def extract_attr(block: str, tag: str, attr: str) -> str:
    m = re.search(rf'<{re.escape(tag)}[^>]*?{re.escape(attr)}="([^"]*)"', block, re.S)
    return m.group(1) if m else ''


def parse_duration(raw: str) -> int:
    raw = raw.strip()
    if raw.isdigit():
        return int(raw)
    parts = [int(p) for p in raw.split(':')]
    if len(parts) == 3:
        h, m, s = parts
        return h * 3600 + m * 60 + s
    if len(parts) == 2:
        m, s = parts
        return m * 60 + s
    return 0


def load_episode_meta(number: str) -> EpisodeMeta:
    xml = XML_PATH.read_text()
    number_re = re.compile(rf'^#?0*{int(number)}:')
    for match in ITEM_RE.finditer(xml):
        item_xml = match.group(0)
        block = match.group(1)
        title = extract_tag(block, 'title')
        if not number_re.match(title):
            continue
        return EpisodeMeta(
            number=f'{int(number):02d}',
            title=title,
            slug=slugify(title),
            duration=parse_duration(extract_tag(block, 'itunes:duration')),
            audio_url=extract_attr(block, 'enclosure', 'url'),
            item_xml=item_xml,
        )
    raise SystemExit(f'Could not find episode {number} in dialogues.xml')


def find_episode_dir(number: str) -> Path:
    prefix = f'{int(number):02d} - '
    matches = sorted([p for p in PODCAST_DIR.iterdir() if p.is_dir() and p.name.startswith(prefix)])
    if not matches:
        raise SystemExit(f'Could not find podcast folder for episode {number}')
    return matches[0]


def pick_audio_file(folder: Path, number: str) -> str:
    files = sorted(folder.glob('*.m4a')) + sorted(folder.glob('*.mp3'))
    preferred_prefixes = [f'{int(number):02d} - ', f'{int(number):02d}.']
    for path in files:
        if any(path.name.startswith(prefix) for prefix in preferred_prefixes):
            return path.name
    return files[0].name if files else ''


def pick_transcript_file(folder: Path, number: str) -> Path:
    files = sorted(folder.glob('*.srt'))
    preferred_prefixes = [f'{int(number):02d} - ', f'{int(number):02d}.']
    for path in files:
        if any(path.name.startswith(prefix) for prefix in preferred_prefixes):
            return path
    if not files:
        raise SystemExit(f'Could not find transcript for episode {number}')
    return files[-1]


def markdown_to_text(text: str) -> str:
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'\1', text)
    text = re.sub(r'<[^>]+>', '', text)
    text = text.replace('\\-', '-').replace('\\#', '#').replace('\\+', '+').replace('\\!', '!')
    text = re.sub(r'[`*_>#]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def first_url(text: str) -> str | None:
    m = re.search(r'\[[^\]]+\]\((https?://[^)]+)\)', text)
    if m:
        return m.group(1)
    m = re.search(r'(https?://\S+)', text)
    return m.group(1) if m else None


def extract_bullets(shownotes: str) -> list[tuple[str, str | None]]:
    lines = shownotes.splitlines()
    bullets: list[tuple[str, str | None]] = []
    in_dialogue = False
    current: list[str] = []

    def flush_current() -> None:
        nonlocal current
        if not current:
            return
        raw = ' '.join(part.strip() for part in current if part.strip())
        plain = markdown_to_text(raw).strip(' -')
        if plain:
            bullets.append((plain, first_url(raw)))
        current = []

    for line in lines:
        stripped = line.strip()
        lowered = stripped.lower()
        if lowered.startswith('in this dialogue:'):
            in_dialogue = True
            flush_current()
            continue
        if in_dialogue and stripped and not re.match(r'^(?:[-*]|\\-)\s+', stripped) and stripped.endswith(':'):
            flush_current()
            break
        if not in_dialogue:
            continue
        if re.match(r'^(?:[-*]|\\-)\s+', stripped):
            flush_current()
            current = [re.sub(r'^(?:[-*]|\\-)\s+', '', stripped)]
        elif current and stripped:
            current.append(stripped)
        elif current:
            flush_current()
    flush_current()
    return bullets


def normalize(text: str) -> str:
    text = markdown_to_text(text).lower()
    text = text.replace('’', "'").replace('“', '"').replace('”', '"')
    text = re.sub(r'[^a-z0-9+# ]+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def tokenize(text: str) -> list[str]:
    return [token for token in normalize(text).split() if len(token) >= 3 and token not in STOPWORDS]


def parse_srt_time(raw: str) -> float:
    hh, mm, rest = raw.split(':')
    ss, ms = rest.split(',')
    return int(hh) * 3600 + int(mm) * 60 + int(ss) + int(ms) / 1000


def parse_srt(path: Path) -> list[Cue]:
    text = path.read_text(errors='ignore').replace('\r\n', '\n')
    blocks = re.split(r'\n\s*\n', text.strip())
    cues: list[Cue] = []
    for block in blocks:
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        if len(lines) < 2:
            continue
        if '-->' not in lines[1]:
            continue
        start_raw, end_raw = [part.strip() for part in lines[1].split('-->')]
        body = ' '.join(lines[2:]).strip()
        if not body:
            continue
        norm = normalize(body)
        cues.append(Cue(
            start=parse_srt_time(start_raw),
            end=parse_srt_time(end_raw),
            text=body,
            norm=norm,
            tokens=set(tokenize(body)),
        ))
    return cues


def target_chapter_count(duration: int, bullet_count: int) -> int:
    if bullet_count <= 1 or duration <= 180:
        return 1
    if duration < 1800:
        target = 6
    elif duration < 2700:
        target = 8
    elif duration < 4200:
        target = 10
    else:
        target = 12
    return min(target, bullet_count)


def sample_evenly(items: list[tuple[str, str | None]], count: int) -> list[tuple[str, str | None]]:
    if len(items) <= count:
        return items
    indexes = sorted({round(i * (len(items) - 1) / (count - 1)) for i in range(count)})
    sampled = [items[i] for i in indexes]
    while len(sampled) < count:
        for item in items:
            if item not in sampled:
                sampled.append(item)
                sampled = sampled[:count]
                break
    return sampled


def trim_title(text: str, limit: int = 72) -> str:
    text = re.sub(r'\s+', ' ', text).strip(' .;:-')
    if len(text) <= limit:
        return text
    shortened = text[:limit + 1]
    if ' ' in shortened:
        shortened = shortened.rsplit(' ', 1)[0]
    return shortened.rstrip(' ,;:-') + '…'


def window_text(cues: list[Cue], start_index: int, seconds: float = 60.0, max_cues: int = 12) -> tuple[float, set[str], str]:
    start = cues[start_index].start
    tokens: set[str] = set()
    parts: list[str] = []
    for cue in cues[start_index:start_index + max_cues]:
        if cue.start - start > seconds:
            break
        tokens.update(cue.tokens)
        parts.append(cue.norm)
    return start, tokens, ' '.join(parts)


def choose_start_times(selected: list[tuple[str, str | None]], cues: list[Cue], duration: int) -> list[float]:
    if not cues:
        if len(selected) == 1:
            return [0.0]
        return [round(i * duration / len(selected), 3) for i in range(len(selected))]

    transcript_freq = Counter(token for cue in cues for token in cue.tokens)
    starts: list[float] = []
    min_gap = max(45, duration // max(10, len(selected) * 2))
    slot = duration / max(1, len(selected))

    for idx, (bullet, _) in enumerate(selected):
        fallback = 0.0 if len(selected) == 1 else idx * slot
        keywords = tokenize(bullet)
        rare_keywords = [kw for kw in keywords if transcript_freq.get(kw, 0)]
        prev = starts[-1] if starts else 0.0
        floor = prev + (min_gap if starts else 0)
        band_start = max(floor, fallback - slot * 0.6)
        band_end = min(duration, fallback + slot * 0.6)
        best_time = None
        best_score = -1.0
        for cue_index, cue in enumerate(cues):
            if cue.start < band_start or cue.start > band_end:
                continue
            start, tokens, joined = window_text(cues, cue_index)
            overlap = [kw for kw in rare_keywords if kw in tokens]
            if not overlap:
                continue
            score = 0.0
            for kw in overlap:
                score += 1.0 / max(1, transcript_freq[kw])
                if f' {kw} ' in f' {joined} ':
                    score += 0.05
            score += len(overlap) * 0.2
            score -= abs(start - fallback) / max(1.0, slot)
            if score > best_score:
                best_score = score
                best_time = start
        if best_time is not None and best_score >= 0.2:
            chosen = best_time * 0.6 + fallback * 0.4
        else:
            chosen = fallback
        starts.append(float(chosen))

    if starts:
        starts[0] = 0.0

    for idx in range(1, len(starts)):
        starts[idx] = max(starts[idx], starts[idx - 1] + min_gap)

    for idx in range(len(starts)):
        remaining = len(starts) - idx - 1
        latest = max(0, duration - remaining * min_gap - 1)
        starts[idx] = min(starts[idx], latest)

    deduped: list[float] = []
    for idx, value in enumerate(starts):
        if idx == 0:
            deduped.append(max(0.0, value))
        else:
            deduped.append(max(value, deduped[-1] + min_gap))
    return [round(value, 3) for value in deduped]


def build_chapters(meta: EpisodeMeta, bullets: list[tuple[str, str | None]], audio_name: str, cues: list[Cue]) -> dict:
    if not bullets:
        bullets = [(meta.title, None)]

    selected = sample_evenly(bullets, target_chapter_count(meta.duration, len(bullets)))
    starts = choose_start_times(selected, cues, meta.duration)
    chapters = []
    for idx, ((bullet, url), start_time) in enumerate(zip(selected, starts)):
        end_time = round(starts[idx + 1], 3) if idx + 1 < len(starts) else round(float(meta.duration), 3)
        chapter = {
            'startTime': 0 if idx == 0 else round(start_time, 3),
            'endTime': end_time,
            'title': trim_title(bullet),
        }
        if url:
            chapter['url'] = url
        chapters.append(chapter)

    title_body = meta.title.split(': ', 1)[1] if ': ' in meta.title else meta.title
    return {
        'version': '1.2.0',
        'author': 'Gigi',
        'title': meta.title,
        'podcastName': 'No Solutions',
        'description': f'Draft chapter map for episode {int(meta.number)}, {title_body}.',
        'fileName': audio_name,
        'chapters': chapters,
    }


def update_xml(meta: EpisodeMeta) -> None:
    xml = XML_PATH.read_text()
    chapter_url = f'https://sovereignengineering.io/chapters/{meta.slug}.json'
    tag = f'      <podcast:chapters url="{chapter_url}" type="application/json+chapters"/>'
    if chapter_url in meta.item_xml:
        return
    if '<podcast:transcript ' in meta.item_xml:
        updated_item = re.sub(
            r'(\n\s*<podcast:transcript[^\n]*/>)',
            r'\1\n' + tag,
            meta.item_xml,
            count=1,
        )
    else:
        updated_item = meta.item_xml.replace('      <podcast:funding ', tag + '\n      <podcast:funding ', 1)
    xml = xml.replace(meta.item_xml, updated_item, 1)
    XML_PATH.write_text(xml)


def main() -> None:
    parser = argparse.ArgumentParser(description='Backfill Podcasting 2.0 chapter metadata for one episode.')
    parser.add_argument('episode', help='Episode number, e.g. 24')
    parser.add_argument('--write-only', action='store_true', help='Skip XML update and write only the chapter JSON')
    args = parser.parse_args()

    meta = load_episode_meta(args.episode)
    folder = find_episode_dir(args.episode)
    shownotes_path = folder / 'shownotes.md'
    shownotes = shownotes_path.read_text() if shownotes_path.exists() else ''
    transcript_path = pick_transcript_file(folder, args.episode)
    audio_name = pick_audio_file(folder, args.episode)
    bullets = extract_bullets(shownotes)
    cues = parse_srt(transcript_path)
    chapter_doc = build_chapters(meta, bullets, audio_name, cues)

    CHAPTERS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = CHAPTERS_DIR / f'{meta.slug}.json'
    out_path.write_text(json.dumps(chapter_doc, indent=2, ensure_ascii=False) + '\n')

    if not args.write_only:
        update_xml(meta)

    print(out_path)


if __name__ == '__main__':
    main()
