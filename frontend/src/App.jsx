import { useEffect, useState } from "react";
import {
    ShoppingBag,
    Search,
    ShoppingCart,
    Package,
    CheckCircle,
    AlertCircle,
    Plus,
    Minus
} from "lucide-react";
import "./App.css";

function createIdempotencyKey() {
    if (window.crypto?.getRandomValues) {
        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);

        return Array.from(bytes, (byte) =>
            byte.toString(16).padStart(2, "0")
        ).join("");
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function App() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [quantities, setQuantities] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [orderMessage, setOrderMessage] = useState("");
    const [orderLoading, setOrderLoading] = useState(false);

    const fetchProducts = async (query = "") => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/products?q=${encodeURIComponent(query)}`
            );

            if (!response.ok) {
                throw new Error("Unable to load products.");
            }

            const data = await response.json();
            setProducts(data.products || []);
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch products initially and whenever search changes.
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const updateQuantity = (productId, change, stock) => {
        setQuantities((previous) => {
            const current = previous[productId] || 1;
            const next = Math.max(1, Math.min(stock, current + change));

            return { ...previous, [productId]: next };
        });
    };

    const placeOrder = async (product) => {
        const quantity = quantities[product.id] || 1;

        try {
            setOrderLoading(true);
            setOrderMessage("");

            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Idempotency-Key": createIdempotencyKey()
                },
                body: JSON.stringify({
                    productId: product.id,
                    quantity
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Order could not be placed.");
            }

            setOrderMessage(
                `Order placed successfully! ${product.name} × ${quantity}`
            );
            setSelectedProduct(null);
            await fetchProducts(search);
        } catch (err) {
            setOrderMessage(err.message);
        } finally {
            setOrderLoading(false);
        }
    };

    return (
        <div className="app">
            <header className="navbar">
                <a className="brand" href="/">
                    <ShoppingBag size={27} />
                    <span>ShopSphere</span>
                </a>

                <nav>
                    <a href="#products">Shop Now</a>
                </nav>
            </header>

            <main>
                <section className="hero">
                    <div className="hero-content">
                        <span className="hero-tag">WELCOME TO SHOPSPHERE</span>
                        <h1>
                            Discover products.
                            <br />
                            Enjoy smarter shopping.
                        </h1>
                        <p>
                            Find your everyday essentials with a simple,
                            seamless shopping experience.
                        </p>
                        <a href="#products" className="hero-button">
                            Explore Products <ShoppingCart size={18} />
                        </a>
                    </div>
                    <div className="hero-icon">
                        <ShoppingBag size={150} strokeWidth={1} />
                    </div>
                </section>

                <section className="features">
                    <div className="feature">
                        <Package size={23} />
                        <span>Quality Products</span>
                    </div>
                    <div className="feature">
                        <CheckCircle size={23} />
                        <span>Easy Ordering</span>
                    </div>
                    <div className="feature">
                        <ShoppingCart size={23} />
                        <span>Simple Shopping</span>
                    </div>
                </section>

                <section className="products-section" id="products">
                    <div className="section-heading">
                        <div>
                            <span className="section-tag">OUR COLLECTION</span>
                            <h2>Explore Products</h2>
                            <p>Find something you'll love.</p>
                        </div>

                        <div className="search-box">
                            <Search size={19} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />
                        </div>
                    </div>

                    {loading && (
                        <p className="status-message">Loading products...</p>
                    )}

                    {error && (
                        <p className="status-message error-message">
                            <AlertCircle size={18} /> {error}
                        </p>
                    )}

                    {!loading && !error && products.length === 0 && (
                        <p className="status-message">No products found.</p>
                    )}

                    {!loading && !error && products.length > 0 && (
                        <div className="products-grid">
                            {products.map((product) => (
                                <article
                                    className="product-card"
                                    key={product.id}
                                >
                                    <div className="product-image">
                                        <Package size={65} strokeWidth={1.2} />
                                    </div>

                                    <div className="product-details">
                                        <span className="product-sku">
                                            {product.sku}
                                        </span>
                                        <h3>{product.name}</h3>
                                        <p className="product-description">
                                            {product.description}
                                        </p>

                                        <div className="product-bottom">
                                            <span className="product-price">
                                                ₹
                                                {Number(
                                                    product.price
                                                ).toLocaleString("en-IN")}
                                            </span>
                                            <span className="product-stock">
                                                {product.stock > 0
                                                    ? `${product.stock} in stock`
                                                    : "Out of stock"}
                                            </span>
                                        </div>

                                        <div className="product-actions">
                                            <div className="quantity-control">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            product.id,
                                                            -1,
                                                            product.stock
                                                        )
                                                    }
                                                    disabled={
                                                        product.stock === 0
                                                    }
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus size={15} />
                                                </button>

                                                <span>
                                                    {quantities[product.id] ||
                                                        1}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            product.id,
                                                            1,
                                                            product.stock
                                                        )
                                                    }
                                                    disabled={
                                                        product.stock === 0 ||
                                                        (quantities[
                                                            product.id
                                                        ] || 1) >= product.stock
                                                    }
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus size={15} />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                className="buy-button"
                                                onClick={() =>
                                                    setSelectedProduct(product)
                                                }
                                                disabled={product.stock === 0}
                                            >
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {selectedProduct && (
                <div className="modal-overlay">
                    <div className="checkout-modal">
                        <button
                            type="button"
                            className="modal-close"
                            onClick={() => setSelectedProduct(null)}
                            disabled={orderLoading}
                        >
                            ×
                        </button>

                        <ShoppingBag size={35} />
                        <h2>Confirm Your Order</h2>
                        <p>{selectedProduct.name}</p>

                        <div className="checkout-summary">
                            <span>Quantity</span>
                            <strong>
                                {quantities[selectedProduct.id] || 1}
                            </strong>

                            <span>Total</span>
                            <strong>
                                ₹
                                {(
                                    Number(selectedProduct.price) *
                                    (quantities[selectedProduct.id] || 1)
                                ).toLocaleString("en-IN")}
                            </strong>
                        </div>

                        <button
                            type="button"
                            className="confirm-button"
                            onClick={() => placeOrder(selectedProduct)}
                            disabled={orderLoading}
                        >
                            {orderLoading
                                ? "Placing Order..."
                                : "Confirm Order"}
                        </button>
                    </div>
                </div>
            )}

            {orderMessage && (
                <div className="notification">
                    <span>{orderMessage}</span>
                    <button
                        type="button"
                        onClick={() => setOrderMessage("")}
                        aria-label="Dismiss notification"
                    >
                        ×
                    </button>
                </div>
            )}

            <footer className="footer">
                <ShoppingBag size={20} />
                <span>ShopSphere © 2026. All rights reserved.</span>
            </footer>
        </div>
    );
}

export default App;
