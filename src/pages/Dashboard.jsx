import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  // Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    image: '',
    description: '',
    variants: []
  });

  // Temp state for adding a variant
  const [variantInput, setVariantInput] = useState({ name: '', price: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/login');
      } else {
        setUser(currentUser);
        fetchProducts();
        fetchOrders();
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchOrders = async () => {
    const q = query(collection(db, "orders"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const addVariant = (e) => {
    e.preventDefault();
    if (!variantInput.name || !variantInput.price) {
      alert("Please enter both variant name (e.g., 500ml) and price.");
      return;
    }
    setNewProduct({
      ...newProduct,
      variants: [...newProduct.variants, variantInput]
    });
    setVariantInput({ name: '', price: '' });
  };

  const removeVariant = (index) => {
    const updatedVariants = [...newProduct.variants];
    updatedVariants.splice(index, 1);
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    // Validate: Needs name and at least one variant OR a base price (handling legacy/simple too)
    // But per requirement "Add variants", we enforce at least one variant for new products if we want strictness.
    // Let's rely on the variants array.
    if (!newProduct.name) {
       alert("Product Name is required.");
       return;
    }

    // Check if we have variants. If not, maybe use a "Default" variant if user tries to submit?
    // Or just alert them.
    if (newProduct.variants.length === 0) {
      alert("Please add at least one variant (e.g., Size and Price).");
      return;
    }

    try {
      await addDoc(collection(db, "products"), newProduct);
      setNewProduct({ name: '', category: '', image: '', description: '', variants: [] });
      setVariantInput({ name: '', price: '' });
      fetchProducts();
      alert("Product Added!");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product.");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  if (!user) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Manage Products
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            View Orders
          </button>
        </li>
      </ul>

      {activeTab === 'products' && (
        <div>
          <div className="card mb-4">
            <div className="card-header bg-success text-white">Add New Product</div>
            <div className="card-body">
              <form onSubmit={handleAddProduct}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Product Name</label>
                    <input type="text" className="form-control" placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <input type="text" className="form-control" placeholder="Category" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                  </div>
                  <div className="col-md-12">
                     <label className="form-label">Description</label>
                    <textarea className="form-control" placeholder="Description" rows="2" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}></textarea>
                  </div>
                  <div className="col-md-12">
                     <label className="form-label">Image URL</label>
                    <input type="text" className="form-control" placeholder="Image URL" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
                  </div>

                  {/* Variants Section */}
                  <div className="col-12">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h5 className="card-title">Product Variants</h5>
                        <div className="d-flex gap-2 mb-3 align-items-end">
                          <div className="flex-grow-1">
                            <label className="form-label small">Size/Variant (e.g. 1L, 500g)</label>
                            <input
                              type="text"
                              className="form-control"
                              value={variantInput.name}
                              onChange={e => setVariantInput({...variantInput, name: e.target.value})}
                              placeholder="1L"
                            />
                          </div>
                          <div className="flex-grow-1">
                            <label className="form-label small">Price (Rs)</label>
                            <input
                              type="number"
                              className="form-control"
                              value={variantInput.price}
                              onChange={e => setVariantInput({...variantInput, price: e.target.value})}
                              placeholder="1500"
                            />
                          </div>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={addVariant}
                          >
                            Add Variant
                          </button>
                        </div>

                        {newProduct.variants.length > 0 && (
                          <ul className="list-group">
                            {newProduct.variants.map((v, idx) => (
                              <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                <span>{v.name} - Rs. {v.price}</span>
                                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeVariant(idx)}>Remove</button>
                              </li>
                            ))}
                          </ul>
                        )}
                        {newProduct.variants.length === 0 && <p className="text-muted small">At least one variant is required.</p>}
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <button type="submit" className="btn btn-success w-100 btn-lg">Save Product</button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <h3>Product List</h3>
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price / Variants</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>
                      {product.variants && product.variants.length > 0 ? (
                        <ul className="list-unstyled mb-0 small">
                          {product.variants.map((v, i) => (
                            <li key={i}>{v.name}: Rs. {v.price}</li>
                          ))}
                        </ul>
                      ) : (
                        // Fallback for old products with single price
                         `Rs. ${product.price}`
                      )}
                    </td>
                    <td>
                      <button onClick={() => handleDeleteProduct(product.id)} className="btn btn-danger btn-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h3>Recent Orders</h3>
           <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Items</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.date?.toDate().toLocaleDateString()}</td>
                    <td>{order.customer.name}</td>
                    <td>{order.customer.phone}</td>
                    <td>{order.customer.address}</td>
                    <td>
                      <ul className="list-unstyled mb-0">
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                             - {item.name}
                             {item.selectedVariant ? ` (${item.selectedVariant.name})` : ''}
                             : Rs. {item.selectedVariant ? item.selectedVariant.price : item.price}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="fw-bold">Rs. {order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;