"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function PlayerManager({ conventionId, characters, onChange }) {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="space-y-4">
        <div>
          Character
        </div>
      {characters.length === 0 ? (
        <p className="text-sm text-parchment/50">No players yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {characters.map((c) => (
            <li key={c.id} className="card-shell relative p-3">
              <div className="mb-2 aspect-square overflow-hidden rounded-sm bg-parchment/10">
                {c.image_url ? (
                  <Image
                    src={c.image_url}
                    alt={c.name}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-mono text-[10px] text-parchment/30">
                    No image
                  </div>
                )}
              </div>
              <p className="truncate text-sm font-medium">{c.name}</p>
              <button
                onClick={() => handleDelete(c.id)}
                className="mt-2 font-mono text-[10px] uppercase tracking-wide text-flare/80 hover:text-flare"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
