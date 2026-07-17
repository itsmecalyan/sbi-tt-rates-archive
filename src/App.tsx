import { useState, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info
} from 'lucide-react';
import { parseRateCSV, parseMetadataCSV } from './csvParser';
import { RateRow, MetadataRow, CurrencyPairInfo, RateField, CurrencyStats } from './types';

// Hardcoded currency directory mapping with user-friendly names and flags
const CURRENCY_PAIRS: CurrencyPairInfo[] = [
  { code: 'USD-INR', baseCurrency: 'USD', quoteCurrency: 'INR', label: 'US Dollar (USD-INR)', flag: '🇺🇸' },
  { code: 'EUR-INR', baseCurrency: 'EUR', quoteCurrency: 'INR', label: 'Euro (EUR-INR)', flag: '🇪🇺' },
  { code: 'GBP-INR', baseCurrency: 'GBP', quoteCurrency: 'INR', label: 'British Pound (GBP-INR)', flag: '🇬🇧' },
  { code: 'JPY-INR', baseCurrency: 'JPY', quoteCurrency: 'INR', label: 'Japanese Yen (JPY-INR)', flag: '🇯🇵' },
  { code: 'AED-INR', baseCurrency: 'AED', quoteCurrency: 'INR', label: 'UAE Dirham (AED-INR)', flag: '🇦🇪' },
  { code: 'AUD-INR', baseCurrency: 'AUD', quoteCurrency: 'INR', label: 'Australian Dollar (AUD-INR)', flag: '🇦🇺' },
  { code: 'BDT-INR', baseCurrency: 'BDT', quoteCurrency: 'INR', label: 'Bangladesh Taka (BDT-INR)', flag: '🇧🇩' },
  { code: 'BHD-INR', baseCurrency: 'BHD', quoteCurrency: 'INR', label: 'Bahraini Dinar (BHD-INR)', flag: '🇧🇭' },
  { code: 'CAD-INR', baseCurrency: 'CAD', quoteCurrency: 'INR', label: 'Canadian Dollar (CAD-INR)', flag: '🇨🇦' },
  { code: 'CHF-INR', baseCurrency: 'CHF', quoteCurrency: 'INR', label: 'Swiss Franc (CHF-INR)', flag: '🇨🇭' },
  { code: 'CNY-INR', baseCurrency: 'CNY', quoteCurrency: 'INR', label: 'Chinese Yuan (CNY-INR)', flag: '🇨🇳' },
  { code: 'DKK-INR', baseCurrency: 'DKK', quoteCurrency: 'INR', label: 'Danish Krone (DKK-INR)', flag: '🇩🇰' },
  { code: 'HKD-INR', baseCurrency: 'HKD', quoteCurrency: 'INR', label: 'Hong Kong Dollar (HKD-INR)', flag: '🇭🇰' },
  { code: 'IDR-INR', baseCurrency: 'IDR', quoteCurrency: 'INR', label: 'Indonesian Rupiah (IDR-INR)', flag: '🇮🇩' },
  { code: 'KES-INR', baseCurrency: 'KES', quoteCurrency: 'INR', label: 'Kenyan Shilling (KES-INR)', flag: '🇰🇪' },
  { code: 'KRW-INR', baseCurrency: 'KRW', quoteCurrency: 'INR', label: 'Korean Won (KRW-INR)', flag: '🇰🇷' },
  { code: 'KWD-INR', baseCurrency: 'KWD', quoteCurrency: 'INR', label: 'Kuwaiti Dinar (KWD-INR)', flag: '🇰🇼' },
  { code: 'LKR-INR', baseCurrency: 'LKR', quoteCurrency: 'INR', label: 'Sri Lankan Rupee (LKR-INR)', flag: '🇱🇰' },
  { code: 'MYR-INR', baseCurrency: 'MYR', quoteCurrency: 'INR', label: 'Malaysian Ringgit (MYR-INR)', flag: '🇲🇾' },
  { code: 'NOK-INR', baseCurrency: 'NOK', quoteCurrency: 'INR', label: 'Norwegian Krone (NOK-INR)', flag: '🇳🇴' },
  { code: 'NZD-INR', baseCurrency: 'NZD', quoteCurrency: 'INR', label: 'New Zealand Dollar (NZD-INR)', flag: '🇳🇿' },
  { code: 'OMR-INR', baseCurrency: 'OMR', quoteCurrency: 'INR', label: 'Oman Rial (OMR-INR)', flag: '🇴🇲' },
  { code: 'PKR-INR', baseCurrency: 'PKR', quoteCurrency: 'INR', label: 'Pakistan Rupee (PKR-INR)', flag: '🇵🇰' },
  { code: 'QAR-INR', baseCurrency: 'QAR', quoteCurrency: 'INR', label: 'Qatar Rial (QAR-INR)', flag: '🇶🇦' },
  { code: 'RUB-INR', baseCurrency: 'RUB', quoteCurrency: 'INR', label: 'Russian Ruble (RUB-INR)', flag: '🇷🇺' },
  { code: 'SAR-INR', baseCurrency: 'SAR', quoteCurrency: 'INR', label: 'Saudi Riyal (SAR-INR)', flag: '🇸🇦' },
  { code: 'SEK-INR', baseCurrency: 'SEK', quoteCurrency: 'INR', label: 'Swedish Krona (SEK-INR)', flag: '🇸🇪' },
  { code: 'SGD-INR', baseCurrency: 'SGD', quoteCurrency: 'INR', label: 'Singapore Dollar (SGD-INR)', flag: '🇸🇬' },
  { code: 'THB-INR', baseCurrency: 'THB', quoteCurrency: 'INR', label: 'Thai Baht (THB-INR)', flag: '🇹🇭' },
  { code: 'TRY-INR', baseCurrency: 'TRY', quoteCurrency: 'INR', label: 'Turkish Lira (TRY-INR)', flag: '🇹🇷' },
  { code: 'ZAR-INR', baseCurrency: 'ZAR', quoteCurrency: 'INR', label: 'South African Rand (ZAR-INR)', flag: '🇿🇦' }
];

const RATE_FIELDS: { value: RateField; label: string }[] = [
  { value: 'tt_buying', label: 'TT Buying' },
  { value: 'tt_selling', label: 'TT Selling' },
  { value: 'bill_buying', label: 'Bill Buying' },
  { value: 'bill_selling', label: 'Bill Selling' },
  { value: 'card_buying', label: 'Card Buying' },
  { value: 'card_selling', label: 'Card Selling' },
  { value: 'cn_buying', label: 'CN Buying' },
  { value: 'cn_selling', label: 'CN Selling' }
];

// Helper to format date strings readably
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

export default function App() {
  // Theme State - Default to Light Mode, optional Dark Mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  // Data States
  const [latestMetadata, setLatestMetadata] = useState<MetadataRow | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD-INR');
  const [rates, setRates] = useState<RateRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States - Default to show ALL data initially
  const [dateRangeOption, setDateRangeOption] = useState<string>('ALL'); // 1M, 6M, 1Y, ALL, CUSTOM
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedFields, setSelectedFields] = useState<RateField[]>(['tt_buying', 'tt_selling']);
  const [tableSearch, setTableSearch] = useState<string>('');

  // Finder Date State (Highlighted feature)
  const [finderDate, setFinderDate] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 25;

  // Sorting State
  const [sortField, setSortField] = useState<keyof RateRow>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Calculator States
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcDirection, setCalcDirection] = useState<'FC_TO_INR' | 'INR_TO_FC'>('FC_TO_INR');
  const [calcRateType, setCalcRateType] = useState<RateField>('tt_buying');
  const [calcDate, setCalcDate] = useState<string>('');

  // Top 4 Currency KPI Cache
  const [kpiRates, setKpiRates] = useState<Record<string, { latest: number | null; change: number | null }>>({});

  // Sync dark mode HTML class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  // Fetch Metadata on Load
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch('/rates/_metadata.csv');
        if (!response.ok) throw new Error('Failed to fetch metadata file');
        const csvText = await response.text();
        const parsed = parseMetadataCSV(csvText);

        // Find the latest successful scrape
        const successful = parsed.filter(m => m.status === 'success');
        if (successful.length > 0) {
          // Sort descending by date
          successful.sort((a, b) => b.date.localeCompare(a.date));
          setLatestMetadata(successful[0]);
        }
      } catch (err) {
        console.error('Error fetching metadata:', err);
      }
    };

    fetchMetadata();
  }, []);

  // Fetch rates for the selected currency
  useEffect(() => {
    const fetchRatesForCurrency = async () => {
      setLoading(true);
      setError(null);
      
      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => 2020 + i);
      
      let allRows: RateRow[] = [];
      
      try {
        // Fetch files in parallel and catch failures gracefully
        const fetchPromises = years.map(async (year) => {
          const url = `/rates/${selectedCurrency}/${year}.csv`;
          try {
            const res = await fetch(url);
            if (!res.ok) return null;
            const text = await res.text();
            return parseRateCSV(text);
          } catch (e) {
            return null;
          }
        });

        const results = await Promise.all(fetchPromises);
        results.forEach((rows) => {
          if (rows) {
            allRows = [...allRows, ...rows];
          }
        });

        if (allRows.length === 0) {
          throw new Error('No historical rate data found for ' + selectedCurrency);
        }

        // Sort by date ascending initially
        allRows.sort((a, b) => a.date.localeCompare(b.date));
        setRates(allRows);

        // Default calcDate and finderDate to the latest available rate date
        if (allRows.length > 0) {
          const latestD = allRows[allRows.length - 1].date;
          setCalcDate(latestD);
          setFinderDate(latestD);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading rates.');
      } finally {
        setLoading(false);
      }
    };

    fetchRatesForCurrency();
  }, [selectedCurrency]);

  // Load KPI rates for USD, EUR, GBP, JPY on start
  useEffect(() => {
    const fetchKpis = async () => {
      const keys = ['USD-INR', 'EUR-INR', 'GBP-INR', 'JPY-INR'];
      const currentYear = new Date().getFullYear();
      const tempKpis: Record<string, { latest: number | null; change: number | null }> = {};

      await Promise.all(
        keys.map(async (pair) => {
          try {
            const res = await fetch(`/rates/${pair}/${currentYear}.csv`);
            if (!res.ok) return;
            const text = await res.text();
            const rows = parseRateCSV(text);
            if (rows.length > 0) {
              rows.sort((a, b) => b.date.localeCompare(a.date));
              const latestVal = rows[0].tt_buying;
              let change = null;
              if (rows.length > 1 && latestVal && rows[1].tt_buying) {
                change = latestVal - rows[1].tt_buying;
              }
              tempKpis[pair] = { latest: latestVal, change };
            }
          } catch (e) {
            // Ignore
          }
        })
      );
      setKpiRates(tempKpis);
    };

    fetchKpis();
  }, []);

  // Sync date ranges based on selection options
  const resolvedDateRange = useMemo(() => {
    if (rates.length === 0) return { start: '', end: '' };
    
    const latestDateStr = rates[rates.length - 1].date;
    const latestDate = new Date(latestDateStr);
    let startDate = new Date(latestDate);

    switch (dateRangeOption) {
      case '1M':
        startDate.setMonth(latestDate.getMonth() - 1);
        break;
      case '6M':
        startDate.setMonth(latestDate.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(latestDate.getFullYear() - 1);
        break;
      case 'ALL':
      default:
        return { start: rates[0].date, end: latestDateStr };
    }

    const startStr = startDate.toISOString().split('T')[0];
    return { start: startStr, end: latestDateStr };
  }, [rates, dateRangeOption]);

  const activeStartDate = dateRangeOption === 'CUSTOM' ? customStartDate : resolvedDateRange.start;
  const activeEndDate = dateRangeOption === 'CUSTOM' ? customEndDate : resolvedDateRange.end;

  // Filter rates for current selection
  const filteredRates = useMemo(() => {
    return rates.filter((row) => {
      const dateOk = (!activeStartDate || row.date >= activeStartDate) && 
                      (!activeEndDate || row.date <= activeEndDate);
      return dateOk;
    });
  }, [rates, activeStartDate, activeEndDate]);

  // Compute Statistics for the filtered range
  const stats = useMemo<CurrencyStats>(() => {
    if (filteredRates.length === 0) {
      return { latestRate: null, prevRate: null, percentageChange: null, highest: null, lowest: null, average: null };
    }

    const latest = filteredRates[filteredRates.length - 1];
    const prev = filteredRates.length > 1 ? filteredRates[filteredRates.length - 2] : null;
    
    const latestRate = latest.tt_buying;
    const prevRate = prev ? prev.tt_buying : null;

    let percentageChange = null;
    if (latestRate && prevRate) {
      percentageChange = ((latestRate - prevRate) / prevRate) * 100;
    }

    let sum = 0;
    let count = 0;
    let highest = -Infinity;
    let lowest = Infinity;

    filteredRates.forEach((r) => {
      if (r.tt_buying !== null) {
        sum += r.tt_buying;
        count++;
        if (r.tt_buying > highest) highest = r.tt_buying;
        if (r.tt_buying < lowest) lowest = r.tt_buying;
      }
    });

    return {
      latestRate,
      prevRate,
      percentageChange,
      highest: highest === -Infinity ? null : highest,
      lowest: lowest === Infinity ? null : lowest,
      average: count > 0 ? sum / count : null
    };
  }, [filteredRates]);

  // Handle dynamic currency details
  const currencyInfo = useMemo(() => {
    return CURRENCY_PAIRS.find(c => c.code === selectedCurrency) || CURRENCY_PAIRS[0];
  }, [selectedCurrency]);

  // Find rates for the target finder date (with weekend preceding day fallback)
  const finderResult = useMemo(() => {
    if (!finderDate || rates.length === 0) return null;
    let match = rates.find(r => r.date === finderDate);
    let isFallback = false;

    if (!match) {
      // Find nearest preceding date (for weekend/holiday selection)
      const precedingRates = rates.filter(r => r.date < finderDate);
      if (precedingRates.length > 0) {
        match = precedingRates[precedingRates.length - 1];
        isFallback = true;
      }
    }

    return match ? { match, isFallback } : null;
  }, [finderDate, rates]);

  // ECharts visualization option setup
  const chartOption = useMemo(() => {
    if (filteredRates.length === 0) return {};

    const dates = filteredRates.map(r => r.date);
    
    // Setup series based on selected fields
    const series = selectedFields.map((field) => {
      const fieldInfo = RATE_FIELDS.find(f => f.value === field);
      return {
        name: fieldInfo?.label || field,
        type: 'line',
        data: filteredRates.map(r => r[field]),
        smooth: true,
        showSymbol: filteredRates.length < 50,
        symbolSize: 6,
        lineStyle: {
          width: 2.5
        },
        areaStyle: field === 'tt_buying' ? {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(2, 132, 199, 0.15)' },
              { offset: 1, color: darkMode ? 'rgba(59, 130, 246, 0.0)' : 'rgba(2, 132, 199, 0.0)' }
            ]
          }
        } : undefined
      };
    });

    const isDark = darkMode;

    return {
      backgroundColor: 'transparent',
      color: isDark 
        ? ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']
        : ['#0284c7', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#0c0c0f' : '#ffffff',
        borderColor: isDark ? '#1e1e24' : '#e2e8f0',
        borderWidth: 1,
        textStyle: {
          color: isDark ? '#fafafa' : '#0f172a',
          fontFamily: 'DM Sans, sans-serif'
        },
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: isDark ? '#18181b' : '#f1f5f9',
            color: isDark ? '#fafafa' : '#0f172a'
          }
        }
      },
      legend: {
        data: selectedFields.map(field => RATE_FIELDS.find(f => f.value === field)?.label || field),
        textStyle: {
          color: isDark ? '#a1a1aa' : '#64748b',
          fontFamily: 'DM Sans, sans-serif'
        },
        top: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: {
          lineStyle: { color: isDark ? '#1e1e24' : '#e2e8f0' }
        },
        axisLabel: {
          color: isDark ? '#a1a1aa' : '#64748b',
          fontFamily: 'JetBrains Mono, monospace',
          formatter: (value: string) => {
            const parts = value.split('-');
            if (parts.length < 3) return value;
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${months[parseInt(parts[1], 10) - 1]} ${parts[2]}`;
          }
        }
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLine: {
          lineStyle: { color: isDark ? '#1e1e24' : '#e2e8f0' }
        },
        splitLine: {
          lineStyle: { color: isDark ? '#1e1e24' : '#e2e8f0' }
        },
        axisLabel: {
          color: isDark ? '#a1a1aa' : '#64748b',
          fontFamily: 'JetBrains Mono, monospace'
        }
      },
      series
    };
  }, [filteredRates, selectedFields, darkMode]);

  // Table Data Processing (Search + Sorting + Pagination)
  const sortedTableRates = useMemo(() => {
    let data = filteredRates;
    if (tableSearch.trim() !== '') {
      const q = tableSearch.toLowerCase();
      data = data.filter(r => r.date.includes(q) || r.source_file.toLowerCase().includes(q));
    }

    const sorted = [...data];
    sorted.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === null || aVal === undefined) return sortDirection === 'asc' ? 1 : -1;
      if (bVal === null || bVal === undefined) return sortDirection === 'asc' ? -1 : 1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else {
        return sortDirection === 'asc' 
          ? (aVal as any) - (bVal as any) 
          : (bVal as any) - (aVal as any);
      }
    });

    return sorted;
  }, [filteredRates, tableSearch, sortField, sortDirection]);

  // Page specific slices
  const paginatedRates = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return sortedTableRates.slice(startIdx, startIdx + rowsPerPage);
  }, [sortedTableRates, currentPage]);

  const totalPages = Math.ceil(sortedTableRates.length / rowsPerPage) || 1;

  // Reset pagination on search or date range change
  useEffect(() => {
    setCurrentPage(1);
  }, [tableSearch, selectedCurrency, dateRangeOption]);

  const handleSort = (field: keyof RateRow) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Convert Rate calculation output
  const calculatedResult = useMemo(() => {
    if (!calcDate || rates.length === 0) return null;
    const rateItem = rates.find(r => r.date === calcDate);
    if (!rateItem) return null;

    const rate = rateItem[calcRateType];
    if (rate === null || rate === undefined) return null;

    if (calcDirection === 'FC_TO_INR') {
      return calcAmount * rate;
    } else {
      return calcAmount / rate;
    }
  }, [calcAmount, calcDirection, calcRateType, calcDate, rates]);

  // Client-side CSV Download with Direct Raw URLs
  const downloadCSV = () => {
    if (filteredRates.length === 0) return;
    
    const headers = ['Date', 'TT Buying', 'TT Selling', 'Bill Buying', 'Bill Selling', 'Card Buying', 'Card Selling', 'CN Buying', 'CN Selling', 'Publication Only', 'Source PDF Link'];
    const csvRows = [
      headers.join(','),
      ...filteredRates.map(r => [
        r.date,
        r.tt_buying ?? '',
        r.tt_selling ?? '',
        r.bill_buying ?? '',
        r.bill_selling ?? '',
        r.card_buying ?? '',
        r.card_selling ?? '',
        r.cn_buying ?? '',
        r.cn_selling ?? '',
        r.publication_only,
        `https://sbi-tt-rates-archive.vercel.app/${r.source_file}`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SBI_TT_Rates_${selectedCurrency}_${activeStartDate}_to_${activeEndDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle field selection for chart
  const handleFieldToggle = (field: RateField) => {
    setSelectedFields((prev) => {
      if (prev.includes(field)) {
        if (prev.length === 1) return prev;
        return prev.filter(f => f !== field);
      } else {
        return [...prev, field];
      }
    });
  };

  return (
    <div className="app-container">
      {/* Top Header with CA Signature & Contact */}
      <header className="header-row">
        <div className="header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1>SBI Forex & TT Rates Registry</h1>
            {latestMetadata && (
              <div className="badge-live" title={`Processed at: ${latestMetadata.processed_at}`}>
                Latest Data: {formatDate(latestMetadata.date)}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
            <span className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
              Curated & Maintained by CA Kora Venkata Kalyan
            </span>
            <a
              href="https://wa.me/919505513189"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                backgroundColor: '#25D366',
                color: '#ffffff',
                borderColor: '#25D366',
                fontWeight: 600
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="12" height="12" fill="currentColor">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
        <div className="header-right">
          {/* Optional Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="btn btn-secondary btn-icon"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* KPI Cards Row (Flag Icons Integrated) */}
      <section className="kpi-grid">
        {['USD-INR', 'EUR-INR', 'GBP-INR', 'JPY-INR'].map((pair) => {
          const kpi = kpiRates[pair];
          const cInfo = CURRENCY_PAIRS.find(c => c.code === pair);
          const flag = cInfo ? cInfo.flag : '';
          const isUp = kpi?.change ? kpi.change >= 0 : false;
          return (
            <div className="card kpi-card" key={pair}>
              <div className="kpi-header">
                <span className="kpi-title">
                  <span style={{ marginRight: '0.375rem', fontSize: '1rem' }}>{flag}</span>
                  {pair === 'USD-INR' ? 'US Dollar' : pair === 'EUR-INR' ? 'Euro' : pair === 'GBP-INR' ? 'British Pound' : 'Japanese Yen'}
                </span>
                {kpi?.change !== null && kpi?.change !== undefined && (
                  <span className={`trend-pill ${isUp ? 'up' : 'down'}`}>
                    {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(kpi.change).toFixed(4)}
                  </span>
                )}
              </div>
              <div className="kpi-value-row">
                <span className="kpi-value">{kpi?.latest ? kpi.latest.toFixed(4) : 'Loading...'}</span>
                <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>INR</span>
              </div>
              <div className="kpi-footer">
                <span>TT Buying Rate</span>
                {latestMetadata && <span>{formatDate(latestMetadata.date)}</span>}
              </div>
            </div>
          );
        })}
      </section>

      {/* Hero Feature: Quick Rate Lookup Card (Printable data-print-date attached) */}
      <section className="card hero-finder" data-print-date={new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}>
        <div className="finder-header">
          <h2>{currencyInfo.flag} Quick Historical Rate Lookup</h2>
          <p className="text-muted">Enter a date and currency to instantly fetch official SBI exchange rates.</p>
        </div>
        <div className="finder-body">
          <div className="finder-inputs-row">
            <div className="filter-group">
              <label className="filter-label">Target Date</label>
              <input
                type="date"
                value={finderDate}
                onChange={(e) => setFinderDate(e.target.value)}
                min="2020-06-02"
                max={latestMetadata ? latestMetadata.date : undefined}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Currency Pair</label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
              >
                {CURRENCY_PAIRS.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {finderResult ? (
            <div className="finder-results-box">
              {finderResult.isFallback && (
                <div className="finder-fallback-note">
                  ⚠️ No rates published on {finderDate} (Weekend/Holiday). Displaying nearest preceding business day rate from <strong>{finderResult.match.date}</strong>.
                </div>
              )}
              <div className="finder-meta-summary">
                <div className="finder-meta-item">
                  <span className="meta-label">Currency Pair:</span>
                  <span className="meta-value"><strong>{currencyInfo.flag} {currencyInfo.label}</strong></span>
                </div>
                <div className="finder-meta-item">
                  <span className="meta-label">Rate Date:</span>
                  <span className="meta-value"><strong>{formatDate(finderResult.match.date)}</strong></span>
                </div>
              </div>
              <div className="finder-rates-grid">
                <div className="finder-rate-item main-rate">
                  <span className="rate-label">TT Buying</span>
                  <span className="rate-value">{finderResult.match.tt_buying !== null ? finderResult.match.tt_buying.toFixed(4) : 'N/A'}</span>
                </div>
                <div className="finder-rate-item main-rate">
                  <span className="rate-label">TT Selling</span>
                  <span className="rate-value">{finderResult.match.tt_selling !== null ? finderResult.match.tt_selling.toFixed(4) : 'N/A'}</span>
                </div>
                <div className="finder-rate-item">
                  <span className="rate-label">Bill Buying</span>
                  <span className="rate-value">{finderResult.match.bill_buying !== null ? finderResult.match.bill_buying.toFixed(4) : 'N/A'}</span>
                </div>
                <div className="finder-rate-item">
                  <span className="rate-label">Bill Selling</span>
                  <span className="rate-value">{finderResult.match.bill_selling !== null ? finderResult.match.bill_selling.toFixed(4) : 'N/A'}</span>
                </div>
                <div className="finder-rate-item">
                  <span className="rate-label">Card Buying</span>
                  <span className="rate-value">{finderResult.match.card_buying !== null ? finderResult.match.card_buying.toFixed(4) : 'N/A'}</span>
                </div>
                <div className="finder-rate-item">
                  <span className="rate-label">Card Selling</span>
                  <span className="rate-value">{finderResult.match.card_selling !== null ? finderResult.match.card_selling.toFixed(4) : 'N/A'}</span>
                </div>
              </div>
              <div className="finder-actions">
                <button 
                  onClick={() => {
                    const txt = `SBI exchange rates for ${currencyInfo.code} on ${finderResult.match.date}: TT Buying: ${finderResult.match.tt_buying ?? 'N/A'}, TT Selling: ${finderResult.match.tt_selling ?? 'N/A'}, Bill Buying: ${finderResult.match.bill_buying ?? 'N/A'}`;
                    navigator.clipboard.writeText(txt);
                    alert('Rates copied to clipboard!');
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                >
                  📋 Copy Rates Text
                </button>
                <button 
                  onClick={() => window.print()}
                  className="btn btn-secondary"
                  style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                >
                  🖨️ Print Certificate
                </button>
                <a
                  href={`/${finderResult.match.source_file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                >
                  Download Source PDF ⤓
                </a>
              </div>
            </div>
          ) : (
            <div className="finder-results-box empty">
              <span className="text-muted">Select a date above to load rates.</span>
            </div>
          )}
        </div>
      </section>

      {/* Controls & Filter Panel */}
      <section className="card filter-card">
        <div className="filter-grid">
          {/* Main Currency selector with Flag */}
          <div className="filter-group">
            <label className="filter-label">Active Currency</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              disabled={loading}
            >
              {CURRENCY_PAIRS.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.label}</option>
              ))}
            </select>
          </div>

          {/* Financial Year Quick Select */}
          <div className="filter-group">
            <label className="filter-label">Financial Year (FY)</label>
            <select
              value={
                dateRangeOption === 'CUSTOM' && customStartDate && customEndDate
                  ? `${customStartDate.substring(0, 4)}-${parseInt(customEndDate.substring(0, 4), 10) + 1}`
                  : ''
              }
              onChange={(e) => {
                const fy = e.target.value;
                if (!fy) return;
                const parts = fy.split('-');
                const startYear = parts[0];
                const endYear = parts[1];
                setDateRangeOption('CUSTOM');
                setCustomStartDate(`${startYear}-04-01`);
                setCustomEndDate(`${endYear}-03-31`);
              }}
            >
              <option value="">Select Financial Year...</option>
              <option value="2025-2026">FY 2025-26 (Apr 25 - Mar 26)</option>
              <option value="2024-2025">FY 2024-25 (Apr 24 - Mar 25)</option>
              <option value="2023-2024">FY 2023-24 (Apr 23 - Mar 24)</option>
              <option value="2022-2023">FY 2022-23 (Apr 22 - Mar 23)</option>
              <option value="2021-2022">FY 2021-22 (Apr 21 - Mar 22)</option>
              <option value="2020-2021">FY 2020-21 (Jun 20 - Mar 21)</option>
            </select>
          </div>

          {/* Date Range Pre-sets */}
          <div className="filter-group">
            <label className="filter-label">Filter Chart Range</label>
            <div className="segmented-control">
              {['1M', '6M', '1Y', 'ALL', 'CUSTOM'].map(opt => (
                <button
                  key={opt}
                  className={`segment-btn ${dateRangeOption === opt ? 'active' : ''}`}
                  onClick={() => setDateRangeOption(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Pickers */}
          {dateRangeOption === 'CUSTOM' && (
            <>
              <div className="filter-group">
                <label className="filter-label">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  min="2020-06-02"
                  max={customEndDate || undefined}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate || "2020-06-02"}
                />
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="filter-group" style={{ justifySelf: 'end' }}>
            <button
              onClick={downloadCSV}
              className="btn btn-secondary"
              disabled={loading || filteredRates.length === 0}
              style={{ width: '100%' }}
            >
              <Download size={16} /> Export Range CSV
            </button>
          </div>
        </div>

        {/* Rate Field Filters */}
        <div className="filter-group" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <label className="filter-label">Chart Fields (Toggle display)</label>
          <div className="rate-checkbox-grid">
            {RATE_FIELDS.map(f => (
              <label key={f.value} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedFields.includes(f.value)}
                  onChange={() => handleFieldToggle(f.value)}
                />
                {f.label}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid: split in 2 columns (Chart + Stats/Calculator) */}
      <section className="dashboard-body-split">
        {/* Visualization Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{currencyInfo.flag} Historical Trend: {currencyInfo.label}</h2>
            {filteredRates.length > 0 && (
              <span className="text-muted" style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
                {formatDate(filteredRates[0].date)} — {formatDate(filteredRates[filteredRates.length - 1].date)}
              </span>
            )}
          </div>

          {loading ? (
            <div className="chart-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '0.5rem' }}>
              <RefreshCw size={36} className="skeleton" style={{ animation: 'spin 1.5s linear infinite', color: 'var(--text-muted)' }} />
              <span className="text-muted">Loading historical rates...</span>
            </div>
          ) : error ? (
            <div className="chart-container alert" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span>{error}</span>
            </div>
          ) : (
            <div className="chart-container">
              <ReactECharts
                option={chartOption}
                style={{ height: '400px', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            </div>
          )}
        </div>

        {/* Side Panel: stats & converter calculator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Stats Card */}
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Period Statistics</h2>
            
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span className="text-muted">Current TT Buying</span>
                  <span className="mono" style={{ fontWeight: 600 }}>
                    {stats.latestRate ? stats.latestRate.toFixed(4) : 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span className="text-muted">Period High</span>
                  <span className="mono" style={{ fontWeight: 600, color: 'var(--emerald-text)' }}>
                    {stats.highest ? stats.highest.toFixed(4) : 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span className="text-muted">Period Low</span>
                  <span className="mono" style={{ fontWeight: 600, color: 'var(--rose-text)' }}>
                    {stats.lowest ? stats.lowest.toFixed(4) : 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span className="text-muted">Period Average</span>
                  <span className="mono" style={{ fontWeight: 600 }}>
                    {stats.average ? stats.average.toFixed(4) : 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-muted">Period Trend</span>
                  {stats.percentageChange !== null ? (
                    <span className={`trend-pill ${stats.percentageChange >= 0 ? 'up' : 'down'}`}>
                      {stats.percentageChange >= 0 ? '+' : ''}
                      {stats.percentageChange.toFixed(2)}%
                    </span>
                  ) : (
                    <span className="mono">N/A</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Currency Calculator Card */}
          <div className="card calc-card">
            <h2>Currency Converter</h2>
            
            <div className="calc-inputs">
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <button
                  onClick={() => setCalcDirection('FC_TO_INR')}
                  className={`btn ${calcDirection === 'FC_TO_INR' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.375rem 0.5rem', fontSize: '0.8125rem' }}
                >
                  {currencyInfo.baseCurrency} → INR
                </button>
                <button
                  onClick={() => setCalcDirection('INR_TO_FC')}
                  className={`btn ${calcDirection === 'INR_TO_FC' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.375rem 0.5rem', fontSize: '0.8125rem' }}
                >
                  INR → {currencyInfo.baseCurrency}
                </button>
              </div>

              <div className="filter-group">
                <label className="filter-label">Amount</label>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  min="0"
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">Historical Rate Date</label>
                <select
                  value={calcDate}
                  onChange={(e) => setCalcDate(e.target.value)}
                  disabled={rates.length === 0}
                >
                  {[...rates].reverse().map(r => (
                    <option key={r.date} value={r.date}>
                      {r.date} ({r.tt_buying ? `Buying ${r.tt_buying}` : 'No rates'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Conversion Rate Type</label>
                <select
                  value={calcRateType}
                  onChange={(e) => setCalcRateType(e.target.value as RateField)}
                >
                  {RATE_FIELDS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {calculatedResult !== null ? (
              <div className="calc-result-box">
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Result using {RATE_FIELDS.find(f => f.value === calcRateType)?.label} rate on {calcDate}
                </span>
                <span className="calc-result-value">
                  {calcDirection === 'FC_TO_INR'
                    ? `${calculatedResult.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} INR`
                    : `${calculatedResult.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${currencyInfo.baseCurrency}`
                  }
                </span>
              </div>
            ) : (
              <div className="calc-result-box">
                <span className="text-muted">No rate available for selection</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Data Table Panel */}
      <section className="card table-card">
        <div className="table-toolbar">
          <h2>Historical Rates Table</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="table-search" style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search date (YYYY-MM-DD)..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                style={{ paddingLeft: '2rem' }}
              />
              <Search size={14} className="text-muted" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>
        </div>

        {rates.length > 0 && rates[0].publication_only && (
          <div className="alert">
            <Info size={16} className="alert-icon" />
            <span>Note: SBI publishes rates for <strong>{currencyInfo.baseCurrency}</strong> for <strong>publication purpose only</strong>.</span>
          </div>
        )}

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('date')}>
                  Date {sortField === 'date' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="sortable" onClick={() => handleSort('tt_buying')}>
                  TT Buying {sortField === 'tt_buying' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="sortable" onClick={() => handleSort('tt_selling')}>
                  TT Selling {sortField === 'tt_selling' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th>Bill Buying</th>
                <th>Bill Selling</th>
                <th>Card Buying</th>
                <th>Card Selling</th>
                <th>CN Buying</th>
                <th>CN Selling</th>
                <th>Source PDF</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j}><div className="skeleton skeleton-text" style={{ width: j === 0 ? '90px' : '50px' }}></div></td>
                    ))}
                  </tr>
                ))
              ) : paginatedRates.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2rem 1rem' }} className="text-muted">
                    No rate rows found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedRates.map((row) => (
                  <tr key={row.date}>
                    <td className="mono" style={{ fontWeight: 500 }}>{row.date}</td>
                    <td className="mono" style={{ fontWeight: 600 }}>{row.tt_buying !== null ? row.tt_buying.toFixed(4) : '-'}</td>
                    <td className="mono" style={{ fontWeight: 600 }}>{row.tt_selling !== null ? row.tt_selling.toFixed(4) : '-'}</td>
                    <td className="mono text-muted">{row.bill_buying !== null ? row.bill_buying.toFixed(4) : '-'}</td>
                    <td className="mono text-muted">{row.bill_selling !== null ? row.bill_selling.toFixed(4) : '-'}</td>
                    <td className="mono text-muted">{row.card_buying !== null ? row.card_buying.toFixed(4) : '-'}</td>
                    <td className="mono text-muted">{row.card_selling !== null ? row.card_selling.toFixed(4) : '-'}</td>
                    <td className="mono text-muted">{row.cn_buying !== null ? row.cn_buying.toFixed(4) : '-'}</td>
                    <td className="mono text-muted">{row.cn_selling !== null ? row.cn_selling.toFixed(4) : '-'}</td>
                    <td>
                      <a
                        href={`/${row.source_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', gap: '0.25rem' }}
                      >
                        Verify PDF ⤓
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row with direct Jump select dropdown */}
        {!loading && sortedTableRates.length > 0 && (
          <div className="pagination">
            <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
              Showing {Math.min(sortedTableRates.length, (currentPage - 1) * rowsPerPage + 1)}–
              {Math.min(sortedTableRates.length, currentPage * rowsPerPage)} of {sortedTableRates.length} entries
            </span>
            <div className="pagination-buttons">
              <span className="text-muted" style={{ fontSize: '0.8125rem', marginRight: '0.375rem' }}>
                Jump to:
              </span>
              <select
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                style={{
                  width: 'auto',
                  padding: '0.125rem 0.375rem',
                  fontSize: '0.8125rem',
                  borderRadius: '6px',
                  marginRight: '0.75rem',
                  height: '2rem'
                }}
              >
                {Array.from({ length: totalPages }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Page {i + 1}</option>
                ))}
              </select>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                title="First Page"
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                title="Previous Page"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="mono" style={{ fontSize: '0.8125rem', padding: '0 0.5rem' }}>
                {currentPage} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                title="Next Page"
              >
                <ChevronRight size={14} />
              </button>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                title="Last Page"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Disclaimer and Footer Section */}
      <footer className="footer-section">
        <div className="card disclaimer-card">
          <h3>⚠️ Statutory Disclaimer</h3>
          <p>
            This registry compiles and archives historical Foreign Exchange (Forex) and Telegraphic Transfer (TT) rates published by the State Bank of India (SBI). The rates published here are strictly for reference and general information purposes (such as preparing draft income tax returns or performing audit analyses). While every effort is made to maintain accuracy, no guarantees or warranties are made regarding the correctness, completeness, or timeliness of this rate data. Users must cross-verify all exchange rates with official SBI publications or original bank receipts before deploying them for official tax filings, statutory audits, or financial settlements. No liability is assumed for any errors, omissions, or financial losses arising from the use of this data.
          </p>
        </div>
        <div className="footer-credits">
          <p>© {new Date().getFullYear()} SBI Forex & TT Rates Registry. Curated & Maintained by CA Kora Venkata Kalyan.</p>
          <div style={{ marginTop: '0.5rem' }}>
            <a
              href="https://wa.me/919505513189"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                backgroundColor: '#25D366',
                color: '#ffffff',
                borderColor: '#25D366',
                fontWeight: 600
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="12" height="12" fill="currentColor">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
              </svg>
              Contact on WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
