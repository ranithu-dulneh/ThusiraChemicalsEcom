import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const ProductCard = ({ product, addToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const handleVariantChange = (e) => {
    const variant = product.variants.find(v => v.name === e.target.value);
    setSelectedVariant(variant);
  };

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
       // Should not happen due to useEffect default, but safety check
       return;
    }

    addToCart({
      ...product,
      selectedVariant: selectedVariant, // Pass the specific variant selected
      price: currentPrice // Ensure the price added to cart is the variant price
    });
  };

  return (
    <div className="col">
      <div className="card h-100 shadow-sm">
        <img
          src={product.image || "https://via.placeholder.com/300?text=No+Image"}
          className="card-img-top"
          alt={product.name}
          style={{ height: '250px', objectFit: 'cover' }}
        />
        <div className="card-body d-flex flex-column">
          <h3 className="card-title text-success">{product.name}</h3>
          <p className="card-text fs-5">{product.description}</p>

          <div className="mt-auto">
            {product.variants && product.variants.length > 0 ? (
              <div className="mb-3">
                <label className="form-label fw-bold">Select Size:</label>
                <select
                  className="form-select form-select-lg"
                  onChange={handleVariantChange}
                  value={selectedVariant ? selectedVariant.name : ''}
                >
                  {product.variants.map((variant, idx) => (
                    <option key={idx} value={variant.name}>
                      {variant.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <p className="card-text fw-bold fs-4">Rs. {currentPrice}</p>
            <button
              onClick={handleAddToCart}
              className="btn btn-success w-100 btn-lg"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-success" role="status" style={{width: "3rem", height: "3rem"}}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 fs-4">Loading Products...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Our Products</h2>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} addToCart={addToCart} />
        ))}
      </div>
      {products.length === 0 && !loading && (
         <div className="text-center mt-5">
           <p>No products found.</p>
         </div>
      )}
    </div>
  );
};

export default Home;