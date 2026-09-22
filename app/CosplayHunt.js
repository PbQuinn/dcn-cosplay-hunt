"use client";

// import { cookies } from "next/headers";
import { useState, useEffect } from "react";
import { createPlayer } from "@/app/actions/player";
import Link from 'next/link'

export default function CosplayHunt({ convention, hunter }) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    contact: "",
    character: "",
    series: "",
    description: "",
    invisible: false,
    photo: null,
  });

  const formattedDate = new Date(convention.start_date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const startTime = new Date(convention.start_date).toLocaleTimeString("en-GB", {
    timeZone: "Europe/Amsterdam",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTime = new Date(convention.end_date).toLocaleTimeString("en-GB", {
    timeZone: "Europe/Amsterdam",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  function updateForm(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handlePhotoChange(e) {
    updateForm("photo", e.target.files?.[0] ?? null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!form.invisible && !form.photo) {
      setError("Please upload a photo, or mark yourself as invisible.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("contact", form.contact);
      formData.append("description", form.description);
      formData.append("invisible", String(form.invisible));

      if (!form.invisible) {
        formData.append("character", form.character);
        formData.append("series", form.series);
        formData.append("photo", form.photo);
      }

      await createPlayer(convention.id, formData);
    } catch (err) {
      setError(err.message ?? "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
        {/* Convention logo / banner background */}
        <div className="absolute inset-0">
          {/* Replace this with your convention logo/banner */}
          <div className="flex h-full w-full items-center justify-center bg-parchment/5">
            <div className="text-center opacity-30">
              <img
                src={convention.logo_url}
                style={{
                  display: 'block',
                  margin: 'auto',
                  width: '80%',
                  height: 'auto',
                }}
              />
            </div>
          </div>

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p className="eyebrow mb-4">
            {convention.name}{convention.theme && `: ${convention.theme}`}
          </p>
          {<p className="eyebrow mb-4 text-white">
            {formattedDate} {startTime} - {endTime}
          </p>}
          {<p className="eyebrow mb-4 text-white">
            {convention.venue}
          </p>}

          <h1 className="font-display text-6xl font-bold tracking-tight sm:text-8xl">
            Cosplay Hunt
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-parchment/70 sm:text-xl">
            Find the characters. Meet the cosplayers. Complete the hunt.
          </p>

          {!!!hunter && <button
            type="button"
            className="btn-primary mt-10 px-8 py-4 text-lg"
            onClick={() => setShowModal(true)}
          >
            Join The Game
          </button>}
          {!!hunter && <div style={{ display: "flex flex-col items-center" }}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-parchment/70 sm:text-xl">
              Welcome back, {hunter.name}
            </p>

            <a href={`c/${convention.id}/player/${hunter.app_uid}`}><button
              type="link"
              className="btn-primary mt-10 px-8 py-4 text-lg"
            >
              Go to my targets
            </button></a></div>}
        </div>
      </section>

      {/* Convention description */}
      <section className="mx-auto max-w-4xl px-6 py-8">
        <div className="card-shell">
          <p className="eyebrow mb-3">The Game</p>

          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Welcome to the Cosplay Hunt!
          </h2>

          <div className="mt-6 space-y-4 text-parchment/70">
            <p>
              Today you are going on a quest to find as many cosplayers as possible at {convention.name}.
            </p>

            <p>
              Sign up and jump into the world where you are a Hunter. You will have to look for other cosplayers
              who are playing the game and exchange your personal codes to score points.
            </p>

            <p>
              Show off your cosplay, make new friends and have a wonderful time at the convention!
            </p>
          </div>
        </div>
      </section>

      {/* Dynamo Cosplay Nexus information */}
      <section className="mx-auto max-w-4xl px-6 py-2">
        <div className="card-shell">
          <p className="eyebrow mb-3">Who are we?</p>

          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Dynamo Cosplay Nexus
          </h2>

          <img
            src={'https://hyzullnybsghptluvbrw.supabase.co/storage/v1/object/public/dcn-branding/dcn_logo_sticker.png'}
            style={{
              display: 'block',
              margin: 'auto',
              width: '80%',
              height: 'auto',
            }}
          />

          <div className="mt-6 space-y-4 text-parchment/70">
            <p>
              The Dynamo Cosplay Nexus is a cosplay community run by volunteers in collaboration with Dynamo Eindhoven.
              We host monthly cosplay(-related) activities with the goal of creating a safe space where cosplayers can connect
              through the many things that the cosplay hobby has to offer.
            </p>

            <div className="flex justify-center gap-6 pt-4">
              {/* Instagram */}
              <Link href="https://www.instagram.com/dynamocosplaynexus/" className="relative flex-1 aspect-square">
                <img
                  src="https://hyzullnybsghptluvbrw.supabase.co/storage/v1/object/public/socials-icons/instagram.png"
                  alt="Follow us on Instagram!"
                  fill
                  className="object-cover rounded-lg hover:opacity-80 transition-opacity"
                  style={{
                    display: 'block',
                    margin: 'auto',
                    width: '70%',
                    height: 'auto',
                  }}
                />
              </Link>

              {/* Discord */}
              <Link href="https://discord.gg/NTJjw5C6Ed" className="relative flex-1 aspect-square">
                <img
                  src="https://hyzullnybsghptluvbrw.supabase.co/storage/v1/object/public/socials-icons/discord.png"
                  alt="Join our Discord server!"
                  fill
                  className="object-cover rounded-lg hover:opacity-80 transition-opacity"
                  style={{
                    display: 'block',
                    margin: 'auto',
                    width: '70%',
                    height: 'auto',
                  }}
                />
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Submission modal */}
      {
        showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
              }
            }}
          >
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-black p-6 shadow-2xl sm:p-8">
              {/* Close button */}
              <button
                type="button"
                className="absolute right-5 top-5 text-2xl text-parchment/50 transition hover:text-parchment"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                ×
              </button>

              <div className="mb-8 pr-8">
                <p className="eyebrow mb-2">Join the game</p>
                <h2 className="font-display text-3xl font-bold">
                  Create your character
                </h2>
                <p className="mt-2 text-sm text-parchment/50">
                  Enter your cosplay details so other hunters can find you.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    className="eyebrow mb-2 block"
                    htmlFor="participant-name"
                  >
                    Name
                  </label>

                  <input
                    id="participant-name"
                    className="field-input"
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    required
                  />
                </div>

                {/* Contact */}
                <div>
                  <label
                    className="eyebrow mb-2 block"
                    htmlFor="participant-contact"
                  >
                    Contact
                  </label>

                  <input
                    id="participant-contact"
                    className="field-input"
                    type="text"
                    placeholder="Email, Discord, Instagram, etc."
                    value={form.contact}
                    onChange={(e) => updateForm("contact", e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    className="eyebrow mb-2 block"
                    htmlFor="description"
                  >
                    Description
                  </label>

                  <textarea
                    id="description"
                    className="field-input"
                    rows={4}
                    placeholder="Anything else you'd like hunters to know..."
                    value={form.description}
                    onChange={(e) =>
                      updateForm("description", e.target.value)
                    }
                  />
                </div>

                {/* Invisible */}
                <div className="rounded-lg border border-parchment/10 p-4">
                  <label
                    htmlFor="invisible"
                    className="flex cursor-pointer items-start gap-3"
                  >
                    <input
                      id="invisible"
                      type="checkbox"
                      checked={form.invisible}
                      onChange={(e) =>
                        updateForm("invisible", e.target.checked)
                      }
                      className="mt-1 h-4 w-4"
                    />

                    <span>
                      <span className="block font-bold">
                        Invisible
                      </span>

                      <span className="mt-1 block text-sm text-parchment/50">
                        Hide my cosplay from the public hunt. If unchecked,
                        you must provide a photo.
                      </span>
                    </span>
                  </label>
                </div>

                {/* Character / Series */}
                {!form.invisible && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        className="eyebrow mb-2 block"
                        htmlFor="character"
                      >
                        Character
                      </label>

                      <input
                        id="character"
                        className="field-input"
                        type="text"
                        placeholder="Character name"
                        value={form.character}
                        onChange={(e) =>
                          updateForm("character", e.target.value)
                        }
                        required={!form.invisible}
                      />
                    </div>

                    <div>
                      <label
                        className="eyebrow mb-2 block"
                        htmlFor="series"
                      >
                        Series
                      </label>

                      <input
                        id="series"
                        className="field-input"
                        type="text"
                        placeholder="Anime, game, movie, etc."
                        value={form.series}
                        onChange={(e) =>
                          updateForm("series", e.target.value)
                        }
                        required={!form.invisible}
                      />
                    </div>
                  </div>
                )}

                {/* Photo */}
                {!form.invisible && (
                  <div>
                    <label
                      className="eyebrow mb-2 block"
                      htmlFor="photo"
                    >
                      Upload Photo
                    </label>

                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      required={!form.invisible}
                      className="block w-full rounded-lg border border-parchment/10 bg-parchment/5 p-3 text-sm text-parchment/70 file:mr-4 file:rounded-md file:border-0 file:bg-parchment/10 file:px-4 file:py-2 file:text-sm file:text-parchment"
                    />

                    <p className="mt-2 text-xs text-parchment/40">
                      This photo will be shown to other players hunting for
                      your character.
                    </p>
                  </div>
                )}

                {error && (
                  <p className="text-sm text-flare">
                    {error}
                  </p>
                )}

                {/* Submit */}
                <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Joining…" : "Join The Game"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </main >
  );
}