import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Cart = ({ cart, setCart }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const totalPrice = cart.reduce((total, item) => total + Number(item.price), 0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "orders"), {
        customer: formData,
        items: cart,
        total: totalPrice,
        date: serverTimestamp(),
        status: "pending"
      });
      alert("Order Confirmed! We will contact you soon.");
      setCart([]); // Clear cart
      navigate('/');
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Your Shopping Cart</h2>

      {cart.length === 0 ? (
        <div className="alert alert-info fs-5">Your cart is empty.</div>
      ) : (
        <div className="row">
          <div className="col-lg-8">
            <div className="list-group mb-4">
              {cart.map((item, index) => (
                <div key={index} className="list-group-item d-flex justify-content-between align-items-center p-3">
                  <div>
                    <h5 className="mb-1">{item.name}</h5>
                    <p className="mb-0 text-muted">
                      {item.selectedVariant ? (
                        <span className="badge bg-secondary me-2">{item.selectedVariant.name}</span>
                      ) : null}
                      {item.description}
                    </p>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="fw-bold fs-5 me-3">Rs. {item.price}</span>
                    <button onClick={() => removeFromCart(index)} className="btn btn-outline-danger btn-sm">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="card mb-4">
              <div className="card-body">
                <h4 className="card-title text-end">Total: Rs. {totalPrice}</h4>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header bg-success text-white">
                <h4 className="mb-0">Checkout</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fs-5">Full Name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fs-5">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control form-control-lg"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fs-5">Delivery Address</label>
                    <textarea
                      className="form-control form-control-lg"
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-success w-100 btn-lg"
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : 'Confirm Order'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;