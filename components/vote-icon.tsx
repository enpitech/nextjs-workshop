// The up-arrow icon used by the talk row and the vote button. The caller sets size and color.
export function VoteIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={className}>
      <path d="M10 3.5 3.5 10.6h3.9V16.5h5.2v-5.9h3.9L10 3.5Z" />
    </svg>
  );
}
