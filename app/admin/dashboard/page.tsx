"use client";

import { ChangeEvent, useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  specifications?: string;
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

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState("");

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

    const savedProducts = localStorage.getItem("jkProducts");

    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch {
        setProducts([]);
      }
    }
  }, [authorized]);

  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);

    localStorage.setItem(
      "jkProducts",
      JSON.stringify(updatedProducts)
    );

    window.dispatchEvent(new Event("jkProductsUpdated"));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const addProduct = () => {
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

    const newProduct: Product = {
      id: Date.now(),
      name: name.trim(),
      price: Number(price),
      category,
      image,
      description:
        description.trim() ||
        "Premium product from JK Shoes & Leathers.",
      specifications:
        specifications.trim() ||
        "Specifications will be updated by JK Shoes.",
    };

    const updatedProducts = [...products, newProduct];

    saveProducts(updatedProducts);

    setName("");
    setPrice("");
    setCategory("");
    setImage("");
    setDescription("");
    setSpecifications("");

    alert("Product added successfully!");
  };

  const deleteProduct = (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    const updatedProducts = products.filter(
      (product) => product.id !== id
    );

    saveProducts(updatedProducts);
  };

  const logout = () => {
    sessionStorage.removeItem("jkAdminLoggedIn");
    window.location.replace("/admin");
  };

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

        <button
          onClick={logout}
          style={{
            background: "transparent",
            color: "#fff",
            border: "1px solid #dcae5d",
            padding: "11px 20px",
            borderRadius: "7px",
            cursor: "pointer",
          }}
        >
          LOGOUT
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
          placeholder="Specifications - Type anything you want here..."
          value={specifications}
          onChange={(e) =>
            setSpecifications(e.target.value)
          }
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
          style={{
            marginTop: "20px",
            background: "#dcae5d",
            color: "#111",
            border: "none",
            padding: "14px 25px",
            borderRadius: "7px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          + ADD PRODUCT
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

        {products.length === 0 ? (
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
                      marginBottom: "12px",
                    }}
                  >
                    ₹{product.price.toLocaleString("en-IN")}
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
                      SPECIFICATIONS
                    </p>

                    <p
                      style={{
                        color: "#aaa",
                        fontSize: "11px",
                        lineHeight: "1.6",
                      }}
                    >
                      {product.specifications || "Not specified"}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteProduct(product.id)}
                    style={{
                      width: "100%",
                      background: "#b52b2b",
                      color: "#fff",
                      border: "none",
                      padding: "11px",
                      borderRadius: "7px",
                      cursor: "pointer",
                    }}
                  >
                    🗑 DELETE PRODUCT
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
