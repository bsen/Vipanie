import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BackendUrl } from "../config";

interface ShopData {
  id: string;
  shopName: string;
  image: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  createdAt: string;
}

interface OrderData {
  fullname: string;
  phone: string;
  address: string;
  pincode: string;
  state: string;
  productId: string;
}

const Store: React.FC = () => {
  const { store } = useParams<{ store: string }>();
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderData, setOrderData] = useState<OrderData>({
    fullname: "",
    phone: "",
    address: "",
    pincode: "",
    state: "",
    productId: "",
  });

  useEffect(() => {
    fetchShopData();
    fetchProducts();
  }, [store]);

  const fetchShopData = async () => {
    try {
      const response = await axios.post(`${BackendUrl}/api/shop/shop-data`, {
        store,
      });
      if (response.data.status === 200) {
        setShopData(response.data.data);
      }
    } catch (error) {
      toast.error("Error fetching shop data");
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BackendUrl}/api/shop/shop-products`,
        { store }
      );
      if (response.data.status === 200) {
        setProducts(response.data.data);
      }
    } catch (error) {
      toast.error("Error fetching products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderClick = (product: Product) => {
    setSelectedProduct(product);
    setOrderData((prevData) => ({ ...prevData, productId: product.id }));
    setIsModalOpen(true);
  };

  const handleOrderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setOrderData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleOrderSubmit = async () => {
    try {
      const response = await axios.post(
        `${BackendUrl}/api/shop/create-order`,
        orderData
      );
      if (response.data.status === 200) {
        toast.success("Order placed successfully");
        setIsModalOpen(false);
        setOrderData({
          fullname: "",
          phone: "",
          address: "",
          pincode: "",
          state: "",
          productId: "",
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error placing order");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      {shopData && (
        <header className="bg-white shadow-md py-4">
          <div className="container mx-auto px-4 flex items-center space-x-4">
            <img
              src={shopData.image}
              alt={shopData.shopName}
              className="w-16 h-16 object-cover rounded-full"
            />
            <h1 className="text-3xl font-bold text-gray-800">
              {shopData.shopName}
            </h1>
          </div>
        </header>
      )}

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.createdAt}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 flex flex-col h-full"
            >
              <div className="flex-grow">
                <div className="aspect-w-1 aspect-h-1">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="object-cover w-full h-64"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {product.price} ₹
                  </p>
                </div>
              </div>
              <div className="p-4">
                <div
                  onClick={() => {
                    handleOrderClick(product);
                  }}
                  className="text-white cursor-pointer font-extralight bg-indigo-500 px-4 py-1 rounded-full w-full text-center"
                >
                  Order
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <p className="text-gray-600 text-center mt-8 text-xl">
            No products available in this store.
          </p>
        )}
      </main>

      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-4">
              Place Order for {selectedProduct.title}
            </h2>
            <input
              type="text"
              name="fullname"
              placeholder="Full Name"
              value={orderData.fullname}
              onChange={handleOrderChange}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={orderData.phone}
              onChange={handleOrderChange}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={orderData.address}
              onChange={handleOrderChange}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={orderData.pincode}
              onChange={handleOrderChange}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={orderData.state}
              onChange={handleOrderChange}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleOrderSubmit}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition duration-300"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;
