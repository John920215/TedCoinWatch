/* eslint-disable react-hooks/exhaustive-deps */
import {
  createContext,
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
} from "react";
import useInterval from "../hooks/useInterval";

export const CryptoContext = createContext({});

export const CryptoProvider = ({ children }) => {
  // table data & detail/search data
  const [cryptoData, setCryptoData] = useState();
  const [searchData, setSearchData] = useState();
  const [coinData, setCoinData] = useState();

  // filters / paging
  const [coinSearch, setCoinSearch] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [sortBy, setSortBy] = useState("market_cap_desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(250);
  const [perPage, setPerPage] = useState(10);

  // unified error object (matches existing shape)
  const [error, setError] = useState({ data: "", coinData: "", search: "" });

  // live refresh (coin list)
  const [refreshMs, setRefreshMs] = useState(15000);
  const listInFlight = useRef(false);
  const listCtrlRef = useRef(null); // AbortController for list fetches

  // ---- helpers -------------------------------------------------------------

  async function fetchJsonWithAbort(url, controller) {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      let body = {};
      try {
        body = await res.json();
      } catch {}
      const msg = body?.error || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return res.json();
  }

  // ---- API calls -----------------------------------------------------------

  const getCryptoData = async (opts = { silent: false }) => {
    setError((prev) => ({ ...prev, data: "" }));
    if (!opts.silent) {
      setCryptoData(undefined); // triggers initial loading state/overlay
      setTotalPages(13220);
    }

    try {
      // cancel any stale in-flight request
      if (listCtrlRef.current) {
        try {
          listCtrlRef.current.abort();
        } catch {}
      }
      const controller = new AbortController();
      listCtrlRef.current = controller;

      // client-side timeout so a slow request can't block future ticks
      const timeoutId = setTimeout(() => controller.abort("timeout"), 12000);

      const ts = Date.now(); // cache-buster so Offline/Slow 3G won't reuse cache
      const url =
        `https://api.coingecko.com/api/v3/coins/markets` +
        `?vs_currency=${currency}&ids=${coinSearch}&order=${sortBy}` +
        `&per_page=${perPage}&page=${page}&sparkline=false` +
        `&price_change_percentage=1h%2C24h%2C7d&_=${ts}`;

      const data = await fetchJsonWithAbort(url, controller);

      clearTimeout(timeoutId);
      if (listCtrlRef.current === controller) listCtrlRef.current = null;

      setCryptoData(data);
      setError((prev) => ({ ...prev, data: "" }));
    } catch (e) {
      // Abort/timeout: treat as transient; keep old data visible
      if (e?.name === "AbortError" || e === "timeout") {
        setError((prev) => ({ ...prev, data: "Network slow, retrying…" }));
      } else {
        console.error(e);
        setError((prev) => ({
          ...prev,
          data: e?.message || "Failed to load data",
        }));
      }
    }
  };

  const getCoinData = async (coinid) => {
    setCoinData(undefined);
    try {
      const ts = Date.now();
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinid}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=true&sparkline=false&_=${ts}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCoinData(data);
      setError((prev) => ({ ...prev, coinData: "" }));
    } catch (e) {
      console.error(e);
      setError((prev) => ({
        ...prev,
        coinData: e?.message || "Failed to load coin",
      }));
    }
  };

  const getSearchResult = async (query) => {
    try {
      const ts = Date.now();
      const res = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${query}&_=${ts}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSearchData(data.coins);
      setError((prev) => ({ ...prev, search: "" }));
    } catch (e) {
      console.error(e);
      setError((prev) => ({
        ...prev,
        search: e?.message || "Search failed",
      }));
    }
  };

  // ---- misc ---------------------------------------------------------------

  const resetFunction = () => {
    setPage(1);
    setCoinSearch("");
  };

  // initial load on filter changes
  useLayoutEffect(() => {
    getCryptoData();
  }, [coinSearch, currency, sortBy, page, perPage]);

  // silent auto-refresh (no flicker)
  useInterval(async () => {
    if (listInFlight.current) return;
    listInFlight.current = true;
    try {
      await getCryptoData({ silent: true });
    } finally {
      listInFlight.current = false;
    }
  }, refreshMs);

  // wake up immediately when network comes back or tab becomes visible
  useEffect(() => {
    const onOnline = () => {
      if (navigator.onLine) getCryptoData({ silent: false });
    };
    const onVis = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        getCryptoData({ silent: false });
      }
    };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <CryptoContext.Provider
      value={{
        cryptoData,
        searchData,
        getSearchResult,
        setCoinSearch,
        setSearchData,
        currency,
        setCurrency,
        sortBy,
        setSortBy,
        page,
        setPage,
        totalPages,
        resetFunction,
        setPerPage,
        perPage,
        getCoinData,
        coinData,
        error,
        refreshMs,
        setRefreshMs,
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
};