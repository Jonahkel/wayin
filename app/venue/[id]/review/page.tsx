"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { addReview } from "@/lib/temp-review-store"; // temp for peer review

export default function AddReviewPage() {
  const router = useRouter();
  const params = useParams();
  const venueId = params.id as string;

  const [rating, setRating] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const [tags, setTags] = useState<Record<string, "happy" | "neutral" | "sad" | null>>({
    "Wheelchair Access": null,
    "Menu Readability": null,
    "Service Animal Access": null,
    "Noise Levels": null,
    "Charging Ports": null,
    "Seating Availability": null,
    "Parking": null,
    "Lighting": null,
    "Private Spaces": null,
    "Fragrances/Scents": null,
    "Restroom": null,
    "Reading Necessary": null,
    "Terrain/Flooring": null
  });

  const handleTagChange = (tag: string, value: "happy" | "neutral" | "sad") => {
    setTags((prev) => ({
      ...prev,
      [tag]: value,
    }));
  };

  const handleSubmit = () => {
    if (!rating && !text.trim()) {
      alert("Please provide at least a rating or review text.");
      return;
    }

    const newReview = {
      id: Date.now(), // quick unique id
      locationId: venueId,
      title,
      rating,
      comment: text,
      tags,
    };

    addReview(newReview);

    router.replace(`/venue/${venueId}`);
  };

  return (
    <main className="mx-auto max-w-2xl p-8 space-y-6">
      <h1 className="text-3xl font-bold">Add Review</h1>

      {/* ⭐ Rating */}
      <div>
        <p className="font-semibold mb-2">Rating</p>
        <div className="flex gap-2">
          {[1,2,3,4,5].map((num) => (
            <button
              key={num}
              onClick={() => setRating(num)}
              className="text-2xl"
            >
              {rating && num <= rating ? "⭐" : "☆"}
            </button>
          ))}
        </div>
      </div>

      {/* 🏷️ Tags */}
      <div>
        <p className="font-semibold mb-2">Tags</p>

        {Object.keys(tags).map((tag) => {
          const value = tags[tag];

          const color =
            value === "happy"
              ? "bg-blue-200"
              : value === "neutral"
              ? "bg-yellow-200"
              : value === "sad"
              ? "bg-red-200"
              : "bg-gray-100";

          return (
            <div key={tag} className={`flex items-center justify-between p-2 rounded mb-2 ${color}`}>
              <span>{tag}</span>

              <div className="flex gap-2">
                <button onClick={() => handleTagChange(tag, "happy")}>😊</button>
                <button onClick={() => handleTagChange(tag, "neutral")}>😐</button>
                <button onClick={() => handleTagChange(tag, "sad")}>😞</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 📝 Title */}
      <div>
        <label className="block font-semibold mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border p-2"
          placeholder="Short summary..."
        />
      </div>

      {/* 💬 Review Text */}
      <div>
        <label className="block font-semibold mb-1">Review</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded border p-2 h-32"
          placeholder="Write your experience..."
        />
      </div>

      {/* 🚀 Submit */}
      <button
        onClick={handleSubmit}
        className="w-full rounded bg-slate-900 py-2 text-white hover:bg-slate-700"
      >
        Submit Review
      </button>
    </main>
  );
}