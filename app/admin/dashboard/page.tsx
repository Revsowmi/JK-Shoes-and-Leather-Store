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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState("");
  const [stock, setStock] = useState("1");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase load error:", error);
      alert(
        "Unable to load products from Supabase.\n\n" +
          error.message
      );
      setProducts([]);
    } else {
      setProducts((data || []) as Product[]);
    }

    setLoading(false);
  }

  function handleImageUpload(
    e: ChangeEvent<HTMLInputElement>
  ) {
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

  async function addProduct() {
    if (
      !name.trim() ||
      !price.trim() ||
      !category.trim() ||
      !image
    ) {
      alert(
        "Please fill Product Name, Price, Category and Image."
      );
      return;
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      alert("Please enter a valid price.");
      return;
    }

    if (
      Number.isNaN(numericStock) ||
      numericStock < 0
    ) {
      alert("Please enter a valid stock quantity.");
      return;
    }

    setAdding(true);

    const product = {
      name: name.trim(),
      price: numericPrice,
      category: category.trim(),
      image,
      description:
        description.trim() ||
        "Premium product from JK Shoes & Leathers.",
      details:
        details.trim() ||
        "Specifications will be updated by JK Shoes.",
      stock: numericStock,
    };

    const { data, error } = await supabase
      .from("products")
      .insert([product])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);

      alert(
        "Product could not be added.\n\n" +
          error.message
      );

      setAdding(false);
      return;
    }

    if (data) {
      setProducts((current) => [
        data as Product,
        ...current,
      ]);
    }

    setName("");
    setPrice("");
    setCategory("");
    setImage("");
    setDescription("");
    setDetails("");
    setStock("1");

    setAdding(false);

    alert("Product added successfully!");
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

      alert(
        "Product could not be deleted.\n\n" +
          error.message
      );

      setDeletingId(null);
      return;
    }

    setProducts((current) =>
      current.filter((product) => product.id !== id)
    );

    setDeletingId(null);

    alert("Product deleted successfully!");
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

          <p
            style={{
              color: "#999",
              fontSize: "13px",
            }}
          >
            Manage your products
          </p>
        </div>

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
        <h2
          style={{
            color: "#dcae5d",
            fontFamily: "Georgia, serif",
            marginBottom: "20px",
          }}
        >
          Add New Product
        </h2>

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

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{
              ...inputStyle,
              padding: "10px",
            }}
          />
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
          Example: Material: Premium Leather | Color: Brown |
          Size: 9 | Sole: Rubber
        </p>

        {image && (
          <div style={{ marginTop: "20px" }}>
            <p
              style={{
                color: "#dcae5d",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
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

        <button
          onClick={addProduct}
          disabled={adding}
          style={{
            marginTop: "20px",
            background: adding ? "#806b45" : "#dcae5d",
            color: "#111",
            border: "none",
            padding: "14px 25px",
            borderRadius: "7px",
            cursor: adding ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {adding
            ? "ADDING PRODUCT..."
            : "+ ADD PRODUCT"}
        </button>
      </section>

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
                  border: "1px solid #4e3a1c",
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
                    ₹
                    {product.price.toLocaleString("en-IN")}
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

                  <button
                    onClick={() =>
                      deleteProduct(product.id)
                    }
                    disabled={deletingId === product.id}
                    style={{
                      width: "100%",
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
                      ? "DELETING..."
                      : "🗑 DELETE PRODUCT"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}