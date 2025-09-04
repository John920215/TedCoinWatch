import React from "react";
import { Link } from "react-router-dom";
import logoSvg from "../assets/logo.svg";

const Logo = () => {
  return (
    <Link
      to="/"
      className="
        absolute top-6 left-6 no-underline
        flex items-center gap-2
      "
    >
      <img src={logoSvg} alt="CryptoBucks" className="h-12 w-12" />
      <span
        className="
          text-xl font-extrabold
          bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500
          text-transparent bg-clip-text
          drop-shadow-[1px_1px_2px_rgba(0,0,0,0.5)]
          tracking-wide
        "
      >
        TED's CoinDash
      </span>
    </Link>
  );
};

export default Logo;
