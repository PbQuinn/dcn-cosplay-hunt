export function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2">
      <dt className="font-body text-[13px] text-parchment/55">{label}</dt>
      <dd className="font-mono text-[13px] text-parchment">{value}</dd>
    </div>
  );
}