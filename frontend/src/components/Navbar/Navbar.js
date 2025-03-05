import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-[--ctp-mocha-surface0] shadow-md p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and Site Name */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo/site-logo.webp"
            alt="Library Logo"
            width={50}
            height={50}
          />
          <span className="text-[--ctp-mocha-text] text-xl font-bold">
            LibRead
          </span>
        </Link>

        {/* Links */}
        <div className="flex gap-6">
          <Link
            href="/login"
            className="bg-[--ctp-mocha-green] text-[--ctp-mocha-base] px-4 py-2 rounded-lg hover:bg-[--ctp-mocha-blue] transition duration-300 font-semibold"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="bg-[--ctp-mocha-green] text-[--ctp-mocha-base] px-4 py-2 rounded-lg hover:bg-[--ctp-mocha-blue] transition duration-300 font-semibold"
          >
            Signup
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
