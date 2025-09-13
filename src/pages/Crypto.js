import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import Filters from "../components/Filters";
import TableComponent from "../components/TableComponent";
import { CryptoContext } from "../context/CryptoContext";
import BlockingOverlay from "../components/BlockingOverlay";

const Crypto = () => {
  const { cryptoData, error, getCryptoData } = useContext(CryptoContext);
  const firstLoadPending = !cryptoData;
  const firstLoadFailed  = !cryptoData && !!error?.data;
  const overlayOpen      = firstLoadPending || firstLoadFailed;

   return (
     <section className="w-full md:w-[80%] flex flex-col mt-16 mb-24 px-4">
       <Filters />

      {/* Block the page on first load or first-load error */}
      <BlockingOverlay
        open={overlayOpen}
        variant={firstLoadFailed ? "error" : "loading"}
        message={
          firstLoadFailed
            ? "Sorry, the server is busy now. Please try later."
            : "Loading data…"
        }
        onRetry={() => getCryptoData({ silent: false })}
      />

      {/* After initial load, show a small banner only when overlay is NOT open */}
      {!overlayOpen && error?.data && (
        <div
          role="alert"
          className="mb-3 rounded border border-red-600 bg-red-600/15 px-3 py-2 text-red font-semibold"
        >
          Price feed error. {error.data} Trying again...
        </div>
      )}

       <TableComponent suppressError={overlayOpen} />
       <Outlet />
     </section>
   );
};

export default Crypto;