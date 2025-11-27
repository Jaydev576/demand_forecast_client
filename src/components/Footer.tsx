import { Link } from 'react-router-dom';
import { TrendingUp, Mail, Github, Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-gray-950/80 backdrop-blur-2xl mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-4 md:grid-cols-4 gap-8">
          <div className="col-span-4 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 group mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-cyan-500 p-2 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                ForecastIQ
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Advanced demand forecasting platform powered by machine learning. Make data-driven decisions and predict future trends with confidence.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/dhruvrohit229/Demand_Forecast_Backend"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="mailto: het2122005@gmail.com"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-4 flex flex-col justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2025 ForecastIQ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
