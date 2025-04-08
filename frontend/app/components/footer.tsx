'use client';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">BlocAdobe</h3>
            <p className="text-gray-400">
              Your trusted partner in finding the perfect property using blockchain technology for secure and transparent transactions.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/buy" className="hover:text-white transition-colors">Buy</a></li>
              <li><a href="/rent" className="hover:text-white transition-colors">Rent</a></li>
              <li><a href="/sell" className="hover:text-white transition-colors">Sell</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>123 Blockchain Avenue</li>
              <li>San Francisco, CA 94105</li>
              <li>info@blocadobe.com</li>
              <li>(555) 987-6543</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">Subscribe to get the latest property listings and blockchain updates.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-4 py-2 w-full text-gray-900 rounded-l focus:outline-none"
              />
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} BlocAdobe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;