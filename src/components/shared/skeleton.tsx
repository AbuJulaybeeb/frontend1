/**
 * Skeleton
 * Loading placeholder
 */

import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps): JSX.Element {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

/**
 * Skeleton Card
 */
export function SkeletonCard(): JSX.Element {
  return (
    <div className="space-y-4 rounded-lg border border-border p-6">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

/**
 * Skeleton List Item
 * Placeholder matching a common list row (avatar + text lines + trailing value)
 */
export interface SkeletonListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  showAvatar?: boolean;
  showTrailing?: boolean;
}

export function SkeletonListItem({
  showAvatar = true,
  showTrailing = true,
  className,
  ...props
}: SkeletonListItemProps): JSX.Element {
  return (
    <div
      className={cn('flex items-center gap-3 rounded-lg border border-border p-4', className)}
      {...props}
    >
      {showAvatar && <Skeleton className="h-10 w-10 shrink-0 rounded-full" />}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      {showTrailing && <Skeleton className="h-4 w-16 shrink-0" />}
    </div>
  );
}

/**
 * Skeleton List
 * Placeholder for a vertical list of rows
 */
export interface SkeletonListProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  showAvatar?: boolean;
  showTrailing?: boolean;
}

export function SkeletonList({
  count = 5,
  showAvatar = true,
  showTrailing = true,
  className,
  ...props
}: SkeletonListProps): JSX.Element {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListItem key={i} showAvatar={showAvatar} showTrailing={showTrailing} />
      ))}
    </div>
  );
}

/**
 * Skeleton Table
 * Placeholder for a table with header row and body rows
 */
export interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  cols?: number;
}

export function SkeletonTable({ rows = 5, cols = 4, className, ...props }: SkeletonTableProps): JSX.Element {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      <div className="flex items-center gap-4 border-b border-border pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Text
 */
export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

export function SkeletonText({ lines = 3, ...props }: SkeletonTextProps): JSX.Element {
  return (
    <div className="space-y-2" {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 && 'w-4/5')} />
      ))}
    </div>
  );
}

/**
 * Skeleton Grid
 */
export interface SkeletonGridProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  cols?: number;
}

export function SkeletonGrid({ count = 6, cols = 3, ...props }: SkeletonGridProps): JSX.Element {
  return (
    <div className={`grid grid-cols-${cols} gap-6`} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
