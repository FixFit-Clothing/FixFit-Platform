"use client";

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  allowsMultipleOptions,
  garmentTags,
  garments,
  issueCategory,
  loadGuides,
  tiers,
  type GuideMap,
  type IssueCategory,
  type ServiceTier,
} from "@/lib/estimator-data";
import { calculateEstimate } from "@/lib/estimator-pricing";
import { processGarmentPhoto, type GarmentPhoto } from "@/lib/estimator-photo";

type SelectedIssue = {
  category: IssueCategory;
  issue: string;
  options: string[];
};

type EstimatorCartItem = {
  id: string;
  garment: string;
  issues: SelectedIssue[];
  tier: ServiceTier;
  rush: boolean;
  photo: GarmentPhoto;
};

type EstimatorProps = {
  initialGarment?: string;
  initialIssue?: string;
  initialCategory?: string;
  initialTier?: string;
};

const isTier = (value?: string): value is ServiceTier =>
  value === "spot" || value === "quick" || value === "schedule";

function issueLabel(item: EstimatorCartItem) {
  return item.issues
    .map((issue) =>
      issue.options.length
        ? `${issue.issue} → ${issue.options.join(", ")}`
        : issue.issue
    )
    .join(" · ");
}

export function Estimator({
  initialGarment,
  initialIssue,
  initialCategory,
  initialTier,
}: EstimatorProps) {
  const [guides, setGuides] = useState<GuideMap>({});
  const [step, setStep] = useState(1);
  const [garment, setGarment] = useState(
    initialGarment && garments.includes(initialGarment) ? initialGarment : ""
  );
  const [category, setCategory] = useState<IssueCategory>(
    initialCategory === "replacement" || initialCategory === "enhancement"
      ? initialCategory
      : "alteration"
  );
  const [alterationIssue, setAlterationIssue] = useState(
    initialCategory === "alteration" ? (initialIssue ?? "") : ""
  );
  const [selectedGuideIssue, setSelectedGuideIssue] = useState(
    initialIssue ?? ""
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [issueBasket, setIssueBasket] = useState<SelectedIssue[]>([]);
  const [tier, setTier] = useState<ServiceTier>(
    isTier(initialTier) ? initialTier : "quick"
  );
  const [cart, setCart] = useState<EstimatorCartItem[]>([]);
  const [photo, setPhoto] = useState<GarmentPhoto | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Card">("UPI");
  const [error, setError] = useState("");
  const [coverageMessage, setCoverageMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    loadGuides()
      .then(setGuides)
      .catch(() => setError("Could not load fix options."));
  }, []);

  const guideRows = useMemo(() => {
    const rows = guides[garment] ?? [];
    return rows.filter(([issue, options]) => {
      const matchesSearch = `${issue} ${options.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesSearch && issueCategory(issue) === category;
    });
  }, [category, garment, guides, query]);

  const selectedGuide = (guides[garment] ?? []).find(
    ([issue]) => issue === selectedGuideIssue
  );
  const currentIssues: SelectedIssue[] =
    category === "alteration"
      ? alterationIssue
        ? [{ category: "alteration", issue: alterationIssue, options: [] }]
        : []
      : issueBasket;
  const estimate = calculateEstimate(cart);

  function chooseGarment(nextGarment: string) {
    setGarment(nextGarment);
    setAlterationIssue("");
    setSelectedGuideIssue("");
    setSelectedOptions([]);
    setIssueBasket([]);
    setQuery("");
    setPhoto(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
    setError("");
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setPhoto(await processGarmentPhoto(file));
      setError("");
    } catch (photoError) {
      setError(
        photoError instanceof Error
          ? photoError.message
          : "We could not prepare that photo. Please try another image."
      );
    } finally {
      event.target.value = "";
    }
  }

  function removePhoto() {
    setPhoto(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
    setError("");
  }

  function addGuideIssue() {
    if (!selectedGuide || selectedOptions.length === 0) {
      setError("Choose at least one option before adding this fix.");
      return;
    }
    const [issue] = selectedGuide;
    setIssueBasket((items) => [
      ...items.filter((item) => item.issue !== issue),
      { category: issueCategory(issue), issue, options: selectedOptions },
    ]);
    setSelectedGuideIssue("");
    setSelectedOptions([]);
    setError("");
  }

  function continueToReview() {
    if (!photo) {
      setError("Add a garment photo before continuing.");
      return;
    }
    if (!currentIssues.length) {
      setError("Choose a problem before continuing.");
      return;
    }
    setCart((items) => [
      ...items,
      {
        id: crypto.randomUUID(),
        garment: garment || "Other garment",
        issues: currentIssues,
        tier,
        rush: false,
        photo,
      },
    ]);
    setError("");
    setStep(3);
  }

  function addAnotherGarment() {
    setGarment("");
    setAlterationIssue("");
    setSelectedGuideIssue("");
    setSelectedOptions([]);
    setIssueBasket([]);
    setQuery("");
    setTier("quick");
    setPhoto(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
    setStep(1);
  }

  function completeDemoBooking() {
    if (!cart.length) {
      setError("Add at least one garment to your visit.");
      return;
    }
    if (!address.trim()) {
      setError("Enter your pickup address to continue.");
      return;
    }
    setError("");
    setConfirmed(true);
  }

  function startFreshDraft() {
    setCart([]);
    setGarment("");
    setAlterationIssue("");
    setIssueBasket([]);
    setPhoto(null);
    setAddress("");
    setLandmark("");
    setConfirmed(false);
    setStep(1);
  }

  if (confirmed) {
    return (
      <main className="estimator-page">
        <section className="site-wrap estimator-shell">
          <div className="estimator-confirmation">
            <p className="section-eyebrow">Demo booking preview</p>
            <h1 className="section-title">Your draft is ready to review.</h1>
            <p>
              This frontend preview has not created a booking, processed a
              payment, assigned an executive, or generated live tracking.
            </p>
            <p>
              Draft reference: <strong>DEMO-{cart.length}GARMENT</strong> ·{" "}
              {address}
              {landmark ? ` · ${landmark}` : ""}
            </p>
            <button
              className="estimator-primary"
              onClick={startFreshDraft}
              type="button"
            >
              Start a fresh draft
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="estimator-page">
      <section
        className="site-wrap estimator-shell"
        aria-labelledby="estimator-title"
      >
        <header className="section-head estimator-header">
          <p className="section-eyebrow">Two taps to your tier</p>
          <h1 className="section-title" id="estimator-title">
            What needs fixing?
          </h1>
        </header>
        <div className="estimator-coverage">
          <span>📍 Currently serving HSR Layout, Sectors 1–7, Bengaluru</span>
          <button
            type="button"
            onClick={() =>
              setCoverageMessage(
                "Frontend-only coverage check: bookings are currently available in HSR Layout Sectors 1–7."
              )
            }
          >
            Check if we cover your area
          </button>
        </div>
        {coverageMessage && <p className="estimator-note">{coverageMessage}</p>}
        <div className="estimator-progress" aria-label={`Step ${step} of 3`}>
          {["Garment", "Problem", "Review & book"].map((label, index) => (
            <button
              key={label}
              className={step === index + 1 ? "active" : ""}
              disabled={index + 1 > step}
              onClick={() => setStep(index + 1)}
              type="button"
            >
              <span>{index + 1}</span>
              {label}
            </button>
          ))}
        </div>

        {step === 1 && (
          <section className="estimator-panel">
            <p className="estimator-stage">1 of 3 · What needs fixing?</p>
            <div className="estimator-chips">
              {garments.map((item) => (
                <button
                  className={garment === item ? "selected" : ""}
                  key={item}
                  onClick={() => chooseGarment(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
              <button
                className={garment === "Other" ? "selected" : ""}
                onClick={() => chooseGarment("Other")}
                type="button"
              >
                Other
              </button>
            </div>
            {garment && (
              <div className="estimator-photo-box">
                <p>
                  Add a photo of your {garment.toLowerCase()} <strong>*</strong>
                </p>
                {photo ? (
                  <div className="estimator-photo-preview">
                    {/* Client-generated data URLs are not a Next image optimization target. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={`Photo of the selected ${garment}`}
                      src={photo.previewUrl}
                    />
                    <div>
                      <strong>Photo added ✓</strong>
                      <span>
                        This helps us confirm your quote before pickup.
                      </span>
                      <div>
                        <label htmlFor="garment-photo">Replace photo</label>
                        <button onClick={removePhoto} type="button">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label
                    className="estimator-photo-drop"
                    htmlFor="garment-photo"
                  >
                    <span aria-hidden="true">▣</span>
                    <strong>Tap to take or upload a photo</strong>
                    <small>
                      Show the whole garment and the area that needs fixing.
                      Camera or gallery both work.
                    </small>
                  </label>
                )}
                <input
                  accept="image/*"
                  capture="environment"
                  id="garment-photo"
                  onChange={handlePhotoChange}
                  ref={photoInputRef}
                  type="file"
                />
              </div>
            )}
            {error && (
              <p className="estimator-error" role="alert">
                {error}
              </p>
            )}
            <div className="estimator-actions">
              <span>Choose a garment and add one photo to continue.</span>
              <button
                className="estimator-primary"
                disabled={!garment || !photo}
                onClick={() => setStep(2)}
                type="button"
              >
                Continue →
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="estimator-panel">
            <p className="estimator-stage">2 of 3 · Problem type — {garment}</p>
            <div className="estimator-tabs">
              {(["alteration", "replacement", "enhancement"] as const).map(
                (item) => (
                  <button
                    className={category === item ? "active" : ""}
                    key={item}
                    onClick={() => {
                      setCategory(item);
                      setSelectedGuideIssue("");
                      setSelectedOptions([]);
                      setError("");
                    }}
                    type="button"
                  >
                    {item}
                  </button>
                )
              )}
            </div>
            {category === "alteration" ? (
              <div className="estimator-chips">
                {(garmentTags[garment] ?? ["Describe at booking"]).map(
                  (item) => (
                    <button
                      className={alterationIssue === item ? "selected" : ""}
                      key={item}
                      onClick={() => {
                        setAlterationIssue(item);
                        setError("");
                      }}
                      type="button"
                    >
                      {item}
                    </button>
                  )
                )}
                <button
                  className={alterationIssue === "Other" ? "selected" : ""}
                  onClick={() => setAlterationIssue("Other")}
                  type="button"
                >
                  Other
                </button>
              </div>
            ) : (
              <>
                <label className="estimator-search">
                  Search issues
                  <input
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="e.g. zip, lining, border"
                    value={query}
                  />
                </label>
                {!Object.keys(guides).length ? (
                  <p className="estimator-note">Loading reference options…</p>
                ) : (
                  <div className="estimator-chips estimator-issue-list">
                    {guideRows.map(([issue]) => (
                      <button
                        className={
                          selectedGuideIssue === issue ? "selected" : ""
                        }
                        key={issue}
                        onClick={() => {
                          setSelectedGuideIssue(issue);
                          setSelectedOptions([]);
                        }}
                        type="button"
                      >
                        {issue}
                      </button>
                    ))}
                  </div>
                )}
                {selectedGuide && (
                  <div className="estimator-options">
                    <strong>{selectedGuide[0]}</strong>
                    <div className="estimator-chips">
                      {selectedGuide[1].map((option) => (
                        <button
                          className={
                            selectedOptions.includes(option) ? "selected" : ""
                          }
                          key={option}
                          onClick={() =>
                            setSelectedOptions((values) =>
                              allowsMultipleOptions(selectedGuide[0])
                                ? values.includes(option)
                                  ? values.filter((value) => value !== option)
                                  : [...values, option]
                                : [option]
                            )
                          }
                          type="button"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    <button
                      className="estimator-secondary"
                      onClick={addGuideIssue}
                      type="button"
                    >
                      + Add to my request
                    </button>
                  </div>
                )}
                {issueBasket.length > 0 && (
                  <div className="estimator-basket">
                    {issueBasket.map((item) => (
                      <div key={item.issue}>
                        <span>
                          {item.category === "replacement"
                            ? "Replace"
                            : "Enhance"}
                        </span>
                        <p>
                          <strong>{item.issue}</strong>
                          <br />
                          {item.options.join(" · ")}
                        </p>
                        <button
                          aria-label={`Remove ${item.issue}`}
                          onClick={() =>
                            setIssueBasket((items) =>
                              items.filter(
                                (entry) => entry.issue !== item.issue
                              )
                            )
                          }
                          type="button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            <fieldset className="estimator-tiers">
              <legend>Preferred turnaround</legend>
              {(Object.keys(tiers) as ServiceTier[]).map((item) => (
                <label key={item}>
                  <input
                    checked={tier === item}
                    name="tier"
                    onChange={() => setTier(item)}
                    type="radio"
                  />
                  <strong>{tiers[item].label}</strong>
                  <span>
                    {tiers[item].range} · {tiers[item].turnaround}
                  </span>
                </label>
              ))}
            </fieldset>
            {error && (
              <p className="estimator-error" role="alert">
                {error}
              </p>
            )}
            <div className="estimator-actions">
              <button
                className="estimator-secondary"
                onClick={() => setStep(1)}
                type="button"
              >
                ← Back
              </button>
              <button
                className="estimator-primary"
                onClick={continueToReview}
                type="button"
              >
                Review visit →
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="estimator-panel">
            <p className="estimator-stage">3 of 3 · Confirm &amp; book</p>
            <button
              className="estimator-secondary"
              onClick={addAnotherGarment}
              type="button"
            >
              + Add another garment to this visit
            </button>
            <div className="estimator-cart">
              <h2>
                Your visit — {cart.length} garment{cart.length === 1 ? "" : "s"}
              </h2>
              {cart.map((item) => (
                <div className="estimator-cart-item" key={item.id}>
                  {/* Client-generated data URLs are not a Next image optimization target. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`Photo of ${item.garment}`}
                    className="estimator-cart-photo"
                    src={item.photo.previewUrl}
                  />
                  <div>
                    <strong>{item.garment}</strong>
                    <p>{issueLabel(item)}</p>
                    <small>
                      {item.rush && item.tier !== estimate.sharedTier
                        ? `${tiers[item.tier].label} rush selected`
                        : `${tiers[estimate.sharedTier].label} timing`}
                    </small>
                  </div>
                  {item.tier !== estimate.sharedTier && (
                    <label>
                      <input
                        checked={item.rush}
                        onChange={() =>
                          setCart((items) =>
                            items.map((entry) =>
                              entry.id === item.id
                                ? { ...entry, rush: !entry.rush }
                                : entry
                            )
                          )
                        }
                        type="checkbox"
                      />{" "}
                      Rush this garment at {tiers[item.tier].label} · +₹99
                    </label>
                  )}
                  <button
                    aria-label={`Remove ${item.garment}`}
                    onClick={() =>
                      setCart((items) =>
                        items.filter((entry) => entry.id !== item.id)
                      )
                    }
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="estimator-summary">
              <p>
                <span>Shared visit turnaround</span>
                <strong>
                  {tiers[estimate.sharedTier].label} · {estimate.turnaround}
                </strong>
              </p>
              <p>
                <span>Work estimate</span>
                <strong>From ₹{estimate.workFrom}</strong>
              </p>
              <p>
                <span>Booking fee (adjusted against final bill)</span>
                <strong>₹99</strong>
              </p>
              {estimate.rushFee > 0 && (
                <p>
                  <span>Rush upgrades</span>
                  <strong>₹{estimate.rushFee}</strong>
                </p>
              )}
              <p className="total">
                <span>Pay now via {paymentMethod}</span>
                <strong>₹{estimate.payNow}</strong>
              </p>
              <small>
                Exact pricing is confirmed after in-person garment assessment.
                The booking fee covers the whole visit.
              </small>
            </div>
            <label className="estimator-field">
              Pickup address
              <input
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Flat / House No., HSR Layout"
                value={address}
              />
            </label>
            <label className="estimator-field">
              Landmark (optional)
              <input
                onChange={(event) => setLandmark(event.target.value)}
                placeholder="Near HSR Club"
                value={landmark}
              />
            </label>
            <fieldset className="estimator-payment">
              <legend>Paying now</legend>
              {(["UPI", "Card"] as const).map((item) => (
                <label key={item}>
                  <input
                    checked={paymentMethod === item}
                    name="payment"
                    onChange={() => setPaymentMethod(item)}
                    type="radio"
                  />
                  {item}
                </label>
              ))}
            </fieldset>
            {error && (
              <p className="estimator-error" role="alert">
                {error}
              </p>
            )}
            <div className="estimator-actions">
              <button
                className="estimator-secondary"
                onClick={() => setStep(2)}
                type="button"
              >
                ← Back, edit problem
              </button>
              <button
                className="estimator-primary"
                onClick={completeDemoBooking}
                type="button"
              >
                Preview booking — ₹{estimate.payNow} →
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
