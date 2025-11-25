import { useState, useRef } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, X, Download } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export function Upload() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleData = [
  { field: 'date', type: 'Date', required: true, example: '01-01-2025' },
  { field: 'product_category', type: 'String', required: true, example: 'Mobile' },
  { field: 'product', type: 'String', required: true, example: 'iPhone 15' },
  { field: 'city', type: 'String', required: true, example: 'Mumbai' },
  { field: 'release_date', type: 'Date', required: true, example: '15-06-2023' },
  // { field: 'season', type: 'String', required: true, example: 'Winter' },
  // { field: 'holiday', type: 'String', required: true, example: 'Diwali' },
  { field: 'price', type: 'Number', required: true, example: '79999' },
  { field: 'discount', type: 'Number', required: false, example: '5000' },
  { field: 'final_price', type: 'Number', required: false, example: '74999' },
  // { field: 'competitor_price', type: 'Number', required: false, example: '77000' },
  { field: 'marketing_spend', type: 'Number', required: false, example: '150000' },
  { field: 'last_month_sales', type: 'Number', required: true, example: '1200' },
  { field: 'quantity_sold', type: 'Number', required: true, example: '200' },
];


  const requirements = [
    'File size limit: 100MB',
    'Use DD-MM-YYYY for dates',
    'Include all fields given in sample data',
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      showToast('Please upload a CSV file', 'error');
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      showToast('File size must be under 100MB for processing', 'error');
      return;
    }

    validateCSV(selectedFile, (isValid) => {
        if (isValid) {
            setFile(selectedFile);
            showToast('File selected for demand forecasting', 'success');
        }
    });
  };

  const validateCSV = (file: File, callback: (isValid: boolean) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map(line => line.trim());
      const headerLine = lines[0];
      const headers = headerLine.split(',').map(h => h.trim());

      const requiredHeaders = sampleData.map((item) => item.field);
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h)
      );

      if (missingHeaders.length > 0) {
        showToast(
          `Missing required columns: ${missingHeaders.join(', ')}`,
          'error'
        );
        callback(false);
        return;
      }

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line === '') continue;
        const values = line.split(',');
        const row = headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {} as Record<string, string>);


        for (const item of sampleData) {
          const value = row[item.field];
          if (item.type === 'Number' && value && isNaN(Number(value))) {
            showToast(
              `Invalid number in column ${item.field} at row ${i + 1}`,
              'error'
            );
            callback(false);
            return;
          }
          if (item.type === 'Date' && value && isNaN(Date.parse(value))) {
            showToast(
              `Invalid date in column ${item.field} at row ${i + 1}`,
              'error'
            );
            callback(false);
            return;
          }
        }
      }

      callback(true);
    };
    reader.onerror = () => {
      showToast('Error reading file', 'error');
      callback(false);
    };
    reader.readAsText(file);
  };
  
  
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    try {
      // Request the pre-signed URL from your FastAPI backend
      const res = await fetch(`http://localhost:8000/upload/generate-upload-url?filename=${encodeURIComponent(file.name)}&content_type=${file.type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if(!res.ok) {
        showToast("Internal server error", "error")
      }
      const { upload_url, key, upload_id } = await res.json();
      // console.log(upload_url, key, upload_id)

      // Upload the file directly to S3
      await uploadToS3WithProgress(file, upload_url);

      console.log("DB upload ID: ", upload_id);
      setUploadProgress(100);
      showToast("✅ CSV file Uploaded successfully!", "success");
      setFile(null);

      // Notify backend
      const notifyResponse = await fetch("http://localhost:8000/upload/upload-complete", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ upload_id: upload_id, s3_key: key })
      });

      if (!notifyResponse.ok) {
        showToast("Internal server error", "error");
        throw new Error("Failed to notify FastAPI backend");
      }
      console.log("Backend notified of upload completion")

    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  function uploadToS3WithProgress(file: File, uploadUrl: string) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      });

      xhr.upload.addEventListener("error", () => reject("Upload failed"));
      xhr.upload.addEventListener("abort", () => reject("Upload aborted"));

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 204) {
            resolve();
          } else {
            reject(`Upload failed with status ${xhr.status}`);
          }
        }
      };

      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  }

 const downloadSample = () => {
  const csv = `date,product_category,product,city,release_date,price,discount,final_price,marketing_spend,last_month_sales,quantity_sold
    2020-01-01,Mobile,Mobile_1,Ahmedabad,2016-09-09 00:45:26,87899,0.1,79100,1198200,152261164.17,94
    2020-01-01,Mobile,Mobile_1,Surat,2016-09-09 00:45:26,83499,0.15,70999,1198200,152261164.17,134
    2020-01-01,Mobile,Mobile_1,Vadodara,2016-09-09 00:45:26,87899,0.15,74699,1198200,152261164.17,123
    2020-01-01,Mobile,Mobile_1,Rajkot,2016-09-09 00:45:26,92300,0.2,73800,1198200,152261164.17,94
    2020-01-01,Mobile,Mobile_1,Bhavnagar,2016-09-09 00:45:26,83499,0.1,75099,1198200,152261164.17,146
    2020-01-01,Mobile,Mobile_1,Jamnagar,2016-09-09 00:45:26,92300,0.15,78500,1198200,152261164.17,25
    2020-01-01,Mobile,Mobile_1,Junagadh,2016-09-09 00:45:26,87900,0.0,87900,1198200,152261164.17,104
    2020-01-01,Mobile,Mobile_1,Gandhinagar,2016-09-09 00:45:26,92300,0.15,78499,1198200,152261164.17,83`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_sales_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-950 overflow-hidden relative">
      {/* Background Animations */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-teal-500/10 animate-dataStream pointer-events-none"></div>
      <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none">
        <circle cx="10%" cy="20%" r="8" fill="#3B82F6" className="animate-pulseNode" style={{ animationDelay: '0s' }} />
        <circle cx="80%" cy="30%" r="6" fill="#06B6D4" className="animate-pulseNode" style={{ animationDelay: '0.5s' }} />
        <circle cx="50%" cy="70%" r="7" fill="#14B8A6" className="animate-pulseNode" style={{ animationDelay: '1s' }} />
        <path
          d="M0 50% H50% C60% 40%, 70% 60%, 100% 50%"
          fill="none"
          stroke="url(#dataGradient)"
          strokeWidth="2"
          className="animate-dataStream"
        />
        <defs>
          <linearGradient id="dataGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: '#06B6D4', stopOpacity: 0.3 }} />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 1. Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Upload Your Sales Data</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Power your forecasts with historical sales data in just a few clicks.</p>
        </div>

        {/* 2. Main Upload Area */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 mb-12 relative overflow-hidden">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/10 bg-gray-950/50'
            }`}
          >
            {uploading && (
              <div className="absolute inset-0 bg-blue-500/5 animate-scanLine pointer-events-none"></div>
            )}
            <input
              type="file"
              accept=".csv"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              ref={fileInputRef}
            />
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UploadIcon className="w-8 h-8 text-blue-400 animate-pulseNode" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Drag and Drop Your CSV Here
              </h3>
              <p className="text-gray-400 mb-4">or click to select a file</p>
              <p className="text-sm text-gray-500">Max size: 100MB | Format: CSV</p>
            </div>
          </div>

          {file && (
            <div className="mt-6 bg-gray-950/50 border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-400 animate-pulseNode" />
                </div>
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {uploading && (
            <div className="mt-4">
              <div className="relative w-full h-2 bg-gray-800 rounded-full">
                <div
                  className="absolute h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease' }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 mt-2 text-center">
                {uploadProgress < 100 ? `Processing ${uploadProgress}%` : 'Finalizing...'}
              </p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full mt-6 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <UploadIcon className="w-5 h-5 animate-pulseNode" />
                Process Dataset
              </>
            )}
          </button>
        </div>

        {/* 3. Requirements Section */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400 animate-pulseNode" />
            Data Requirements for Forecasting
          </h3>
          <ul className="space-y-3 text-gray-400 text-sm">
            {requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0 animate-pulseNode"></div>
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Sample Dataset Section */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h3 className="text-xl font-semibold text-white">Sample Data Format</h3>
            <button
              onClick={downloadSample}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 transition-all self-start md:self-auto"
            >
              <Download className="w-4 h-4 animate-pulseNode" />
              Download Sample CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Field</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Example</th>
                </tr>
              </thead>
              <tbody>
                {sampleData.map((field, index) => (
                  <tr key={index} className="border-b border-white/5">
                    <td className="py-3 px-4 text-white font-medium">{field.field}</td>
                    <td className="py-3 px-4 text-gray-400">{field.type}</td>
                    <td className="py-3 px-4 text-gray-500 font-mono text-sm">{field.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dataStream {
          0% { transform: translateX(-100%); opacity: 0.3; }
          50% { opacity: 0.5; }
          100% { transform: translateX(100%); opacity: 0.3; }
        }
        @keyframes pulseNode {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes scanLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-dataStream {
          animation: dataStream 8s linear infinite;
        }
        .animate-pulseNode {
          animation: pulseNode 3s ease-in-out infinite;
        }
        .animate-scanLine {
          animation: scanLine 2s linear infinite;
        }
      `}</style>
    </div>
  );
}