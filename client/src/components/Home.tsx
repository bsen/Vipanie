import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BackendUrl } from "../config";
import { useNavigate } from "react-router-dom";

interface ShopData {
  shopName: string;
  image: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  available: boolean;
  createdAt: string;
}

interface Order {
  id: string;
  fullname: string;
  phone: string;
  address: string;
  pincode: string;
  state: string;
  amount: number;
  createdAt: string;
  product: {
    title: string;
  };
}

const Home: React.FC = () => {
  const token = localStorage.getItem("token");
  let productId = "";
  const navigate = useNavigate();
  const [seeOrders, setSeeOrders] = useState(false);
  const [newImage, setNewImage] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const [shopData, setShopData] = useState<ShopData>({
    shopName: "",
    image: "",
  });
  const [newShopName, setNewShopName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addProductData, setAddProductData] = useState({
    title: "",
    description: "",
    price: "",
    image: null as File | null,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getData();
    fetchProducts();
  }, []);

  const getData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BackendUrl}/api/shop/data`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === 200) {
        setShopData(response.data.data);
      }
    } catch (error) {
      toast.error("Error fetching shop data");
    } finally {
      setIsLoading(false);
    }
  };
  const updateShopName = async () => {
    const lowerCaseNewShopName = newShopName.toLowerCase();

    if (!lowerCaseNewShopName) {
      return toast.warn("Please enter a new shop name");
    }
    if (lowerCaseNewShopName === shopData.shopName.toLowerCase()) {
      return toast.warn("Please enter a different name");
    }
    try {
      const response = await axios.post(
        `${BackendUrl}/api/shop/update-name`,
        { newShopName: lowerCaseNewShopName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === 200) {
        setShopData((prevData) => ({
          ...prevData,
          shopName: lowerCaseNewShopName,
        }));
        setNewShopName("");
        toast.success("Shop name updated successfully");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error updating shop name");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      file.size <= 15 * 1024 * 1024 &&
      file.type.startsWith("image/")
    ) {
      setAddProductData({ ...addProductData, image: file });
    } else {
      toast.error("Only image files under 15 MB are allowed");
    }
  };

  const handleProductChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setAddProductData({ ...addProductData, [name]: value });
  };

  const handleProductSubmit = async () => {
    const { title, description, price, image } = addProductData;
    if (!title || !description || !price || !image) {
      return toast.warn("Please fill out all fields and upload an image");
    }
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("image", image);

      const response = await axios.post(
        `${BackendUrl}/api/shop/add-product`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 200) {
        toast.success("Product added successfully");
        setIsModalOpen(false);
        setAddProductData({
          title: "",
          description: "",
          price: "",
          image: null,
        });
        fetchProducts();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error adding product. Please try again");
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BackendUrl}/api/shop/products`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
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

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BackendUrl}/api/shop/orders`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === 200) {
        setOrders(response.data.data);
      }
    } catch (error) {
      toast.error("Error fetching orders");
    } finally {
      setIsLoading(false);
    }
  };

  const listunlistProduct = async (id: any) => {
    console.log(id);
    const isConfirmed = window.confirm(`Update the state of this product? `);
    if (!isConfirmed) {
      return;
    } else {
      const response = await axios.post(
        `${BackendUrl}/api/shop/product-listunlist`,
        { productId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === 200) {
        window.alert("Product updated successfully");
        fetchProducts();
      }
    }
  };

  const handleViewClick = () => {
    if (!seeOrders) {
      setSeeOrders(true);
      fetchOrders();
    } else {
      setSeeOrders(false);
      fetchProducts();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      file.size <= 15 * 1024 * 1024 &&
      file.type.startsWith("image/")
    ) {
      setNewImage({
        file: file,
        preview: URL.createObjectURL(file),
      });
    } else {
      toast.error("Only image files under 15 MB are allowed");
    }
  };
  const clearNewImage = () => {
    if (newImage) {
      URL.revokeObjectURL(newImage.preview);
    }
    setNewImage(null);
  };
  const updateShopImage = async () => {
    if (!newImage) return;

    try {
      const formData = new FormData();
      formData.append("image", newImage.file);

      const apiResponse = await axios.post(
        `${BackendUrl}/api/shop/update-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (apiResponse.data.status === 200) {
        toast.success("Shop image updated successfully");
        getData();
        URL.revokeObjectURL(newImage.preview);
        setNewImage(null);
      } else {
        toast.error(apiResponse.data.message);
      }
    } catch (error) {
      toast.error("Error updating shop image");
    }
  };

  useEffect(() => {
    if (productId) {
      listunlistProduct(productId);
    }
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div
        onClick={() => {
          const isConfirmed = window.confirm("Are you really want to logout?");
          if (!isConfirmed) {
            return;
          }
          localStorage.clear();
          navigate("/auth");
        }}
        className="absolute cursor-pointer right-4 bottom-4 px-4 py-1 w-fit bg-red-100 text-neutral-800 rounded-full font-light"
      >
        logout
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={
                  newImage ? newImage.preview : shopData.image || "/store.png"
                }
                className="w-16 h-16 rounded-full object-cover"
                alt="Shop profile"
              />
              <label
                htmlFor="image-upload"
                className="absolute bottom-0 right-0"
              >
                <div className="bg-black/60 rounded-full p-1 cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            {newImage && (
              <div className="flex space-x-2">
                <button
                  onClick={clearNewImage}
                  className="bg-neutral-800 text-white h-7 w-7 rounded-full"
                >
                  ✕
                </button>
                <button
                  onClick={updateShopImage}
                  className="bg-neutral-800 text-white h-7 w-7 rounded-full"
                >
                  ✓
                </button>
              </div>
            )}
            <h1 className="text-4xl mb-2 font-bold text-gray-800">
              {shopData.shopName}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={newShopName.toLowerCase()}
              onChange={(e) => setNewShopName(e.target.value.toLowerCase())}
              placeholder="Update shop name"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
            />
            <button
              onClick={updateShopName}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition duration-300"
            >
              Update
            </button>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition duration-300"
              >
                Add Product
              </button>
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={() => window.open(`/${shopData.shopName}`)}
                className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition duration-300"
              >
                Store
              </button>
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={handleViewClick}
                className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition duration-300"
              >
                {seeOrders ? "Products" : "Orders"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {seeOrders ? (
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center mb-8">
            <img src="/order.png" className="w-14" alt="Orders" />
            <h2 className="text-2xl text-gray-800">Orders</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
              >
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {order.product.title}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Customer: {order.fullname}
                  </p>
                  <p className="text-gray-600 mb-2">Phone: {order.phone}</p>
                  <p className="text-gray-600 mb-2">Address: {order.address}</p>
                  <p className="text-gray-600 mb-2">Pincode: {order.pincode}</p>
                  <p className="text-gray-600 mb-2">State: {order.state}</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    Amount: {order.amount} ₹
                  </p>
                  <p className="text-gray-600 mt-2">
                    Order Date: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {orders.length === 0 && (
            <p className="text-gray-600 text-center mt-8 text-xl">
              No orders available.
            </p>
          )}
        </main>
      ) : (
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center mb-8">
            <img src="/products.png" className="w-14" alt="Products" />
            <h2 className="text-2xl text-gray-800">Products</h2>
          </div>
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
                    onClick={() => listunlistProduct(product.id)}
                    className={`cursor-pointer font-light px-4 py-1 rounded-full w-full text-center ${
                      product.available
                        ? "bg-red-50 text-neutral-600 hover:bg-red-100"
                        : "bg-green-50 text-neutral-600 hover:bg-green-100"
                    } transition duration-300`}
                  >
                    {product.available ? "Unlist" : "Add"}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {products.length === 0 && (
            <p className="text-gray-600 text-center mt-8 text-xl">
              No products available. Add your first product!
            </p>
          )}
        </main>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>
            <input
              type="text"
              name="title"
              placeholder="Product Title"
              value={addProductData.title}
              onChange={handleProductChange}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              name="description"
              placeholder="Product Description"
              value={addProductData.description}
              onChange={handleProductChange}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              name="price"
              placeholder="Product Price"
              value={addProductData.price}
              onChange={handleProductChange}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleProductSubmit}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition duration-300"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
