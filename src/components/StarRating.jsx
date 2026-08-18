const STAR = "★";

export default function StarRating({ value = 0, count, onChange }) {
  const interactive = typeof onChange === "function";
  const stars = [1, 2, 3, 4, 5];

  return (
    <span className={`star-rating ${interactive ? "star-rating-interactive" : ""}`}>
      {stars.map((n) => (
        <span
          key={n}
          className={`star ${n <= Math.round(value) ? "star-filled" : ""}`}
          onClick={interactive ? () => onChange(n) : undefined}
        >
          {STAR}
        </span>
      ))}
      {typeof count === "number" && (
        <span className="star-rating-count">
          {value > 0 ? value.toFixed(1) : "No ratings"}
          {count > 0 ? ` (${count})` : ""}
        </span>
      )}
    </span>
  );
}
