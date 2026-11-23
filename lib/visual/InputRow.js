export function InputRow({ label, value, name, placeholder, type = "text", required = false }) {
  return (
    <div className="contents">
      <dt className="flex items-center border-b border-parchment/10 py-2 pr-4 text-left font-body text-[13px] text-parchment/55 last-of-type:border-b-0">
        {label}
      </dt>
      <dd className="min-w-0 border-b border-parchment/10 py-2 font-mono text-[13px] text-parchment last-of-type:border-b-0">
        <input
          name={name}
          className="field-input w-full text-right [&::-webkit-datetime-edit]:text-right"
          type={type}
          placeholder={placeholder}
          defaultValue={value}
          required={required}
        />
      </dd>
    </div>
  );
}