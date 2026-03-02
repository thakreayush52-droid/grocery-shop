import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  Package,
  Upload
} from 'lucide-react';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import api from '../services/api';
import { formatPrice } from '../utils/currency';
import { formatDate, isExpiringSoon, isExpired } from '../utils/date';
import toast from 'react-hot-toast';

const categories = [
  'Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Beverages', 
  'Snacks', 'Grains', 'Spices', 'Personal Care', 'Household', 'Other'
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    costPrice: '',
    sellingPrice: '',
    price: '',
    stock: '',
    lowStockThreshold: '10',
    expiryDate: ''
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [search, category, showLowStock]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (showLowStock) params.append('lowStock', 'true');

      const response = await api.get(`/products?${params}`);
      setProducts(response.data.products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') data.append(key, formData[key]);
      });
      if (image) {
        data.append('image', image);
        console.log('Uploading image:', image.name);
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product created successfully');
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      costPrice: product.costPrice || product.price,
      sellingPrice: product.sellingPrice || product.price,
      price: product.price,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      costPrice: '',
      sellingPrice: '',
      price: '',
      stock: '',
      lowStockThreshold: '10',
      expiryDate: ''
    });
    setImage(null);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Products</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your inventory</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Button
            variant={showLowStock ? 'danger' : 'outline'}
            onClick={() => setShowLowStock(!showLowStock)}
            className="flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Low Stock
          </Button>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover className="h-full flex flex-col">
                <div className="relative">
                  {product.image ? (
                    <img
                      src={product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-xl"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '';
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-slate-100 dark:bg-slate-700 rounded-t-xl flex items-center justify-center">
                      <Package className="w-16 h-16 text-slate-300" />
                    </div>
                  )}
                  {/* Fallback div for image errors */}
                  <div className="w-full h-48 bg-slate-100 dark:bg-slate-700 rounded-t-xl items-center justify-center hidden">
                    <Package className="w-16 h-16 text-slate-300" />
                  </div>
                  {product.isLowStock && (
                    <Badge variant="danger" className="absolute top-2 right-2">
                      Low Stock
                    </Badge>
                  )}
                  {isExpired(product.expiryDate) && (
                    <Badge variant="danger" className="absolute top-2 left-2">
                      Expired
                    </Badge>
                  )}
                  {isExpiringSoon(product.expiryDate) && !isExpired(product.expiryDate) && (
                    <Badge variant="warning" className="absolute top-2 left-2">
                      Expiring Soon
                    </Badge>
                  )}
                </div>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1">
                    <p className="text-sm text-slate-500">{product.category}</p>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{product.name}</h3>
                    
                    {/* Price Display */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Cost:</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{formatPrice(product.costPrice || product.price)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Selling:</span>
                        <span className="text-lg font-bold text-green-600">{formatPrice(product.sellingPrice || product.price)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700">
                        <span className="text-sm text-slate-500">Profit:</span>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-blue-600">
                            {formatPrice((product.sellingPrice || product.price) - (product.costPrice || product.price))}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">
                            ({product.profitMargin || (((product.sellingPrice || product.price) - (product.costPrice || product.price)) / (product.sellingPrice || product.price) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant={product.stock <= product.lowStockThreshold ? 'danger' : 'success'}>
                        Stock: {product.stock}
                      </Badge>
                      <Badge variant="secondary" size="sm">
                        Value: {formatPrice((product.sellingPrice || product.price) * product.stock)}
                      </Badge>
                    </div>
                    {product.expiryDate && (
                      <p className="text-sm text-slate-500 mt-2">
                        Expires: {formatDate(product.expiryDate)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(product._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No products found</h3>
          <p className="text-slate-500">Try adjusting your filters or add a new product</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cost Price (₹)"
              type="number"
              min="0"
              step="0.01"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              required
            />
            <Input
              label="Selling Price (₹)"
              type="number"
              min="0"
              step="0.01"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stock Quantity"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
            <Input
              label="Low Stock Alert Threshold"
              type="number"
              min="1"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
            />
          </div>
          <div>
            <Input
              label="Expiry Date"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
