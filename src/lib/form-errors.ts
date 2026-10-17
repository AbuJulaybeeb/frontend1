/**
 * Form validation error helpers
 *
 * React Hook Form hands us the raw message produced by the Zod resolver. Two
 * things are needed before that message can be shown next to the field it
 * belongs to:
 *
 * 1. Copy a person can act on. Zod's built-in defaults ("Required", "Invalid
 *    input: expected string, received undefined", ...) describe the schema, not
 *    the problem, so they are translated into specific, actionable wording.
 * 2. The ARIA wiring that lets assistive technology announce the failure:
 *    `aria-invalid` on the control and `aria-describedby` pointing at the
 *    element that holds the message.
 *
 * The mapping lives here rather than inside the forms so sign-in, sign-up and
 * any future form report failures identically. The Zod schemas themselves are
 * left untouched, so this module only ever rewords what validation already
 * produced.
 */

/** Prefix for the element id that holds a field's inline error message. */
const FIELD_ERROR_ID_PREFIX = 'field-error';

/** Label used to phrase messages that have to be built from the field name. */
const FIELD_LABELS: Record<string, string> = {
  email: 'Email',
  name: 'Full name',
  password: 'Password',
  confirmPassword: 'Password confirmation',
};

/**
 * Known resolver messages, keyed by their normalized form (trimmed,
 * lowercased, single-spaced, without a trailing full stop).
 *
 * The schema-authored sentence is kept at the front of each replacement so the
 * original constraint stays visible; the added clause tells the person what to
 * do about it.
 */
const FRIENDLY_MESSAGES: Record<string, string> = {
  // Email
  'invalid email address':
    'Invalid email address. Enter it in the format name@example.com.',
  'invalid email': 'Invalid email address. Enter it in the format name@example.com.',

  // Name
  'name must be at least 2 characters':
    'Name must be at least 2 characters. Enter the name supporters should see.',
  'name cannot exceed 100 characters':
    'Name cannot exceed 100 characters. Shorten it so it fits on your profile.',

  // Password
  'password must be at least 6 characters':
    'Password must be at least 6 characters. Re-enter your existing password.',
  'password must be at least 8 characters':
    'Password must be at least 8 characters. Use 8 or more characters for your new password.',
  'password must contain at least one uppercase letter':
    'Password must contain at least one uppercase letter.',
  'password must contain at least one number': 'Password must contain at least one number.',

  // Password confirmation
  "passwords don't match":
    "Passwords don't match. Re-type the confirmation so it matches your new password exactly.",
  'passwords do not match':
    "Passwords don't match. Re-type the confirmation so it matches your new password exactly.",
};

/**
 * Zod's "this value is missing" defaults. They read as schema diagnostics, so
 * they are replaced with a field-scoped instruction instead of being shown.
 */
const MISSING_VALUE_PATTERNS: RegExp[] = [
  /^required$/,
  /^invalid input: expected string, received undefined$/,
  /^invalid literal\(undefined\), received undefined$/,
  /^expected string, received undefined$/,
];

/** Message shown when a field was never filled in, per field. */
const REQUIRED_MESSAGES: Record<string, string> = {
  email: 'Email is required. Enter the address you use to sign in.',
  name: 'Full name is required. Enter the name supporters should see.',
  password: 'Password is required. Enter your password to continue.',
  confirmPassword: 'Password confirmation is required. Re-type the password you just created.',
};

/** Zod string-length defaults: "String must contain at least 8 character(s)". */
const STRING_LENGTH_PATTERN = /^string must contain (at least|at most) (\d+) character\(s\)$/;

/** The attributes a control needs so screen readers announce its error. */
export interface FieldErrorAriaProps {
  'aria-invalid': boolean;
  'aria-describedby'?: string;
}

/** Everything a form field needs to render and describe its error state. */
export interface FieldErrorProps {
  /** Id of the element holding the inline message, for `aria-describedby`. */
  errorId: string;
  /** Actionable message, or `undefined` while the field is valid. */
  message?: string;
  /** Spread onto the control: `aria-invalid` plus the message reference. */
  aria: FieldErrorAriaProps;
}

/** Normalize a resolver message so lookups are punctuation/whitespace agnostic. */
function normalize(message: string): string {
  return message
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.!]+$/, '');
}

/** Turn a field name such as `confirmPassword` into "Confirm password". */
function humanizeField(field: string): string {
  const spaced = field
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
  if (!spaced) return 'This field';
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Guarantee sentence casing and a terminating full stop. */
function toSentence(message: string): string {
  const trimmed = message.trim();
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

/**
 * Translate a raw resolver message into specific, actionable copy.
 *
 * Unknown messages (for example one returned by the server) are returned with
 * their wording intact rather than discarded, so no information is lost.
 */
export function getFriendlyErrorMessage(field: string, message?: string | null): string {
  const label = FIELD_LABELS[field] ?? humanizeField(field);
  const trimmed = message?.trim();

  if (!trimmed) return REQUIRED_MESSAGES[field] ?? `${label} is required.`;

  const key = normalize(trimmed);

  const known = FRIENDLY_MESSAGES[key];
  if (known) return known;

  if (MISSING_VALUE_PATTERNS.some((pattern) => pattern.test(key))) {
    return REQUIRED_MESSAGES[field] ?? `${label} is required.`;
  }

  const length = STRING_LENGTH_PATTERN.exec(key);
  if (length) {
    return length[1] === 'at least'
      ? `${label} must be at least ${length[2]} characters.`
      : `${label} cannot be longer than ${length[2]} characters.`;
  }

  return toSentence(trimmed);
}

/**
 * Build the id, message and ARIA attributes for one field's error state.
 *
 * `aria-invalid` is always present so the state is explicit rather than
 * implied, while `aria-describedby` only points at the message while it is on
 * screen - a dangling `aria-describedby` reference is an accessibility defect.
 */
export function getFieldErrorProps(field: string, message?: string | null): FieldErrorProps {
  const errorId = `${FIELD_ERROR_ID_PREFIX}-${field}`;
  const trimmed = message?.trim();

  if (!trimmed) {
    return { errorId, message: undefined, aria: { 'aria-invalid': false } };
  }

  return {
    errorId,
    message: getFriendlyErrorMessage(field, trimmed),
    aria: { 'aria-invalid': true, 'aria-describedby': errorId },
  };
}