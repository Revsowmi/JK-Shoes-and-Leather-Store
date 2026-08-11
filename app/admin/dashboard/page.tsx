"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

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

  // null = adding a new product, otherwise = editing this product's id
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState("");
  const [stock, setStock] = useState("1");

  // --- Auth guard: redirect to /admin login if not logged in ---
  useEffect(() => {
    const loggedIn = sessionStorage.getItem("jkAdminLoggedIn");

    if (loggedIn !== "true") {
      window.location.replace("/admin");
      return;
    }

    setAuthorized(true);
  }, []);

  // --- Load products only after auth passes ---
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

  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image below 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setPrice("");
    setCategory("");
    setImage("");
    setDescription("");
    setDetails("");
    setStock("1");
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setCategory(product.category);
    setImage(product.image);
    setDescription(product.description || "");
    setDetails(product.details || "");
    setStock(String(product.stock ?? 1));

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveProduct() {
    if (!name.trim() || !price.trim() || !category.trim() || !image) {
      alert("Please fill Product Name, Price, Category and Image.");
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

    const productData = {
      name: name.trim(),
      price: numericPrice,
      category: category.trim(),
      image,
      description:
        description.trim() || "Premium product from JK Shoes & Leathers.",
      details: details.trim() || "Specifications will be updated by JK Shoes.",
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
          current.map((p) => (p.id === editingId ? (data as Product) : p))
        );
      }

      alert("Product updated successfully!");
    }

    resetForm();
    setSaving(false);
  }

  async function deleteProduct(id: number) {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this product?"
    );

    if (!confirmDelete) return;

    setDeletingId(id);

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      alert("Product could not be deleted.\n\n" + error.message);
      setDeletingId(null);
      return;
    }

    setProducts((current) => current.filter((product) => product.id !== id));

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

  // --- Block dashboard until auth check passes ---
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

          <p style={{ color: "#999", fontSize: "13px" }}>Manage your products</p>
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
          <h2 style={{ color: "#dcae5d", fontFamily: "Georgia, serif" }}>
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
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ ...inputStyle, padding: "10px" }}
          />
        </div>

        <textarea
          placeholder="Product Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...textareaStyle, marginTop: "15px" }}
        />

        <textarea
          placeholder="Product Details / Specifications"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          style={{ ...textareaStyle, marginTop: "15px", minHeight: "130px" }}
        />

        <p style={{ color: "#888", fontSize: "11px", marginTop: "7px" }}>
          Example: Material: Premium Leather | Color: Brown | Size: 9 | Sole: Rubber
        </p>

        {image && (
          <div style={{ marginTop: "20px" }}>
            <p style={{ color: "#dcae5d", fontWeight: "bold", marginBottom: "10px" }}>
              Image Preview
            </p>

            <img
              src={image}
              alt="Product preview"
              style={{
                width: "160px",
                height: "160px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #dcae5d",
              }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
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

      <section style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ color: "#dcae5d", fontFamily: "Georgia, serif", marginBottom: "20px" }}>
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
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
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
                <div style={{ background: "#eee", height: "220px" }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>

                <div style={{ padding: "15px" }}>
                  <h3 style={{ fontSize: "15px", marginBottom: "8px" }}>
                    {product.name}
                  </h3>

                  <p style={{ color: "#dcae5d", fontSize: "12px", marginBottom: "8px" }}>
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
                      color: (product.stock ?? 0) > 0 ? "#7ed957" : "#ff5555",
                      fontSize: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    Stock: {product.stock ?? 0}
                  </p>

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

                    <p style={{ color: "#aaa", fontSize: "11px", lineHeight: "1.6" }}>
                      {product.details || "Not specified"}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
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
                        background: deletingId === product.id ? "#633" : "#b52b2b",
                        color: "#fff",
                        border: "none",
                        padding: "11px",
                        borderRadius: "7px",
                        cursor: deletingId === product.id ? "not-allowed" : "pointer",
                      }}
                    >
                      {deletingId === product.id ? "..." : "🗑 DELETE"}
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
