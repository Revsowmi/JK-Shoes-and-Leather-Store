"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

type CartItem = Product & {
  quantity: number;
};

const categories = [
  "All",
  "Formal Shoes",
  "Sandals",
  "Loafers",
  "Casual Shoes",
  "Leather Bags",
  "Backpacks",
  "Sports Shoes",
  "Boots",
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Leather Sling Bag",
    price: 1499,
    category: "Leather Bags",
    image: "/Images/sling-bag.jpg",
    description:
      "Premium leather sling bag suitable for everyday use.",
    details:
      "Material: Premium Leather | Color: Brown | Type: Sling Bag",
  },
  {
    id: 2,
    name: "Travel Duffle Bag",
    price: 2499,
    category: "Leather Bags",
    image: "/Images/travel dufflebag.jpg",
    description:
      "Spacious leather travel duffle bag.",
    details:
      "Material: Leather | Capacity: Large | Travel Friendly",
  },
  {
    id: 3,
    name: "Leather Backpack",
    price: 2199,
    category: "Backpacks",
    image: "/Images/leather backpack.jpg",
    description:
      "Stylish leather backpack for office and travel.",
    details:
      "Material: Leather | Compartments: Multiple | Type: Backpack",
  },
  {
    id: 4,
    name: "Trolley Cabin Bag",
    price: 3499,
    category: "Backpacks",
    image: "/Images/trolley cabin bag.jpg",
    description:
      "Compact trolley cabin bag for travel.",
    details:
      "Type: Cabin Trolley | Wheels: 4 | Travel Size",
  },
  {
    id: 5,
    name: "Office Leather Bag",
    price: 2799,
    category: "Leather Bags",
    image: "/Images/office leather bag.jpg",
    description:
      "Elegant leather office bag.",
    details:
      "Material: Leather | Use: Office | Compartments: Multiple",
  },
  {
    id: 6,
    name: "Cross Body Bag",
    price: 1299,
    category: "Leather Bags",
    image: "/Images/Leather sling bag.jpg",
    description:
      "Compact cross body leather bag.",
    details:
      "Material: Leather | Type: Cross Body | Adjustable Strap",
  },
];

export default function Home() {
  const [products, setProducts] =
    useState<Product[]>(DEFAULT_PRODUCTS);

  const [cart, setCart] =
    useState<CartItem[]>([]);

  const [activeCategory, setActiveCategory] =
    useState("All");

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [customerAddress, setCustomerAddress] =
    useState("");

  const [customerCity, setCustomerCity] =
    useState("");

  const [customerPincode, setCustomerPincode] =
    useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", {
        ascending: false,
      });

    if (error) {
      console.error(
        "SUPABASE PRODUCT ERROR:",
        error
      );

      setProducts(DEFAULT_PRODUCTS);
    } else if (data && data.length > 0) {
      setProducts(data);
    } else {
      setProducts(DEFAULT_PRODUCTS);
    }

    setLoading(false);
  }

  const visibleProducts =
    activeCategory === "All"
      ? products
      : products.filter(
          (product) =>
            product.category.toLowerCase() ===
            activeCategory.toLowerCase()
        );

  const cartCount = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0
  );

  function addToCart(product: Product) {
    if (
      product.stock !== undefined &&
      product.stock <= 0
    ) {
      alert("This product is currently out of stock.");
      return;
    }

    setCart((currentCart) => {
      const existing =
        currentCart.find(
          (item) =>
            item.id === product.id
        );

      if (existing) {
        return currentCart.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                }
              : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    alert(
      `${product.name} added to cart.`
    );
  }

  function changeQuantity(
    id: number,
    amount: number
  ) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity +
                  amount,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }

  function removeFromCart(
    id: number
  ) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  function scrollTo(id: string) {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }

  function checkout() {
    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

    if (
      !customerName.trim() ||
      !customerPhone.trim() ||
      !customerAddress.trim() ||
      !customerCity.trim() ||
      !customerPincode.trim()
    ) {
      alert(
        "Please fill all customer details."
      );
      return;
    }

    if (
      !/^[0-9]{10}$/.test(
        customerPhone
      )
    ) {
      alert(
        "Enter a valid 10-digit mobile number."
      );
      return;
    }

    if (
      !/^[0-9]{6}$/.test(
        customerPincode
      )
    ) {
      alert(
        "Enter a valid 6-digit pincode."
      );
      return;
    }

    const productDetails =
      cart
        .map(
          (item, index) =>
            `
${index + 1}. ${item.name}
Category: ${item.category}
Quantity: ${item.quantity}
Price: ₹${item.price.toLocaleString(
              "en-IN"
            )}
Subtotal: ₹${(
              item.price *
              item.quantity
            ).toLocaleString(
              "en-IN"
            )}
Details: ${
              item.details ||
              "Not specified"
            }
`
        )
        .join("\n");

    const message = `
🛍️ *NEW ORDER - JK SHOES & LEATHERS*

━━━━━━━━━━━━━━━━━━━━

👤 *CUSTOMER DETAILS*

Name: ${customerName}
Mobile: ${customerPhone}
Address: ${customerAddress}
City: ${customerCity}
Pincode: ${customerPincode}

━━━━━━━━━━━━━━━━━━━━

🛒 *ORDER DETAILS*

${productDetails}

━━━━━━━━━━━━━━━━━━━━

💰 *TOTAL ORDER VALUE*

₹${cartTotal.toLocaleString(
      "en-IN"
    )}

━━━━━━━━━━━━━━━━━━━━

📦 Customer has submitted the order through the JK Shoes website.

Please contact the customer to confirm the order and delivery.

Thank you.
`;

    const whatsappNumber =
      "919042754366";

    const whatsappURL =
      `https://wa.me/${whatsappNumber}?text=` +
      encodeURIComponent(
        message
      );

    window.open(
      whatsappURL,
      "_blank"
    );

    alert(
      "Your order details have been sent to JK Shoes successfully.\n\nJK Shoes will contact you shortly to confirm your order."
    );
  }

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background: #080808;
          color: #fff;
          font-family: Arial, sans-serif;
        }

        button,
        input,
        textarea,
        select {
          font-family: inherit;
        }

        button {
          cursor: pointer;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .jk-page {
          min-height: 100vh;
          background: #080808;
        }

        .header {
          height: 76px;
          background: rgba(5,5,5,.97);
          border-bottom: 1px solid #8d6728;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4.5%;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .logo {
          text-align: center;
          color: #dcae5d;
          line-height: .8;
        }

        .logo h1 {
          font-family: Georgia, serif;
          font-size: 45px;
        }

        .logo span {
          font-size: 9px;
          letter-spacing: 1px;
        }

        .nav {
          display: flex;
          gap: 28px;
        }

        .nav button {
          border: 0;
          background: transparent;
          color: #bbb;
          font-size: 12px;
        }

        .nav button:hover {
          color: #dcae5d;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .cart-btn,
        .visit-btn {
          border: 1px solid #dcae5d;
          padding: 11px 15px;
          color: #fff;
          background: transparent;
          font-size: 11px;
        }

        .cart-btn:hover,
        .visit-btn:hover {
          background: #dcae5d;
          color: #111;
        }

        .cart-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #dcae5d;
          color: #111;
          margin-left: 4px;
          font-size: 10px;
        }

        .hero {
          min-height: 500px;
          background:
            linear-gradient(
              90deg,
              rgba(0,0,0,.88),
              rgba(0,0,0,.55),
              rgba(0,0,0,.08)
            ),
            url("/Images/hero-shoe.jpg") center/cover;
          display: flex;
          align-items: center;
          padding: 55px 5%;
          border-bottom: 1px solid #6d5127;
        }

        .hero-content {
          max-width: 530px;
        }

        .eyebrow,
        .section-small {
          color: #dcae5d;
          letter-spacing: 2px;
          font-size: 11px;
        }

        .hero h2 {
          font-family: Georgia, serif;
          font-size: 58px;
          line-height: .9;
          margin: 10px 0 20px;
        }

        .hero h2 span {
          color: #dcae5d;
        }

        .hero p {
          font-size: 13px;
          line-height: 1.7;
          color: #ddd;
          margin-bottom: 20px;
        }

        .hero-buttons {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .gold-btn,
        .outline-btn {
          display: inline-block;
          border: 1px solid #dcae5d;
          padding: 11px 15px;
          font-size: 11px;
        }

        .gold-btn {
          background: #dcae5d;
          color: #111;
        }

        .outline-btn {
          background: transparent;
          color: #fff;
        }

        .features {
          display: flex;
          gap: 18px;
          margin-top: 22px;
          font-size: 10px;
          color: #ddd;
          flex-wrap: wrap;
        }

        section {
          padding: 45px 3%;
        }

        .section-title {
          text-align: center;
          margin-bottom: 25px;
        }

        .section-title h2 {
          font-family: Georgia, serif;
          font-size: 32px;
          margin: 7px;
        }

        .section-title::after {
          content: "◆";
          display: block;
          color: #dcae5d;
          font-size: 8px;
        }

        .collections,
        .products {
          display: grid;
          grid-template-columns: repeat(6,1fr);
          gap: 8px;
        }

        .collection-card {
          height: 225px;
          position: relative;
          overflow: hidden;
          border: 1px solid #4e3a1c;
        }

        .collection-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: .5s;
        }

        .collection-card:hover img {
          transform: scale(1.06);
        }

        .collection-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            transparent 35%,
            rgba(0,0,0,.95)
          );
        }

        .collection-info {
          position: absolute;
          bottom: 10px;
          width: 100%;
          text-align: center;
          z-index: 2;
        }

        .collection-info h3 {
          font-size: 12px;
        }

        .collection-info span {
          display: inline-block;
          margin-top: 5px;
          color: #f0c56c;
          font-size: 10px;
        }

        .category-filter {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 7px;
          margin-bottom: 25px;
        }

        .filter-btn {
          border: 1px solid #4e3a1c;
          background: #100c09;
          color: #bbb;
          padding: 8px 12px;
          font-size: 9px;
        }

        .filter-btn.active,
        .filter-btn:hover {
          background: #dcae5d;
          border-color: #dcae5d;
          color: #111;
        }

        .product-card {
          text-align: center;
          padding-bottom: 15px;
        }

        .product-img {
          height: 155px;
          background: #eee;
          overflow: hidden;
        }

        .product-img img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: .4s;
        }

        .product-card:hover .product-img img {
          transform: scale(1.05);
        }

        .product-card h3 {
          font-size: 10px;
          margin: 8px 0 3px;
        }

        .price {
          color: #dcae5d;
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .details {
          border: 1px solid #dcae5d;
          color: #fff;
          background: transparent;
          padding: 7px 17px;
          font-size: 9px;
        }

        .details:hover {
          background: #dcae5d;
          color: #111;
        }

        .stock {
          font-size: 9px;
          color: #999;
          margin-bottom: 7px;
        }

        .cart-section,
        .checkout-section {
          background: #100c09;
          border-top: 1px solid #4e3a1c;
          border-bottom: 1px solid #4e3a1c;
        }

        .container {
          max-width: 1100px;
          margin: auto;
        }

        .cart-title,
        .checkout-title {
          text-align: center;
          margin-bottom: 25px;
        }

        .cart-title h2,
        .checkout-title h2 {
          font-family: Georgia, serif;
          font-size: 36px;
          margin-top: 5px;
        }

        .cart-items {
          display: grid;
          gap: 10px;
        }

        .cart-item {
          display: grid;
          grid-template-columns: 80px 1fr auto auto auto;
          align-items: center;
          gap: 15px;
          padding: 12px;
          background: #17120e;
          border: 1px solid #3e2d18;
        }

        .cart-item img {
          width: 80px;
          height: 65px;
          object-fit: contain;
          background: #eee;
        }

        .cart-name {
          font-size: 13px;
        }

        .cart-price {
          color: #dcae5d;
          font-size: 12px;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .quantity-controls button {
          width: 26px;
          height: 26px;
          border: 1px solid #dcae5d;
          background: transparent;
          color: #fff;
        }

        .remove-btn {
          border: 0;
          background: transparent;
          color: #aaa;
        }

        .empty-cart {
          text-align: center;
          color: #aaa;
          padding: 30px;
          border: 1px dashed #4e3a1c;
        }

        .cart-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding: 20px;
          border-top: 1px solid #4e3a1c;
        }

        .cart-total {
          font-size: 20px;
        }

        .cart-total span {
          color: #dcae5d;
        }

        .checkout-btn {
          border: 1px solid #dcae5d;
          background: #dcae5d;
          color: #111;
          padding: 13px 25px;
          font-size: 11px;
          font-weight: 600;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1.2fr .8fr;
          gap: 25px;
        }

        .checkout-form,
        .order-summary {
          background: #100c09;
          border: 1px solid #3e2d18;
          padding: 25px;
        }

        .checkout-form {
          display: grid;
          gap: 15px;
        }

        .checkout-form input,
        .checkout-form textarea {
          width: 100%;
          padding: 14px;
          background: #080808;
          border: 1px solid #4e3a1c;
          color: #fff;
          outline: 0;
          font-size: 12px;
        }

        .checkout-form textarea {
          min-height: 110px;
        }

        .order-summary h3 {
          color: #dcae5d;
          font-size: 13px;
          margin-bottom: 15px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 0;
          border-bottom: 1px solid #292929;
          font-size: 11px;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #dcae5d;
        }

        .summary-total strong {
          color: #dcae5d;
        }

        .about,
        .store {
          display: grid;
          grid-template-columns: 40% 60%;
          background: #100c09;
        }

        .about-text,
        .store-info {
          padding: 45px 50px;
        }

        .about-text h2,
        .store-info h2 {
          font-family: Georgia, serif;
          font-size: 32px;
          margin: 8px 0 15px;
        }

        .about-text p,
        .store-info p {
          font-size: 11px;
          line-height: 1.8;
          color: #ddd;
        }

        .about-image,
        .store-image {
          min-height: 300px;
        }

        .about-image img,
        .store-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .usp {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          border-top: 1px solid #292929;
          border-bottom: 1px solid #292929;
        }

        .usp-box {
          text-align: center;
          padding: 25px 15px;
          border-right: 1px solid #292929;
        }

        .usp-box:last-child {
          border: 0;
        }

        .usp-box h3 {
          font-size: 11px;
          margin-bottom: 4px;
        }

        .usp-box p {
          font-size: 9px;
          color: #bbb;
        }

        footer {
          border-top: 1px solid #624a25;
          padding: 35px 5% 10px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr 1fr 1.3fr;
          gap: 30px;
        }

        .footer-logo {
          color: #dcae5d;
          font-family: Georgia, serif;
          font-size: 45px;
        }

        .footer-grid h4 {
          color: #dcae5d;
          font-size: 10px;
          margin-bottom: 10px;
        }

        .footer-grid p,
        .footer-grid button {
          color: #bbb;
          font-size: 9px;
          line-height: 1.8;
        }

        .footer-grid button {
          display: block;
          background: transparent;
          border: 0;
          text-align: left;
        }

        .copyright {
          border-top: 1px solid #242424;
          margin-top: 20px;
          padding-top: 10px;
          display: flex;
          justify-content: space-between;
          color: #777;
          font-size: 8px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.8);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal {
          width: min(850px,100%);
          max-height: 90vh;
          overflow-y: auto;
          background: #12100d;
          border: 1px solid #dcae5d;
          padding: 25px;
          position: relative;
        }

        .modal-close {
          position: absolute;
          right: 15px;
          top: 12px;
          background: transparent;
          border: 0;
          color: #fff;
          font-size: 25px;
        }

        .modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        .modal-image {
          background: #eee;
        }

        .modal-image img {
          width: 100%;
          height: 350px;
          object-fit: contain;
        }

        .modal-content h2 {
          font-family: Georgia, serif;
          font-size: 32px;
          margin-bottom: 10px;
        }

        .modal-price {
          color: #dcae5d;
          font-size: 22px;
          margin-bottom: 20px;
        }

        .modal-content p {
          color: #bbb;
          line-height: 1.8;
          font-size: 13px;
          margin-bottom: 15px;
        }

        .spec-box {
          border: 1px solid #3e2d18;
          background: #0c0a08;
          padding: 15px;
          color: #ddd;
          font-size: 12px;
          line-height: 1.8;
          margin-bottom: 20px;
        }

        @media (max-width:1000px) {
          .collections,
          .products {
            grid-template-columns: repeat(3,1fr);
          }

          .nav {
            display: none;
          }
        }

        @media (max-width:700px) {
          .header {
            height: auto;
            min-height: 70px;
          }

          .visit-btn {
            display: none;
          }

          .hero {
            min-height: 500px;
            align-items: flex-start;
            padding-top: 80px;
          }

          .hero h2 {
            font-size: 45px;
          }

          .collections,
          .products {
            grid-template-columns: repeat(2,1fr);
          }

          .cart-item {
            grid-template-columns: 60px 1fr;
          }

          .cart-item img {
            width: 60px;
            height: 55px;
          }

          .cart-price,
          .quantity-controls,
          .remove-btn {
            grid-column: 2;
          }

          .cart-summary {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }

          .checkout-grid,
          .about,
          .store,
          .modal-grid {
            grid-template-columns: 1fr;
          }

          .about-text,
          .store-info {
            padding: 30px;
          }

          .usp {
            grid-template-columns: repeat(2,1fr);
          }

          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }

          .copyright {
            flex-direction: column;
            gap: 5px;
          }

          .modal-image img {
            height: 250px;
          }
        }

        @media (max-width:450px) {
          .collections,
          .products {
            grid-template-columns: 1fr;
          }

          .usp {
            grid-template-columns: 1fr;
          }

          .footer-grid {
            grid-template-columns: 1fr;
          }

          .hero-buttons {
            flex-direction: column;
            align-items: flex-start;
          }

          .logo h1 {
            font-size: 35px;
          }
        }
      `}</style>

      <div className="jk-page">

        <header className="header">
          <div className="logo">
            <h1>JK</h1>
            <span>
              SHOES & LEATHERS
            </span>
          </div>

          <nav className="nav">
            <button
              onClick={() =>
                scrollTo("home")
              }
            >
              HOME
            </button>

            <button
              onClick={() =>
                scrollTo("collections")
              }
            >
              COLLECTIONS
            </button>

            <button
              onClick={() =>
                scrollTo("products")
              }
            >
              PRODUCTS
            </button>

            <button
              onClick={() =>
                scrollTo("about")
              }
            >
              ABOUT US
            </button>

            <button
              onClick={() =>
                scrollTo("contact")
              }
            >
              CONTACT
            </button>
          </nav>

          <div className="header-actions">
            <button
              className="cart-btn"
              onClick={() =>
                scrollTo("cart")
              }
            >
              🛒 CART{" "}
              <span className="cart-count">
                {cartCount}
              </span>
            </button>

            <a
              href="https://maps.app.goo.gl/MpTqdbR9nmUBwPW7A"
              target="_blank"
              rel="noopener noreferrer"
              className="visit-btn"
            >
              📍 VISIT STORE
            </a>
          </div>
        </header>

        <section
          className="hero"
          id="home"
        >
          <div className="hero-content">
            <div className="eyebrow">
              JK SHOES & LEATHERS
            </div>

            <h2>
              Step Into
              <br />
              <span>
                Timeless Style
              </span>
            </h2>

            <p>
              Premium footwear and
              leather essentials
              <br />
              crafted for every
              occasion.
            </p>

            <div className="hero-buttons">
              <button
                className="gold-btn"
                onClick={() =>
                  scrollTo(
                    "collections"
                  )
                }
              >
                EXPLORE COLLECTION →
              </button>

              <a
                href="https://wa.me/919042754366"
                target="_blank"
                rel="noopener noreferrer"
                className="outline-btn"
              >
                CONTACT US
              </a>
            </div>

            <div className="features">
              <span>
                ★ Premium Leather
              </span>
              <span>|</span>
              <span>
                🏷 Elegant Designs
              </span>
              <span>|</span>
              <span>
                Everyday Comfort
              </span>
            </div>
          </div>
        </section>

        <section id="collections">
          <div className="section-title">
            <small className="section-small">
              OUR COLLECTIONS
            </small>

            <h2>
              Explore Our Collections
            </h2>
          </div>

          <div className="collections">
            {[
              [
                "Formal Shoes",
                "/Images/formal-shoes.jpg",
              ],
              [
                "Sandals",
                "/Images/sandals.jpg",
              ],
              [
                "Loafers",
                "/Images/loafers.jpg",
              ],
              [
                "Casual Shoes",
                "/Images/casual-shoes.jpg",
              ],
              [
                "Leather Bags",
                "/Images/leather bags.jpg",
              ],
              [
                "Backpacks",
                "/Images/BACKPACKS.jpg",
              ],
            ].map(
              ([name, image]) => (
                <div
                  className="collection-card"
                  key={name}
                  onClick={() => {
                    setActiveCategory(
                      name
                    );
                    scrollTo(
                      "products"
                    );
                  }}
                >
                  <img
                    src={image}
                    alt={name}
                  />

                  <div className="collection-info">
                    <h3>
                      {name.toUpperCase()}
                    </h3>

                    <span>
                      Shop Collection →
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        <section id="products">
          <div className="section-title">
            <small className="section-small">
              SHOP THE COLLECTION
            </small>

            <h2>
              {activeCategory ===
              "All"
                ? "Featured Showcase"
                : activeCategory}
            </h2>
          </div>

          <div className="category-filter">
            {categories.map(
              (category) => (
                <button
                  key={category}
                  className={`filter-btn ${
                    activeCategory ===
                    category
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveCategory(
                      category
                    )
                  }
                >
                  {category.toUpperCase()}
                </button>
              )
            )}
          </div>

          {loading ? (
            <div className="empty-cart">
              Loading products...
            </div>
          ) : (
            <div className="products">
              {visibleProducts.length ===
              0 ? (
                <div
                  className="empty-cart"
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  No products in this
                  collection yet.
                </div>
              ) : (
                visibleProducts.map(
                  (product) => (
                    <div
                      className="product-card"
                      key={product.id}
                    >
                      <div
                        className="product-img"
                        onClick={() =>
                          setSelectedProduct(
                            product
                          )
                        }
                      >
                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                        />
                      </div>

                      <h3>
                        {product.name}
                      </h3>

                      <div className="price">
                        ₹
                        {product.price.toLocaleString(
                          "en-IN"
                        )}
                      </div>

                      <div className="stock">
                        Stock:{" "}
                        {product.stock ??
                          0}
                      </div>

                      <button
                        className="details"
                        onClick={() =>
                          addToCart(
                            product
                          )
                        }
                      >
                        ADD TO CART
                      </button>
                    </div>
                  )
                )
              )}
            </div>
          )}
        </section>

        <section
          id="cart"
          className="cart-section"
        >
          <div className="container">
            <div className="cart-title">
              <small className="section-small">
                YOUR SHOPPING CART
              </small>

              <h2>
                Selected Products
              </h2>
            </div>

            {!cart.length ? (
              <div className="empty-cart">
                Your cart is empty.
              </div>
            ) : (
              <div className="cart-items">
                {cart.map(
                  (item) => (
                    <div
                      className="cart-item"
                      key={item.id}
                    >
                      <img
                        src={
                          item.image
                        }
                        alt={
                          item.name
                        }
                      />

                      <div>
                        <div className="cart-name">
                          {
                            item.name
                          }
                        </div>

                        <div className="cart-price">
                          ₹
                          {item.price.toLocaleString(
                            "en-IN"
                          )}
                        </div>
                      </div>

                      <div className="quantity-controls">
                        <button
                          onClick={() =>
                            changeQuantity(
                              item.id,
                              -1
                            )
                          }
                        >
                          −
                        </button>

                        <span>
                          {
                            item.quantity
                          }
                        </span>

                        <button
                          onClick={() =>
                            changeQuantity(
                              item.id,
                              1
                            )
                          }
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-price">
                        ₹
                        {(
                          item.price *
                          item.quantity
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </div>

                      <button
                        className="remove-btn"
                        onClick={() =>
                          removeFromCart(
                            item.id
                          )
                        }
                      >
                        🗑
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            <div className="cart-summary">
              <div className="cart-total">
                Total:{" "}
                <span>
                  ₹
                  {cartTotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <button
                className="checkout-btn"
                onClick={() =>
                  scrollTo(
                    "checkout"
                  )
                }
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        </section>

        <section
          id="checkout"
          className="checkout-section"
        >
          <div className="container">
            <div className="checkout-title">
              <small className="section-small">
                ORDER DETAILS
              </small>

              <h2>
                Complete Your Order
              </h2>
            </div>

            <div className="checkout-grid">
              <div className="checkout-form">
                <input
                  value={
                    customerName
                  }
                  onChange={(e) =>
                    setCustomerName(
                      e.target.value
                    )
                  }
                  placeholder="Full Name"
                />

                <input
                  value={
                    customerPhone
                  }
                  onChange={(e) =>
                    setCustomerPhone(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  type="tel"
                  placeholder="Mobile Number"
                  maxLength={10}
                />

                <textarea
                  value={
                    customerAddress
                  }
                  onChange={(e) =>
                    setCustomerAddress(
                      e.target.value
                    )
                  }
                  placeholder="Full Delivery Address"
                />

                <input
                  value={
                    customerCity
                  }
                  onChange={(e) =>
                    setCustomerCity(
                      e.target.value
                    )
                  }
                  placeholder="City"
                />

                <input
                  value={
                    customerPincode
                  }
                  onChange={(e) =>
                    setCustomerPincode(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="Pincode"
                  maxLength={6}
                />

                <button
                  className="checkout-btn"
                  onClick={checkout}
                >
                  COMPLETE YOUR ORDER →
                </button>

                <p
                  style={{
                    color: "#888",
                    fontSize:
                      "11px",
                    lineHeight: 1.7,
                  }}
                >
                  No online payment is
                  required at this stage.
                  Your customer details
                  and selected products
                  will be sent directly to
                  JK Shoes through
                  WhatsApp.
                </p>
              </div>

              <div className="order-summary">
                <h3>
                  ORDER SUMMARY
                </h3>

                {!cart.length ? (
                  <p
                    style={{
                      color:
                        "#888",
                      fontSize:
                        "11px",
                    }}
                  >
                    Your selected
                    products will appear
                    here.
                  </p>
                ) : (
                  <>
                    {cart.map(
                      (item) => (
                        <div
                          className="summary-item"
                          key={
                            item.id
                          }
                        >
                          <span>
                            {
                              item.name
                            }{" "}
                            ×{" "}
                            {
                              item.quantity
                            }
                          </span>

                          <span>
                            ₹
                            {(
                              item.price *
                              item.quantity
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      )
                    )}

                    <div className="summary-total">
                      <span>
                        Total
                      </span>

                      <strong>
                        ₹
                        {cartTotal.toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section
          id="about"
          style={{
            padding: 0,
          }}
        >
          <div className="about">
            <div className="about-text">
              <small className="section-small">
                ABOUT US
              </small>

              <h2>
                Crafted For
                <br />
                Every Step
              </h2>

              <p>
                At JK Shoes &
                Leathers, we bring
                you a wide range of
                footwear and leather
                essentials that
                combine style,
                comfort and
                durability.
              </p>

              <br />

              <button
                className="gold-btn"
                onClick={() =>
                  scrollTo(
                    "contact"
                  )
                }
              >
                KNOW MORE ABOUT US
              </button>
            </div>

            <div className="about-image">
              <img
                src="/Images/store.jpg"
                alt="JK Shoes Store"
              />
            </div>
          </div>
        </section>

        <section
          style={{
            padding: 0,
          }}
        >
          <div className="usp">
            <div className="usp-box">
              <h3>★</h3>
              <h3>
                PREMIUM QUALITY
              </h3>
              <p>
                Carefully selected
                high quality leather
                products.
              </p>
            </div>

            <div className="usp-box">
              <h3>👞</h3>
              <h3>
                STYLISH COLLECTION
              </h3>
              <p>
                Elegant designs for
                every occasion.
              </p>
            </div>

            <div className="usp-box">
              <h3>🏷</h3>
              <h3>
                BEST PRICES
              </h3>
              <p>
                Affordable pricing
                with the best value.
              </p>
            </div>

            <div className="usp-box">
              <h3>☎</h3>
              <h3>
                CUSTOMER SUPPORT
              </h3>
              <p>
                We are here to help
                you always.
              </p>
            </div>
          </div>
        </section>

        <section
          id="contact"
          style={{
            padding: 0,
          }}
        >
          <div className="store">
            <div className="store-image">
              <img
                src="/Images/showroom.jpg"
                alt="JK Shoes Showroom"
              />
            </div>

            <div className="store-info">
              <small className="section-small">
                VISIT OUR STORE
              </small>

              <h2>
                JK Shoes &
                Leathers
              </h2>

              <p>
                📞 9042754366
              </p>

              <p>
                💬 9884547622
              </p>

              <p>
                📍 Kundrathur
                Pallavaram Road
              </p>

              <br />

              <div className="hero-buttons">
                <a
                  href="https://maps.app.goo.gl/MpTqdbR9nmUBwPW7A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gold-btn"
                >
                  GET DIRECTIONS
                </a>

                <a
                  href="https://wa.me/919042754366"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="outline-btn"
                >
                  WHATSAPP US
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer>
          <div className="footer-grid">
            <div>
              <div className="footer-logo">
                JK
              </div>

              <p>
                SHOES & LEATHERS
              </p>

              <p>
                Step into timeless
                style with our
                premium footwear
                and leather
                essentials.
              </p>
            </div>

            <div>
              <h4>
                QUICK LINKS
              </h4>

              {[
                ["Home", "home"],
                [
                  "Collections",
                  "collections",
                ],
                [
                  "Products",
                  "products",
                ],
                [
                  "About Us",
                  "about",
                ],
                [
                  "Contact",
                  "contact",
                ],
              ].map(
                ([label, id]) => (
                  <button
                    key={id}
                    onClick={() =>
                      scrollTo(id)
                    }
                  >
                    {label}
                  </button>
                )
              )}
            </div>

            <div>
              <h4>
                COLLECTIONS
              </h4>

              {categories
                .slice(1)
                .map(
                  (category) => (
                    <button
                      key={
                        category
                      }
                      onClick={() => {
                        setActiveCategory(
                          category
                        );
                        scrollTo(
                          "products"
                        );
                      }}
                    >
                      {category}
                    </button>
                  )
                )}
            </div>

            <div>
              <h4>
                CONTACT INFO
              </h4>

              <p>
                9042754366
              </p>

              <p>
                9884547622
              </p>

              <p>
                Kundrathur
                Pallavaram Road
              </p>
            </div>
          </div>

          <div className="copyright">
            <span>
              © 2026 JK Shoes &
              Leathers. All Rights
              Reserved.
            </span>

            <span>
              Designed with ♡ for
              style and comfort.
            </span>
          </div>
        </footer>

        {selectedProduct && (
          <div
            className="modal-overlay"
            onClick={() =>
              setSelectedProduct(
                null
              )
            }
          >
            <div
              className="modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <button
                className="modal-close"
                onClick={() =>
                  setSelectedProduct(
                    null
                  )
                }
              >
                ×
              </button>

              <div className="modal-grid">
                <div className="modal-image">
                  <img
                    src={
                      selectedProduct.image
                    }
                    alt={
                      selectedProduct.name
                    }
                  />
                </div>

                <div className="modal-content">
                  <small className="section-small">
                    {
                      selectedProduct.category
                    }
                  </small>

                  <h2>
                    {
                      selectedProduct.name
                    }
                  </h2>

                  <div className="modal-price">
                    ₹
                    {selectedProduct.price.toLocaleString(
                      "en-IN"
                    )}
                  </div>

                  <p>
                    {selectedProduct.description ||
                      "Premium product from JK Shoes & Leathers."}
                  </p>

                  <h4
                    style={{
                      color:
                        "#dcae5d",
                      marginBottom:
                        "8px",
                    }}
                  >
                    PRODUCT DETAILS
                  </h4>

                  <div className="spec-box">
                    {selectedProduct.details ||
                      "Details will be updated by JK Shoes."}
                  </div>

                  <button
                    className="gold-btn"
                    onClick={() => {
                      addToCart(
                        selectedProduct
                      );
                      setSelectedProduct(
                        null
                      );
                    }}
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}