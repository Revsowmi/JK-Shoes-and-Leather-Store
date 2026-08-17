"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import ManageCollections from "../../ManageCollections";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  images?: string[] | null;
  video_url?: string | null;
  description?: string;
  details?: string;
  stock?: number;
  created_at?: string;
};

const inputStyle = {
  width: "100%",
  padding: "13px",
  boxSizing: "border-box" as const,
  border: "1px solid #4e3a1c",
  borderRadius: "7px",
  fontSize: "14px",
  outline: "none",
  background: "#080808",
  color: "#fff",
};

const textareaStyle = {
  width: "100%",
  minHeight: "100px",
  padding: "13px",
  boxSizing: "border-box" as const,
  border: "1px solid #4e3a1c",
  borderRadius: "7px",
  fontSize: "14px",
  outline: "none",
  background: "#080808",
  color: "#fff",
  resize: "vertical" as const,
};

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState("");
  const [stock, setStock] = useState("1");

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem("jkAdminLoggedIn");

    if (loggedIn !== "true") {
      window.location.replace("/admin");
      return;
    }

    setAuthorized(true);
  }, []);

  useEffect(() => {
    if (!authorized) return;

    loadProducts();
  }, [authorized]);

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase load error:", error);
      alert("Unable to load products from Supabase.\n\n" + error.message);
      setProducts([]);
    } else {
      setProducts((data || []) as Product[]);
    }

    setLoading(false);
  }

  function handleImagesChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const oversized = files.find(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (oversized) {
      alert(
        `Image "${oversized.name}" is larger than 5MB. Please choose smaller images.`
      );
      e.target.value = "";
      return;
    }

    setSelectedImages(files);

    const previews = files.map((file) => URL.createObjectURL(file));

    setImages(previews);
    setImage(previews[0] || "");
  }

  function handleVideoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please select a valid video file.");
      e.target.value = "";
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("Please select a video below 50MB.");
      e.target.value = "";
      return;
    }

    setSelectedVideo(file);
    setVideoUrl(URL.createObjectURL(file));
  }

  async function uploadImages(files: File[]) {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const extension = file.name.split(".").pop() || "jpg";

      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${extension}`;

      const filePath = `products/${fileName}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw new Error(`Image upload failed: ${error.message}`);
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  }

  async function uploadVideo(file: File) {
    const extension = file.name.split(".").pop() || "mp4";

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${extension}`;

    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from("product-videos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Video upload failed: ${error.message}`);
    }

    const { data } = supabase.storage
      .from("product-videos")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setPrice("");
    setCategory("");
    setImage("");
    setImages([]);
    setVideoUrl("");
    setDescription("");
    setDetails("");
    setStock("1");
    setSelectedImages([]);
    setSelectedVideo(null);
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setCategory(product.category);

    setImage(product.image);

    const existingImages =
      product.images && product.images.length > 0
        ? product.images
        : product.image
        ? [product.image]
        : [];

    setImages(existingImages);
    setVideoUrl(product.video_url || "");

    setDescription(product.description || "");
    setDetails(product.details || "");
    setStock(String(product.stock ?? 1));

    setSelectedImages([]);
    setSelectedVideo(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveProduct() {
    if (!name.trim() || !price.trim() || !category.trim()) {
      alert("Please fill Product Name, Price and Category.");
      return;
    }

    if (editingId === null && selectedImages.length === 0) {
      alert("Please select at least one product image.");
      return;
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      alert("Please enter a valid price.");
      return;
    }

    if (Number.isNaN(numericStock) || numericStock < 0) {
      alert("Please enter a valid stock quantity.");
      return;
    }

    setSaving(true);

    try {
      let finalImages = images;
      let finalImage = image;
      let finalVideoUrl = videoUrl;

      // Upload newly selected images
      if (selectedImages.length > 0) {
        const uploadedImages = await uploadImages(selectedImages);

        finalImages =
          editingId !== null
            ? [...images.filter((img) => !img.startsWith("blob:")), ...uploadedImages]
            : uploadedImages;

        finalImage = finalImages[0] || "";
      }

      // Upload newly selected video
      if (selectedVideo) {
        finalVideoUrl = await uploadVideo(selectedVideo);
      }

      if (!finalImage) {
        alert("Please select at least one product image.");
        setSaving(false);
        return;
      }

      const productData = {
        name: name.trim(),
        price: numericPrice,
        category: category.trim(),
        image: finalImage,
        images: finalImages,
        video_url: finalVideoUrl || null,
        description:
          description.trim() ||
          "Premium product from JK Shoes & Leathers.",
        details:
          details.trim() ||
          "Specifications will be updated by JK Shoes.",
        stock: numericStock,
      };

      if (editingId === null) {
        const { data, error } = await supabase
          .from("products")
          .insert([productData])
          .select()
          .single();

        if (error) {
          console.error("Supabase insert error:", error);
          alert("Product could not be added.\n\n" + error.message);
          setSaving(false);
          return;
        }

        if (data) {
          setProducts((current) => [data as Product, ...current]);
        }

        alert("Product added successfully!");
      } else {
        const { data, error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingId)
          .select()
          .single();

        if (error) {
          console.error("Supabase update error:", error);
          alert("Product could not be updated.\n\n" + error.message);
          setSaving(false);
          return;
        }

        if (data) {
          setProducts((current) =>
            current.map((p) =>
              p.id === editingId ? (data as Product) : p
            )
          );
        }

        alert("Product updated successfully!");
      }

      resetForm();
    } catch (error) {
      console.error("Upload/save error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading the product."
      );
    }

    setSaving(false);
  }

  async function deleteProduct(id: number) {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this product?"
    );

    if (!confirmDelete) return;

    setDeletingId(id);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      alert("Product could not be deleted.\n\n" + error.message);
      setDeletingId(null);
      return;
    }

    setProducts((current) =>
      current.filter((product) => product.id !== id)
    );

    if (editingId === id) {
      resetForm();
    }

    setDeletingId(null);

    alert("Product deleted successfully!");
  }

  function logout() {
    sessionStorage.removeItem("jkAdminLoggedIn");
    window.location.replace("/admin");
  }

  if (!authorized) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#080808",
          color: "#dcae5d",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Checking admin access...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#fff",
        padding: "30px 20px 60px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div>
          <h1
            style={{
              color: "#dcae5d",
              fontFamily: "Georgia, serif",
              fontSize: "36px",
              marginBottom: "5px",
            }}
          >
            JK Shoes Admin
          </h1>

          <p style={{ color: "#999", fontSize: "13px" }}>
            Manage your products
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={loadProducts}
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid #dcae5d",
              padding: "11px 20px",
              borderRadius: "7px",
              cursor: "pointer",
            }}
          >
            REFRESH
          </button>

          <button
            onClick={logout}
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid #b52b2b",
              padding: "11px 20px",
              borderRadius: "7px",
              cursor: "pointer",
            }}
          >
            LOGOUT
          </button>
        </div>
      </div>

      <ManageCollections />

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              color: "#dcae5d",
              fontFamily: "Georgia, serif",
            }}
          >
            {editingId === null ? "Add New Product" : "Edit Product"}
          </h2>

          {editingId !== null && (
            <button
              onClick={resetForm}
              style={{
                background: "transparent",
                color: "#dcae5d",
                border: "1px solid #dcae5d",
                padding: "8px 16px",
                borderRadius: "7px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              CANCEL EDIT
            </button>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "15px",
          }}
        >
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={inputStyle}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select Category</option>
            <option value="Formal Shoes">Formal Shoes</option>
            <option value="Sandals">Sandals</option>
            <option value="Loafers">Loafers</option>
            <option value="Casual Shoes">Casual Shoes</option>
            <option value="Leather Bags">Leather Bags</option>
            <option value="Backpacks">Backpacks</option>
            <option value="Sports Shoes">Sports Shoes</option>
            <option value="Boots">Boots</option>
          </select>

          <input
            type="number"
            min="0"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* MULTIPLE IMAGES */}
        <div style={{ marginTop: "15px" }}>
          <label
            style={{
              display: "block",
              color: "#dcae5d",
              fontSize: "13px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Product Images
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
            style={{
              ...inputStyle,
              padding: "10px",
            }}
          />

          <p
            style={{
              color: "#888",
              fontSize: "11px",
              marginTop: "7px",
            }}
          >
            Select multiple images. Each image must be below 5MB.
          </p>
        </div>

        {/* VIDEO */}
        <div style={{ marginTop: "15px" }}>
          <label
            style={{
              display: "block",
              color: "#dcae5d",
              fontSize: "13px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Product Video
          </label>

          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            style={{
              ...inputStyle,
              padding: "10px",
            }}
          />

          <p
            style={{
              color: "#888",
              fontSize: "11px",
              marginTop: "7px",
            }}
          >
            Optional. Maximum 50MB.
          </p>
        </div>

        <textarea
          placeholder="Product Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            ...textareaStyle,
            marginTop: "15px",
          }}
        />

        <textarea
          placeholder="Product Details / Specifications"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          style={{
            ...textareaStyle,
            marginTop: "15px",
            minHeight: "130px",
          }}
        />

        <p
          style={{
            color: "#888",
            fontSize: "11px",
            marginTop: "7px",
          }}
        >
          Example: Material: Premium Leather | Color: Brown | Size: 9 | Sole: Rubber
        </p>

        {/* IMAGE PREVIEWS */}
        {images.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <p
              style={{
                color: "#dcae5d",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Image Preview ({images.length})
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              {images.map((img, index) => (
                <div
                  key={`${img}-${index}`}
                  style={{
                    position: "relative",
                  }}
                >
                  <img
                    src={img}
                    alt={`Product preview ${index + 1}`}
                    style={{
                      width: "140px",
                      height: "140px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border:
                        index === 0
                          ? "2px solid #dcae5d"
                          : "1px solid #4e3a1c",
                    }}
                  />

                  {index === 0 && (
                    <span
                      style={{
                        position: "absolute",
                        left: "5px",
                        bottom: "5px",
                        background: "#dcae5d",
                        color: "#111",
                        padding: "4px 7px",
                        borderRadius: "4px",
                        fontSize: "9px",
                        fontWeight: "bold",
                      }}
                    >
                      MAIN
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIDEO PREVIEW */}
        {videoUrl && (
          <div style={{ marginTop: "20px" }}>
            <p
              style={{
                color: "#dcae5d",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Video Preview
            </p>

            <video
              src={videoUrl}
              controls
              style={{
                width: "300px",
                maxWidth: "100%",
                borderRadius: "8px",
                border: "1px solid #dcae5d",
              }}
            />
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <button
            onClick={saveProduct}
            disabled={saving}
            style={{
              background: saving ? "#806b45" : "#dcae5d",
              color: "#111",
              border: "none",
              padding: "14px 25px",
              borderRadius: "7px",
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            {saving
              ? editingId === null
                ? "ADDING PRODUCT..."
                : "UPDATING PRODUCT..."
              : editingId === null
              ? "+ ADD PRODUCT"
              : "✓ UPDATE PRODUCT"}
          </button>

          {editingId !== null && (
            <button
              onClick={resetForm}
              style={{
                background: "transparent",
                color: "#fff",
                border: "1px solid #4e3a1c",
                padding: "14px 25px",
                borderRadius: "7px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              CANCEL
            </button>
          )}
        </div>
      </section>

      {/* CURRENT PRODUCTS */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            color: "#dcae5d",
            fontFamily: "Georgia, serif",
            marginBottom: "20px",
          }}
        >
          Current Products ({products.length})
        </h2>

        {loading ? (
          <div
            style={{
              background: "#100c09",
              border: "1px solid #4e3a1c",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
              color: "#dcae5d",
            }}
          >
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              background: "#100c09",
              border: "1px dashed #4e3a1c",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
              color: "#777",
            }}
          >
            No products added yet.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  background: "#100c09",
                  border:
                    editingId === product.id
                      ? "2px solid #dcae5d"
                      : "1px solid #4e3a1c",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#eee",
                    height: "220px",
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>

                <div style={{ padding: "15px" }}>
                  <h3
                    style={{
                      fontSize: "15px",
                      marginBottom: "8px",
                    }}
                  >
                    {product.name}
                  </h3>

                  <p
                    style={{
                      color: "#dcae5d",
                      fontSize: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    {product.category}
                  </p>

                  <p
                    style={{
                      color: "#fff",
                      fontSize: "20px",
                      fontWeight: "bold",
                      marginBottom: "8px",
                    }}
                  >
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>

                  <p
                    style={{
                      color:
                        (product.stock ?? 0) > 0
                          ? "#7ed957"
                          : "#ff5555",
                      fontSize: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    Stock: {product.stock ?? 0}
                  </p>

                  {product.images &&
                    product.images.length > 1 && (
                      <p
                        style={{
                          color: "#aaa",
                          fontSize: "11px",
                          marginBottom: "10px",
                        }}
                      >
                        🖼️ {product.images.length} images
                      </p>
                    )}

                  {product.video_url && (
                    <p
                      style={{
                        color: "#7ed957",
                        fontSize: "11px",
                        marginBottom: "10px",
                      }}
                    >
                      🎥 Product video available
                    </p>
                  )}

                  <div
                    style={{
                      background: "#080808",
                      border: "1px solid #3e2d18",
                      padding: "12px",
                      marginBottom: "15px",
                      borderRadius: "7px",
                    }}
                  >
                    <p
                      style={{
                        color: "#dcae5d",
                        fontSize: "10px",
                        fontWeight: "bold",
                        marginBottom: "6px",
                      }}
                    >
                      DETAILS
                    </p>

                    <p
                      style={{
                        color: "#aaa",
                        fontSize: "11px",
                        lineHeight: "1.6",
                      }}
                    >
                      {product.details || "Not specified"}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    <button
                      onClick={() => startEdit(product)}
                      style={{
                        flex: 1,
                        background: "transparent",
                        color: "#dcae5d",
                        border: "1px solid #dcae5d",
                        padding: "11px",
                        borderRadius: "7px",
                        cursor: "pointer",
                      }}
                    >
                      ✎ EDIT
                    </button>

                    <button
                      onClick={() => deleteProduct(product.id)}
                      disabled={deletingId === product.id}
                      style={{
                        flex: 1,
                        background:
                          deletingId === product.id
                            ? "#633"
                            : "#b52b2b",
                        color: "#fff",
                        border: "none",
                        padding: "11px",
                        borderRadius: "7px",
                        cursor:
                          deletingId === product.id
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {deletingId === product.id
                        ? "..."
                        : "🗑 DELETE"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}