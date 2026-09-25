export function ExecutiveAvatar({
  size,
  label,
}: {
  size: number;
  label: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      style={{ display: "block" }}
    >
      <circle cx="20" cy="20" r="20" fill="#F97316" />
      <circle cx="20" cy="15.5" r="6.5" fill="#FFF7ED" opacity="0.92" />
      <path
        d="M6.5 35.5c1-9.5 7-14 13.5-14s12.5 4.5 13.5 14"
        fill="#FFF7ED"
        opacity="0.92"
      />
    </svg>
  );
}
