export default function Footer() {
  return (
    <footer className="bg-cream-warm dark:bg-charcoal border-t border-emerald-500/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-500 mb-4">EMERALD</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-xs">
              Premium e-commerce experience with a touch of elegance and glossy design.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><a href="/" className="hover:text-emerald-500">Home</a></li>
              <li><a href="/products" className="hover:text-emerald-500">Products</a></li>
              <li><a href="/cart" className="hover:text-emerald-500">Cart</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              {/* Social icons would go here */}
              <span className="text-gray-600 dark:text-gray-400">Twitter</span>
              <span className="text-gray-600 dark:text-gray-400">Instagram</span>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-emerald-500/10 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Emerald E-commerce. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
