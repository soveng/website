export function nostrProfileName(content: string): string | undefined {
  try {
    const metadata = JSON.parse(content) as { display_name?: unknown; name?: unknown };
    return [metadata.display_name, metadata.name]
      .map((value) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, 80) : ''))
      .find((value) => value && !/^[\p{P}\s]+$/u.test(value));
  } catch {
    // Ignore malformed profile metadata.
  }
}
