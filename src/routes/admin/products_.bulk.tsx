import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
  Trash2,
  Check,
  Save,
} from "lucide-react";
import * as XLSX from "xlsx";
import { API_BASE, safeFetchJson } from "@/lib/api";

const CPANEL_IMAGE_BASE = "https://img.srikamatchisilks.com/uploads/products";

/** Accept full URL or filename (1.jpg) / pipe gallery (1.jpg|2.jpg) */
function resolveCsvImages(raw: string): string {
  if (!raw) return "";
  const parts = raw
    .split(/[|,;]+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      if (/^https?:\/\//i.test(p)) return p;
      const file = p.replace(/^\/+/, "").replace(/^uploads\/products\//i, "").replace(/^products\//i, "");
      return `${CPANEL_IMAGE_BASE}/${file}`;
    });
  return parts.join("|");
}


export const Route = createFileRoute("/admin/products_/bulk")({
  component: AdminProductsBulk,
});

interface ParsedProductRow {
  rowNum: number;
  name: string;
  slug: string;
  categoryName: string;
  matchedCategoryId: string | null;
  price: number | string;
  discountPrice: number | string | null;
  stock: number | string;
  fabric: string;
  color: string;
  occasion: string;
  isTrending: boolean;
  isFeatured: boolean;
  isOffer: boolean;
  image: string;
  description: string;
  errors: string[];
  isValid: boolean;
}

const SAMPLE_PRODUCTS = [
  {
    "Product Name": "Kanchipuram Pure Zari Bridal Saree",
    "Slug": "",
    "Category Name": "Pure Silk Sarees",
    "Price": 18500,
    "Discount Price": 15000,
    "Stock": 12,
    "Fabric": "Pure Silk",
    "Color": "Maroon Gold",
    "Occasion": "Wedding",
    "Is Trending": "TRUE",
    "Is Featured": "TRUE",
    "Is Offer": "TRUE",
    "Image URL": "kanchipuram-maroon-1.jpg|kanchipuram-maroon-2.jpg",
    "Description": "Exquisite handwoven Kanchipuram silk drape with 24k gold leaf zari brocade pallu.",
  },
  {
    "Product Name": "Banarasi Brocade Silk Saree",
    "Slug": "",
    "Category Name": "Banarasi Silks",
    "Price": 14500,
    "Discount Price": 12000,
    "Stock": 8,
    "Fabric": "Banarasi Silk",
    "Color": "Royal Blue",
    "Occasion": "Festive",
    "Is Trending": "TRUE",
    "Is Featured": "FALSE",
    "Is Offer": "TRUE",
    "Image URL": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800",
    "Description": "Classic Banarasi kadwa weave with silver zari floral motifs across royal blue body.",
  },
  {
    "Product Name": "Mysuru Royal Pure Crepe Silk Saree",
    "Slug": "",
    "Category Name": "Soft Silks",
    "Price": 9500,
    "Discount Price": 7999,
    "Stock": 15,
    "Fabric": "Crepe Silk",
    "Color": "Mustard Gold",
    "Occasion": "Party",
    "Is Trending": "FALSE",
    "Is Featured": "TRUE",
    "Is Offer": "FALSE",
    "Image URL": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800",
    "Description": "Lightweight Karnataka Mysore crepe silk with rich woven zari border.",
  },
  {
    "Product Name": "Soft Chanderi Zari Work Saree",
    "Slug": "",
    "Category Name": "Cotton Silks",
    "Price": 6800,
    "Discount Price": 5400,
    "Stock": 20,
    "Fabric": "Chanderi",
    "Color": "Pastel Pink",
    "Occasion": "Casual",
    "Is Trending": "FALSE",
    "Is Featured": "FALSE",
    "Is Offer": "TRUE",
    "Image URL": "",
    "Description": "Breezy handloom Chanderi silk cotton saree adorned with delicate coin bootis.",
  },
  {
    "Product Name": "Organza Floral Printed Elegance Saree",
    "Slug": "",
    "Category Name": "Fancy Sarees",
    "Price": 8200,
    "Discount Price": 6999,
    "Stock": 10,
    "Fabric": "Organza",
    "Color": "Mint Green",
    "Occasion": "Festive",
    "Is Trending": "TRUE",
    "Is Featured": "FALSE",
    "Is Offer": "FALSE",
    "Image URL": "",
    "Description": "Sheer organza saree highlighting digital botanical artwork and embroidered border.",
  },
  {
    "Product Name": "Tussar Silk Handloom Motif Saree",
    "Slug": "",
    "Category Name": "Tussar Silks",
    "Price": 11200,
    "Discount Price": 9500,
    "Stock": 7,
    "Fabric": "Tussar Silk",
    "Color": "Rust Orange",
    "Occasion": "Formal",
    "Is Trending": "FALSE",
    "Is Featured": "TRUE",
    "Is Offer": "TRUE",
    "Image URL": "",
    "Description": "Wild Tussar silk drape showcasing textured natural golden luster and kantha stitch details.",
  },
  {
    "Product Name": "Uppada Lightweight Pure Silk Saree",
    "Slug": "",
    "Category Name": "Pure Silk Sarees",
    "Price": 16800,
    "Discount Price": 13999,
    "Stock": 5,
    "Fabric": "Uppada Silk",
    "Color": "Peacock Blue",
    "Occasion": "Reception",
    "Is Trending": "TRUE",
    "Is Featured": "TRUE",
    "Is Offer": "FALSE",
    "Image URL": "",
    "Description": "Intricate jamdani technique woven Uppada silk with silver water zari highlights.",
  },
  {
    "Product Name": "Traditional Kanchi Cotton Silk Saree",
    "Slug": "",
    "Category Name": "Cotton Silks",
    "Price": 4500,
    "Discount Price": 3800,
    "Stock": 25,
    "Fabric": "Cotton Silk",
    "Color": "Terracotta",
    "Occasion": "Casual",
    "Is Trending": "FALSE",
    "Is Featured": "FALSE",
    "Is Offer": "FALSE",
    "Image URL": "",
    "Description": "Daily wear breathable cotton silk saree styled with traditional temple border.",
  },
  {
    "Product Name": "Kalamkari Hand Painted Pure Silk Saree",
    "Slug": "",
    "Category Name": "Designer Silks",
    "Price": 12999,
    "Discount Price": 10999,
    "Stock": 9,
    "Fabric": "Pure Silk",
    "Color": "Multi Color",
    "Occasion": "Heritage",
    "Is Trending": "TRUE",
    "Is Featured": "TRUE",
    "Is Offer": "TRUE",
    "Image URL": "",
    "Description": "Mythological scenes hand-painted by artisan masters using natural vegetable dyes.",
  },
];

function AdminProductsBulk() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filterInvalid, setFilterInvalid] = useState(false);
  const [summaryModal, setSummaryModal] = useState<{
    open: boolean;
    imported: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Load Categories for mapping
  useEffect(() => {
    const fetchCats = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await fetch(`${API_BASE}/api/categories`);
        const res = await safeFetchJson(response);
        if (res.success) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Error loading categories", err);
        toast.error("Failed to load categories for bulk mapping");
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCats();
  }, []);

  // Category Lookup dictionary (lowercase name -> category object)
  const categoryMap = useMemo(() => {
    const map = new Map<string, any>();
    categories.forEach((cat) => {
      map.set(cat.name.trim().toLowerCase(), cat);
    });
    return map;
  }, [categories]);

  // Helper to parse boolean inputs
  const parseBool = (val: any): boolean => {
    if (typeof val === "boolean") return val;
    if (typeof val === "number") return val === 1;
    if (typeof val === "string") {
      const clean = val.trim().toLowerCase();
      return clean === "true" || clean === "1" || clean === "yes";
    }
    return false;
  };

  // Process raw parsed JS objects into validated row objects
  const processRawRows = (rows: any[]): ParsedProductRow[] => {
    const processed: ParsedProductRow[] = [];

    rows.forEach((row, idx) => {
      const rowNum = idx + 1;
      const name = (row["Product Name"] || row.name || row.productName || "").toString().trim();
      const categoryName = (row["Category Name"] || row.categoryName || row.category || "").toString().trim();
      const rawPrice = row["Price"] ?? row.price;
      const rawDiscount = row["Discount Price"] ?? row.discountPrice;
      const rawStock = row["Stock"] ?? row.stock;
      const fabric = (row["Fabric"] || row.fabric || "").toString().trim();
      const color = (row["Color"] || row.color || "").toString().trim();
      const occasion = (row["Occasion"] || row.occasion || "").toString().trim();
      const isTrending = parseBool(row["Is Trending"] ?? row.isTrending);
      const isFeatured = parseBool(row["Is Featured"] ?? row.isFeatured);
      const isOffer = parseBool(row["Is Offer"] ?? row.isOffer);
      const image = resolveCsvImages((row["Image URL"] || row.image || row.imageUrl || "").toString().trim());
      const description = (row["Description"] || row.description || "").toString().trim();
      const rawSlug = (row["Slug"] || row.slug || "").toString().trim();

      const errors: string[] = [];

      // Validate required fields
      if (!name) {
        errors.push("Product Name is required");
      }

      if (!categoryName) {
        errors.push("Category Name is required");
      }

      const matchedCat = categoryName ? categoryMap.get(categoryName.toLowerCase()) : null;
      if (categoryName && !matchedCat) {
        errors.push(`Category '${categoryName}' does not exist in database`);
      }

      const numPrice = parseFloat(rawPrice);
      if (rawPrice === undefined || rawPrice === null || rawPrice === "" || isNaN(numPrice) || numPrice <= 0) {
        errors.push("Price must be a valid positive number");
      }

      const numStock = parseInt(rawStock, 10);
      if (rawStock === undefined || rawStock === null || rawStock === "" || isNaN(numStock) || numStock < 0) {
        errors.push("Stock must be a valid non-negative integer");
      }

      if (!description) {
        errors.push("Description is required");
      }

      let parsedDiscount: number | null = null;
      if (rawDiscount !== undefined && rawDiscount !== null && rawDiscount !== "") {
        const d = parseFloat(rawDiscount);
        if (!isNaN(d) && d >= 0) {
          parsedDiscount = d;
        }
      }

      // Generate slug if missing
      const slug = rawSlug
        ? rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      processed.push({
        rowNum,
        name,
        slug,
        categoryName,
        matchedCategoryId: matchedCat ? matchedCat.id : null,
        price: isNaN(numPrice) ? rawPrice || "" : numPrice,
        discountPrice: parsedDiscount,
        stock: isNaN(numStock) ? rawStock || "" : numStock,
        fabric,
        color,
        occasion,
        isTrending,
        isFeatured,
        isOffer,
        image,
        description,
        errors,
        isValid: errors.length === 0,
      });
    });

    return processed;
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet);

        if (rawJson.length === 0) {
          toast.error("The uploaded file contains no data rows.");
          return;
        }

        const processed = processRawRows(rawJson);
        setParsedRows(processed);
        toast.success(`Successfully parsed ${processed.length} products from ${file.name}`);
      } catch (err: any) {
        console.error(err);
        toast.error(`Failed to parse file: ${err.message || "Invalid Excel/CSV format"}`);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Download Template Handler (.xlsx or .csv)
  const handleDownloadTemplate = (format: "xlsx" | "csv") => {
    const worksheet = XLSX.utils.json_to_sheet(SAMPLE_PRODUCTS);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bulk Products Template");

    if (format === "xlsx") {
      XLSX.writeFile(workbook, "Sri_Kamatchi_Silk_Bulk_Product_Template.xlsx");
      toast.success("Downloaded sample Excel template (.xlsx)");
    } else {
      XLSX.writeFile(workbook, "Sri_Kamatchi_Silk_Bulk_Product_Template.csv", { bookType: "csv" });
      toast.success("Downloaded sample CSV template (.csv)");
    }
  };

  // Remove a row from the preview table
  const removeRow = (rowNum: number) => {
    setParsedRows((prev) => prev.filter((r) => r.rowNum !== rowNum));
  };

  // Filter rows based on toggle
  const visibleRows = useMemo(() => {
    if (filterInvalid) {
      return parsedRows.filter((r) => !r.isValid);
    }
    return parsedRows;
  }, [parsedRows, filterInvalid]);

  const validRowCount = useMemo(() => parsedRows.filter((r) => r.isValid).length, [parsedRows]);
  const invalidRowCount = useMemo(() => parsedRows.filter((r) => !r.isValid).length, [parsedRows]);

  // Submit valid products to backend API
  const handleImportSubmit = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error("No valid product rows available for import.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      // Simulate progress indicator
      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? prev : prev + 20));
      }, 150);

      const payload = validRows.map((r) => ({
        name: r.name,
        slug: r.slug,
        categoryName: r.categoryName,
        price: Number(r.price),
        discountPrice: r.discountPrice,
        stock: Number(r.stock),
        fabric: r.fabric || null,
        color: r.color || null,
        occasion: r.occasion || null,
        isTrending: r.isTrending,
        isFeatured: r.isFeatured,
        isOffer: r.isOffer,
        image: r.image || null,
        description: r.description,
      }));

      const response = await fetch(`${API_BASE}/api/products/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      clearInterval(interval);
      setUploadProgress(100);

      const res = await safeFetchJson(response);
      if (!response.ok || !res.success) {
        throw new Error(res.message || "Bulk product import failed");
      }

      toast.success(`Successfully imported ${res.count} products to catalog!`);
      setSummaryModal({
        open: true,
        imported: res.count,
        failed: invalidRowCount + (res.failedCount || 0),
        errors: res.errors || [],
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error submitting bulk products");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6e5d53] mb-1">
            <Link to="/admin/products" className="hover:text-[#2c2623] flex items-center gap-1">
              <ArrowLeft size={14} /> Saree Catalog
            </Link>
            <span>/</span>
            <span className="text-[#2c2623] font-bold">Bulk Import</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#2c2623] sm:text-3xl flex items-center gap-2">
            <FileSpreadsheet className="text-[#3a1d13]" size={28} />
            Bulk Product Upload Manager
          </h1>
          <p className="text-xs text-[#6e5d53] mt-1">
            Batch import products via Excel (.xlsx) or CSV files with live category matching and row validation.
          </p>
        </div>

        {/* Download Sample Template Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleDownloadTemplate("xlsx")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8dfd8] bg-white px-4 py-2.5 text-xs font-bold text-[#2c2623] hover:bg-[#fbfaf7] shadow-soft transition-colors"
          >
            <Download size={14} className="text-emerald-600" /> Excel Template (.xlsx)
          </button>
          <button
            onClick={() => handleDownloadTemplate("csv")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8dfd8] bg-white px-4 py-2.5 text-xs font-bold text-[#2c2623] hover:bg-[#fbfaf7] shadow-soft transition-colors"
          >
            <Download size={14} className="text-sky-600" /> CSV Template (.csv)
          </button>
        </div>
      </div>

      {/* File Upload Box */}
      <div className="rounded-2xl border border-dashed border-[#d4af37]/60 bg-[#fbfaf7] p-8 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3a1d13]/10 text-[#3a1d13] mb-4">
          <Upload size={28} />
        </div>
        <h3 className="text-base font-bold text-[#2c2623]">Upload Excel or CSV Product Catalog</h3>
        <p className="text-xs text-[#6e5d53] mt-1 max-w-lg mx-auto leading-relaxed">
          Select an `.xlsx` or `.csv` file formatted with required headers (Product Name, Category Name, Price, Stock, Description).
        </p>

        <div className="mt-5 flex items-center justify-center gap-3">
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3a1d13] text-[#f7f2ed] px-6 py-3 text-xs font-bold shadow-soft hover:bg-[#4d2d22] transition-colors">
            <FileSpreadsheet size={16} /> Select Product File
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {fileName && (
          <p className="text-xs font-semibold text-[#3a1d13] mt-3 font-mono">
            Selected: {fileName}
          </p>
        )}
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="space-y-2 rounded-xl border border-[#e8dfd8] bg-white p-4 shadow-soft">
          <div className="flex justify-between text-xs font-bold text-[#2c2623]">
            <span>Importing valid products to catalog database...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#f3ede8]">
            <div
              className="h-full bg-[#3a1d13] transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Spreadsheet Preview & Validation Table */}
      {parsedRows.length > 0 && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#e8dfd8] bg-white p-4 shadow-soft">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-[#2c2623]">
                Total Rows: <span className="font-extrabold">{parsedRows.length}</span>
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                ✓ Valid: {validRowCount}
              </span>
              {invalidRowCount > 0 && (
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700">
                  ✗ Invalid / Skipped: {invalidRowCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {invalidRowCount > 0 && (
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#6e5d53] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterInvalid}
                    onChange={(e) => setFilterInvalid(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#3a1d13]"
                  />
                  Show Only Invalid Rows ({invalidRowCount})
                </label>
              )}

              <button
                onClick={handleImportSubmit}
                disabled={isUploading || validRowCount === 0}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3a1d13] text-[#f7f2ed] px-5 py-2.5 text-xs font-bold shadow-soft hover:bg-[#4d2d22] disabled:opacity-50 transition-colors"
              >
                {isUploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Import Valid Products ({validRowCount})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-[#e8dfd8] bg-white shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e8dfd8] bg-[#fbfaf7] text-[#6e5d53] uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-3 w-12 text-center">Row</th>
                    <th className="py-3.5 px-3 w-20">Status</th>
                    <th className="py-3.5 px-3 min-w-[180px]">Product Name *</th>
                    <th className="py-3.5 px-3 min-w-[150px]">Category Name *</th>
                    <th className="py-3.5 px-3 w-24">Price (₹) *</th>
                    <th className="py-3.5 px-3 w-24">Offer (₹)</th>
                    <th className="py-3.5 px-3 w-20">Stock *</th>
                    <th className="py-3.5 px-3 min-w-[120px]">Fabric</th>
                    <th className="py-3.5 px-3 min-w-[100px]">Color</th>
                    <th className="py-3.5 px-3 w-28">Flags</th>
                    <th className="py-3.5 px-3 min-w-[200px]">Errors / Issues</th>
                    <th className="py-3.5 px-3 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3ede8] font-medium text-[#2c2623]">
                  {visibleRows.map((row) => (
                    <tr
                      key={row.rowNum}
                      className={row.isValid ? "hover:bg-[#fbfaf7]/60" : "bg-red-50/30 hover:bg-red-50/50"}
                    >
                      <td className="py-3 px-3 text-center font-mono text-[11px] font-bold text-[#6e5d53]">
                        {row.rowNum}
                      </td>
                      <td className="py-3 px-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <CheckCircle2 size={12} /> Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                            <XCircle size={12} /> Invalid
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-semibold">{row.name || <span className="text-red-500 italic">Empty</span>}</td>
                      <td className="py-3 px-3">
                        {row.matchedCategoryId ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Check size={12} /> {row.categoryName}
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold flex items-center gap-1">
                            <XCircle size={12} /> {row.categoryName || "Missing"}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">₹{row.price}</td>
                      <td className="py-3 px-3 font-mono text-[#6e5d53]">
                        {row.discountPrice ? `₹${row.discountPrice}` : "-"}
                      </td>
                      <td className="py-3 px-3 font-mono">{row.stock} Pcs</td>
                      <td className="py-3 px-3 text-[#6e5d53]">{row.fabric || "-"}</td>
                      <td className="py-3 px-3 text-[#6e5d53]">{row.color || "-"}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {row.isTrending && (
                            <span className="rounded bg-amber-50 px-1 py-0.5 text-[9px] font-bold text-amber-700">
                              Trending
                            </span>
                          )}
                          {row.isFeatured && (
                            <span className="rounded bg-indigo-50 px-1 py-0.5 text-[9px] font-bold text-indigo-700">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {row.errors.length > 0 ? (
                          <div className="space-y-0.5">
                            {row.errors.map((err, i) => (
                              <p key={i} className="text-[10px] font-bold text-red-600 flex items-center gap-1 leading-tight">
                                • {err}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-medium">Ready for import</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => removeRow(row.rowNum)}
                          className="rounded p-1 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                          title="Remove row"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Summary Dialog */}
      {summaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#2c2623]/60 backdrop-blur-sm"
            onClick={() => setSummaryModal(null)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-[#e8dfd8] bg-white p-6 shadow-card animate-in zoom-in-95 duration-200">
            <h3 className="font-display text-xl font-bold text-[#2c2623]">Bulk Import Completed</h3>
            <p className="text-xs text-[#6e5d53] mt-1 border-b border-[#f3ede8] pb-3">
              Summary of products cataloged in Sri Kamatchi Silk inventory.
            </p>

            <div className="my-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-center">
                <p className="text-2xl font-black text-emerald-700">{summaryModal.imported}</p>
                <p className="text-xs font-bold text-emerald-800 mt-1">Successfully Imported</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-center">
                <p className="text-2xl font-black text-amber-700">{summaryModal.failed}</p>
                <p className="text-xs font-bold text-amber-800 mt-1">Skipped / Failed</p>
              </div>
            </div>

            {summaryModal.errors.length > 0 && (
              <div className="mb-4 max-h-36 overflow-y-auto rounded-xl border border-red-100 bg-red-50/50 p-3 text-[11px] text-red-700 space-y-1 font-mono">
                {summaryModal.errors.map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-[#f3ede8]">
              <button
                onClick={() => {
                  setSummaryModal(null);
                  navigate({ to: "/admin/products" });
                }}
                className="rounded-xl bg-[#3a1d13] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#4d2d22] transition-colors"
              >
                Go to Products Catalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
