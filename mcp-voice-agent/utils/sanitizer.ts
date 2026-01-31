import { UserContext } from '../types';

// Regex for emails (basic)
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
// Regex for generic tokens (Bearer tokens, long hex strings)
const TOKEN_REGEX = /Bearer\s+[a-zA-Z0-9\-_.]+/g;
const HEX_REGEX = /\b[a-f0-9]{32,}\b/g;

export const sanitizeText = (text: string): string => {
  return text
    .replace(EMAIL_REGEX, '[REDACTED_EMAIL]')
    .replace(TOKEN_REGEX, 'Bearer [REDACTED_TOKEN]')
    .replace(HEX_REGEX, '[REDACTED_HASH]');
};

export const sanitizeContext = (context: UserContext): UserContext => {
  return {
    ...context,
    user_id: sanitizeText(context.user_id),
    logs: context.logs.map(log => sanitizeText(log)),
    recent_errors: context.recent_errors?.map(err => sanitizeText(err)) || [],
  };
};
