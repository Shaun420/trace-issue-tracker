import { Link } from "react-router-dom";
import { FiBell, FiUser, FiSearch } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import logo from "../assets/logo.png";

function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 fixed w-full top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Trace</h1> */}
		  <Link to="/" aria-label="Trace home" className="flex items-center">
			<img
				src={logo}
				alt="Trace logo"
				className="block h-8 w-auto dark:hidden"
			/>
			<img
				src={logo}
				alt="Trace logo"
				className="hidden h-8 w-auto dark:block"
			/>
		  </Link>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search feedback..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-96
			   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <FiUser size={20} />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;