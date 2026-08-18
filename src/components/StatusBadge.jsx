const STATUS_CLASS = {
  PENDING: "status-warning",
  CONFIRMED: "status-accent",
  SHIPPED: "status-accent",
  DELIVERED: "status-success",
  CANCELLED: "status-danger",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${STATUS_CLASS[status] || "status-accent"}`}>
      {status}
    </span>
  );
}
