import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Trash2, 
  Printer,
  ShoppingCart,
  CreditCard,
  Wallet,
  Smartphone
} from 'lucide-react';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import api from '../services/api';
import { formatPrice, calculateGST } from '../utils/currency';
import { formatDate } from '../utils/date';
import toast from 'react-hot-toast';

const paymentModes = [
  { value: 'Cash', label: 'Cash', icon: Wallet },
  { value: 'UPI', label: 'UPI', icon: Smartphone },
  { value: 'Card', label: 'Card', icon: CreditCard },
  { value: 'Other', label: 'Other', icon: ShoppingCart }
];

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [gstRate, setGstRate] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showInvoice, setShowInvoice] = useState(null);

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales');
      setSales(response.data.sales);
    } catch (error) {
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.products);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) &&
    p.stock > 0
  );

  const addToCart = () => {
    if (!selectedProduct || quantity < 1) {
      toast.error('Please select a product and quantity');
      return;
    }

    if (quantity > selectedProduct.stock) {
      toast.error(`Only ${selectedProduct.stock} items available`);
      return;
    }

    const existingItem = cart.find(item => item.product === selectedProduct._id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.product === selectedProduct._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        product: selectedProduct._id,
        name: selectedProduct.name,
        price: selectedProduct.sellingPrice || selectedProduct.price,
        quantity: quantity
      }]);
    }

    setSelectedProduct(null);
    setSearchProduct('');
    setQuantity(1);
    toast.success('Added to cart');
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const { gstAmount, total } = calculateGST(subtotal, gstRate);
    return { subtotal, gstAmount, total };
  };

  const handleCreateSale = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const { subtotal, gstAmount, total } = calculateTotals();
      
      const saleData = {
        items: cart.map(item => ({
          product: item.product,
          quantity: item.quantity
        })),
        paymentMode,
        gstRate,
        customerName,
        customerPhone
      };

      const response = await api.post('/sales', saleData);
      toast.success('Sale completed successfully');
      setShowInvoice(response.data);
      setIsModalOpen(false);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setGstRate(0);
      fetchSales();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create sale');
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const { subtotal, gstAmount, total } = calculateTotals();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sales</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage sales and create invoices</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Sale
        </Button>
      </div>

      {/* Sales List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Sales</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Invoice</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Items</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Payment</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Total</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <motion.tr
                      key={sale._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3 px-4 font-medium">{sale.invoiceNumber}</td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(sale.createdAt)}</td>
                      <td className="py-3 px-4">{sale.items.length} items</td>
                      <td className="py-3 px-4">
                        <Badge variant="primary">{sale.paymentMode}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">{formatPrice(sale.total)}</td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowInvoice(sale)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {sales.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No sales recorded yet
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Sale Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Sale"
        size="xl"
        footer={
          <div className="flex justify-between items-center w-full">
            <div className="text-lg font-bold">
              Total: {formatPrice(total)}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSale} disabled={cart.length === 0}>
                Complete Sale
              </Button>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Selection */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 dark:text-white">Add Products</h4>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search products..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="pl-10"
              />
              {searchProduct && filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredProducts.map(product => (
                    <button
                      key={product._id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setSearchProduct(product.name);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-slate-500">{formatPrice(product.sellingPrice || product.price)} • Stock: {product.stock}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedProduct && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  max={selectedProduct.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-24"
                />
                <Button onClick={addToCart} className="flex-1">
                  Add to Cart
                </Button>
              </div>
            )}

            {/* Cart */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-2">
              <h5 className="font-medium text-slate-900 dark:text-white">Cart ({cart.length} items)</h5>
              {cart.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.quantity} x {formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <p className="text-center text-slate-500 py-4">Cart is empty</p>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 dark:text-white">Payment Details</h4>
            
            <Input
              label="Customer Name (Optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            
            <Input
              label="Customer Phone (Optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Payment Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {paymentModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.value}
                      onClick={() => setPaymentMode(mode.value)}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                        paymentMode === mode.value
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                GST Rate (%)
              </label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              >
                <option value={0}>No GST</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
                <option value={28}>28%</option>
              </select>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              {gstRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">GST ({gstRate}%)</span>
                  <span className="font-medium">{formatPrice(gstAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 dark:border-slate-700 pt-2">
                <span>Total</span>
                <span className="text-green-600">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Invoice Modal */}
      <Modal
        isOpen={!!showInvoice}
        onClose={() => setShowInvoice(null)}
        title="Invoice"
        footer={
          <Button onClick={printInvoice} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print Invoice
          </Button>
        }
      >
        {showInvoice && (
          <div className="print:p-8" id="invoice">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">GROCERY SHOP</h2>
              <p className="text-slate-500">Digital Twin Store</p>
            </div>
            
            <div className="flex justify-between mb-6 text-sm">
              <div>
                <p><strong>Invoice:</strong> {showInvoice.invoiceNumber}</p>
                <p><strong>Date:</strong> {formatDate(showInvoice.createdAt)}</p>
              </div>
              <div className="text-right">
                {showInvoice.customerName && <p><strong>Customer:</strong> {showInvoice.customerName}</p>}
                {showInvoice.customerPhone && <p><strong>Phone:</strong> {showInvoice.customerPhone}</p>}
              </div>
            </div>

            <table className="w-full mb-6">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="text-left py-2">Item</th>
                  <th className="text-center py-2">Qty</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {showInvoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-slate-200">
                    <td className="py-2">{item.product?.name || 'Product'}</td>
                    <td className="text-center py-2">{item.quantity}</td>
                    <td className="text-right py-2">{formatPrice(item.price)}</td>
                    <td className="text-right py-2">{formatPrice(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t-2 border-slate-300 pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(showInvoice.subtotal)}</span>
              </div>
              {showInvoice.gstAmount > 0 && (
                <div className="flex justify-between">
                  <span>GST ({showInvoice.gstRate}%)</span>
                  <span>{formatPrice(showInvoice.gstAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>{formatPrice(showInvoice.total)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500 pt-2">
                <span>Payment Mode</span>
                <span>{showInvoice.paymentMode}</span>
              </div>
            </div>

            <div className="text-center mt-8 text-sm text-slate-500">
              <p>Thank you for shopping with us!</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Sales;
