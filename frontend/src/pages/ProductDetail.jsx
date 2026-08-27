import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import customerApi from "../api/customerAxios.js";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";
import { formatPKR } from "../utils/currency.js";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import ProductCard from "../components/ProductCard.jsx";
import StarRating from "../components/StarRating.jsx";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isAuthenticated, customer } = useCustomerAuth();

  const [product, setProduct] = useState(null);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 });
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/${id}`);
      setReviews(data.reviews);
      setReviewStats({ average: data.average, count: data.count });
      const mine = data.reviews.find((r) => r.customer === customer?._id);
      if (mine) {
        setMyRating(mine.rating);
        setMyComment(mine.comment);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setProduct(null);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        setSize(data.sizes?.[0] || "");
        setColor(data.colors?.[0] || "");
        setActiveImg(0);

        const { data: sameCategory } = await api.get("/products", {
          params: { category: data.category },
        });
        setRelated(sameCategory.filter((p) => p._id !== data._id).slice(0, 4));

        await loadReviews();
      } catch (err) {
        console.error(err);
      }
    };
    load();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!product) return <div className="container-ehsar py-24 text-center text-gray-400">Loading...</div>;

  const hasDiscount = product.isOnSale && product.discountPrice;
  const images = product.images?.length ? product.images : ["https://via.placeholder.com/800x1000?text=Ehsar"];
  const saved = isWishlisted(product._id);
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    addItem(product, size, color, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    if (!myRating) {
      setReviewError("Please select a star rating.");
      return;
    }
    setSubmittingReview(true);
    try {
      await customerApi.post(`/reviews/${id}`, { rating: myRating, comment: myComment });
      await loadReviews();
    } catch (err) {
      setReviewError(err?.response?.data?.message || "Could not submit your review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container-ehsar py-14">
      <Breadcrumbs
        items={[
          { label: product.category === "men" ? "Men" : "Women", to: `/shop?category=${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="relative aspect-[3/4] bg-ehsar-cream overflow-hidden mb-4">
            <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      aria-label={`Go to image ${i + 1}`}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${activeImg === i ? "bg-ehsar-black" : "bg-white/80"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-20 overflow-hidden border ${activeImg === i ? "border-ehsar-black" : "border-transparent"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="max-w-md">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wide">{product.name}</h1>
            <button
              onClick={() => toggleWishlist(product)}
              aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
              className="shrink-0 mt-1"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={saved ? "#b08d57" : "none"} stroke={saved ? "#b08d57" : "currentColor"} strokeWidth="1.5">
                <path d="M12 21s-7.5-4.6-10.2-9.1C.2 8.9 1.4 5 5 4.2c2.1-.5 4 .5 5 2.3.9-1.8 2.9-2.8 5-2.3 3.6.8 4.8 4.7 3.2 7.7C19.5 16.4 12 21 12 21z" />
              </svg>
            </button>
          </div>

          <div className="mb-6 text-lg">
            {hasDiscount ? (
              <>
                <span className="line-through text-gray-400 mr-3">{formatPKR(product.price)}</span>
                <span className="text-ehsar-gold">{formatPKR(product.discountPrice)}</span>
              </>
            ) : (
              <span>{formatPKR(product.price)}</span>
            )}
          </div>

          {reviewStats.count > 0 && (
            <div className="flex items-center gap-2 mb-6 -mt-3">
              <StarRating value={reviewStats.average} size={14} />
              <span className="text-xs text-gray-500">
                {reviewStats.average.toFixed(1)} ({reviewStats.count} review{reviewStats.count !== 1 ? "s" : ""})
              </span>
            </div>
          )}

          <p className="text-gray-600 text-sm leading-relaxed mb-8">{product.description}</p>

          {product.sizes?.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs tracking-widest2 uppercase text-gray-500">Size</h4>
                <Link to="/size-guide" className="text-xs text-gray-500 underline hover:text-ehsar-gold">
                  Size Guide
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-11 h-11 px-3 border text-sm ${size === s ? "border-ehsar-black bg-ehsar-black text-white" : "border-gray-300"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="mb-8">
              <h4 className="text-xs tracking-widest2 uppercase text-gray-500 mb-2">Color</h4>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`px-4 py-2 border text-sm ${color === c ? "border-ehsar-black bg-ehsar-black text-white" : "border-gray-300"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {outOfStock ? (
            <button disabled className="w-full mb-3 bg-gray-200 text-gray-500 px-8 py-3 text-sm tracking-widest2 uppercase cursor-not-allowed">
              Out of Stock
            </button>
          ) : (
            <button onClick={handleAdd} className="btn-primary w-full mb-3">
              {added ? "Added to Bag ✓" : "Add to Bag"}
            </button>
          )}
          <button onClick={() => navigate("/cart")} className="btn-outline w-full">
            View Bag
          </button>

          <div className="mt-10 text-xs text-gray-500 leading-relaxed border-t border-gray-200 pt-6">
            <p>Free shipping on orders over {formatPKR(10000)}.</p>
          </div>
        </div>
      </div>

      <section className="mt-24 max-w-2xl">
        <h2 className="section-title text-left">Reviews</h2>

        {isAuthenticated ? (
          <form onSubmit={handleReviewSubmit} className="admin-card p-6 mb-10">
            <p className="text-xs tracking-widest2 uppercase text-gray-500 mb-2">
              {reviews.some((r) => r.customer === customer?._id) ? "Update Your Review" : "Write a Review"}
            </p>
            <StarRating value={myRating} onChange={setMyRating} size={22} />
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="Share your thoughts on the fit, fabric, or quality (optional)"
              rows={3}
              className="input-field mt-4"
            />
            {reviewError && <p className="text-red-600 text-xs mt-2">{reviewError}</p>}
            <button type="submit" disabled={submittingReview} className="btn-primary text-xs py-2 px-6 mt-4 disabled:opacity-50">
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-500 mb-10">
            <Link to="/login" state={{ from: `/product/${id}` }} className="underline hover:text-ehsar-gold">
              Log in
            </Link>{" "}
            to write a review.
          </p>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400">No reviews yet — be the first to share your thoughts.</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-gray-200 pb-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{r.name}</span>
                  <StarRating value={r.rating} size={13} />
                </div>
                {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="section-title">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
