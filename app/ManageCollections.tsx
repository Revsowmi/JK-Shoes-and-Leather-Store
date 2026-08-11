"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Collection = {
  id: number;
  name: string;
  image: string;
  sort_order: number;
};

export default function ManageCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    loadCollections();
  }, []);

  async function loadCollections() {
    setLoading(true);

    const { data, error } = await supabase
      .from("collections")
      .select("id, name, image, sort_order")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error loading collections:", error);
      alert("Unable to load collections.\n\n" + error.message);
    } else {
      setCollections((data || []) as Collection[]);
    }

    setLoading(false);
  }

  function triggerFilePicker(collectionId: number) {
    fileInputRefs.current[collectionId]?.click();
  }

  async function handleImageChange(
    e: ChangeEvent<HTMLInputElement>,
    collection: Collection
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image below 5MB.");
      return;
    }

    setUploadingId(collection.id);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${collection.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("collection-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("collection-images")
        .getPublicUrl(filePath);

      const newImageUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from("collections")
        .update({ image: newImageUrl })
        .eq("id", collection.id);

      if (updateError) throw updateError;

      setCollections((prev) =>
        prev.map((c) =>
          c.id === collection.id ? { ...c, image: newImageUrl } : c
        )
      );

      alert("Collection image updated!");
    } catch (err: any) {
      console.error("Image upload failed:", err);
      alert("Image upload failed.\n\n" + (err?.message || ""));
    } finally {
      setUploadingId(null);
      if (fileInputRefs.current[collection.id]) {
        fileInputRefs.current[collection.id]!.value = "";
      }
    }
  }

  return (
    <section
      style={{
        maxWidth: "1100px",
        margin: "0 auto 40px",
        background: "#100c09",
        border: "1px solid #4e3a1c",
        padding: "25px",
        borderRadius: "12px",
      }}
    >
      <h2
        style={{
          color: "#dcae5d",
          fontFamily: "Georgia, serif",
          marginBottom: "20px",
        }}
      >
        Manage Collections
      </h2>

      {loading ? (
        <p style={{ color: "#dcae5d" }}>Loading collections...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "18px",
          }}
        >
          {collections.map((collection) => (
            <div
              key={collection.id}
              style={{
                background: "#080808",
                border: "1px solid #3e2d18",
                borderRadius: "10px",
                overflow: "hidden",
                textAlign: "center",
                paddingBottom: "14px",
              }}
            >
              <div style={{ background: "#eee", height: "140px" }}>
                <img
                  src={collection.image}
                  alt={collection.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              <p
                style={{
                  color: "#fff",
                  fontSize: "14px",
                  margin: "12px 0 10px",
                }}
              >
                {collection.name}
              </p>

              <button
                onClick={() => triggerFilePicker(collection.id)}
                disabled={uploadingId === collection.id}
                style={{
                  background:
                    uploadingId === collection.id ? "#806b45" : "#dcae5d",
                  color: "#111",
                  border: "none",
                  padding: "9px 16px",
                  borderRadius: "6px",
                  cursor:
                    uploadingId === collection.id ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {uploadingId === collection.id
                  ? "UPLOADING..."
                  : "CHANGE IMAGE"}
              </button>

              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={(el) => {
                  fileInputRefs.current[collection.id] = el;
                }}
                onChange={(e) => handleImageChange(e, collection)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
