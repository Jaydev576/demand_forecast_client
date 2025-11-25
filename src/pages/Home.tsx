import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Brain, Zap, Shield, Globe, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import myImage from '../assets/image.jpg';

export function Home() {
  const features = [
    {
      icon: Brain,
      title: 'AI Precision Forecasting',
      description: 'Pinpoint demand with advanced AI algorithms analyzing your sales data for unmatched accuracy.',
    },
    {
      icon: BarChart3,
      title: 'Vivid Data Visuals',
      description: 'Explore trends through interactive charts that turn complex data into clear, actionable insights.',
    },
    {
      icon: Zap,
      title: 'Instant Data Processing',
      description: 'Get real-time predictions with our high-speed engine, keeping your business ahead of the curve.',
    },
    {
      icon: Shield,
      title: 'Fortified Data Security',
      description: 'Protect your business with military-grade encryption and secure data handling protocols.',
    },
    {
      icon: Globe,
      title: 'Global Demand Insights',
      description: 'Forecast across markets and regions, adapting to local trends with ease and precision.',
    },
    {
      icon: Sparkles,
      title: 'Tailored Smart Filters',
      description: 'Customize forecasts by product, category, or season to uncover high-impact opportunities.',
    },
  ];

  const benefits = [
    'Slash inventory costs by up to 30% with precise stocking',
    'Boost prediction accuracy by 40% and eliminate waste',
    'Drive smarter decisions with actionable insights',
    'Stay ahead by spotting market trends early',
    'Optimize supply chains and slash stockouts by 50%',
    'Delight customers with consistent product availability',
  ];

  return (
    <div className="min-h-screen bg-gray-950 overflow-hidden relative">
      {/* Animated Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-teal-500/10 animate-waveAnimation pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE2YzAtMS4xLjktMiAyLTJzMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] pointer-events-none opacity-30 animate-float"></div>
      
      {/* Background SVG Line Graph */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" preserveAspectRatio="none">
        <path
          d="M0 600 C200 500, 400 700, 600 400 S800 300, 1000 500, 1200 200"
          fill="none"
          stroke="url(#graphGradient)"
          strokeWidth="2"
          className="animate-drawLine"
        />
        <defs>
          <linearGradient id="graphGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#06B6D4', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        {/* Floating Data Points */}
        <circle cx="200" cy="500" r="5" fill="#3B82F6" className="animate-float delay-100" />
        <circle cx="400" cy="700" r="5" fill="#06B6D4" className="animate-float delay-200" />
        <circle cx="600" cy="400" r="5" fill="#14B8A6" className="animate-float delay-300" />
      </svg>

      <div className="relative">
        <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1200">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6 animate-pulseGlow duration-1500">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                Next-Gen Demand Forecasting
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1200 delay-200">
                <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                  Master Demand
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Win the Market
                </span>
              </h1>
              <p className="text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1200 delay-300">
                Harness predictive analytics to optimize inventory, seize market opportunities, and drive unparalleled growth with precision.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1200 delay-500">
                <Link
                  to={'/signup'}
                  className="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden transition-all hover:scale-105 animate-fadeInScale duration-1000"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 transition-all group-hover:from-blue-500 group-hover:to-cyan-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                  <span className="relative flex items-center gap-2">
                    Take Control Today
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                </Link>
              </div>
            </div>

            
          </div>
        </section>

        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1200">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Cutting-Edge Tools for
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Precision Forecasting</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Empower your business with the ultimate suite for predictive analytics and strategic decision-making
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative"
                  style={{
                    animation: `fadeInUp 0.8s ease-out ${index * 0.15}s both`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative h-full bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300 hover:scale-105">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulseGlow">
                      <feature.icon className="w-6 h-6 text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          {/* Background Bar Graph */}
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" preserveAspectRatio="none">
            <rect x="10%" y="60%" width="10%" height="30%" fill="url(#barGradient)" className="animate-barPulse" style={{ animationDelay: '0s' }} />
            <rect x="25%" y="50%" width="10%" height="40%" fill="url(#barGradient)" className="animate-barPulse" style={{ animationDelay: '0.2s' }} />
            <rect x="40%" y="70%" width="10%" height="20%" fill="url(#barGradient)" className="animate-barPulse" style={{ animationDelay: '0.4s' }} />
            <rect x="55%" y="40%" width="10%" height="50%" fill="url(#barGradient)" className="animate-barPulse" style={{ animationDelay: '0.6s' }} />
            <defs>
              <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 0.5 }} />
                <stop offset="100%" style={{ stopColor: '#06B6D4', stopOpacity: 0.5 }} />
              </linearGradient>
            </defs>
          </svg>

          <div className="max-w-7xl mx-auto">
            <div className="relative animate-fadeInScale duration-1200">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gray-900/80 backdrop-blur-xl border border-white/5 rounded-3xl p-12 md:p-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="animate-in fade-in slide-in-from-left duration-1200">
                    <h2 className="text-4xl font-bold text-white mb-6">
                      Skyrocket Your Business with
                      <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Predictive Insights</span>
                    </h2>
                    <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                      Join thousands of businesses revolutionizing operations with ForecastIQ's data-driven forecasting.
                    </p>
                    <ul className="space-y-4">
                      {benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3 animate-slideInFromSide duration-800" style={{ animationDelay: `${index * 0.15}s` }}>
                          <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulseGlow">
                            <CheckCircle className="w-4 h-4 text-blue-400 animate-spin-slow" />
                          </div>
                          <span className="text-gray-300">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative animate-in fade-in slide-in-from-right duration-1200">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-3xl opacity-20"></div>
                    <div className="relative bg-gray-950/50 border border-white/10 rounded-2xl p-8 backdrop-blur-xl flex items-center justify-center hover:scale-105 transition-transform duration-500">
                      <img src={myImage} alt="Predictive analytics dashboard" className="w-full h-auto rounded-xl object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 mb-20">
          <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-1200">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Shape the Future of Your Business
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              Join top-tier companies leveraging ForecastIQ to predict demand and dominate their markets
            </p>
            <Link
              to={'/upload'}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all hover:scale-110 shadow-lg shadow-blue-500/25 animate-fadeInScale animate-pulseGlow duration-1000"
            >
              Explore Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes waveAnimation {
          0% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(-20px); opacity: 0.8; }
          100% { transform: translateY(0); opacity: 0.6; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes drawLine {
          0% { stroke-dashoffset: 2000; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes barPulse {
          0%, 100% { transform: scaleY(1); opacity: 0.5; }
          50% { transform: scaleY(1.1); opacity: 0.7; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(59, 130, 246, 0); }
        }
        @keyframes slideInFromSide {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-waveAnimation {
          animation: waveAnimation 6s ease-in-out infinite;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-drawLine {
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: drawLine 5s linear forwards;
        }
        .animate-barPulse {
          animation: barPulse 3s ease-in-out infinite;
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.8s ease-out forwards;
        }
        .animate-pulseGlow {
          animation: pulseGlow 2s ease-in-out infinite;
        }
        .animate-slideInFromSide {
          animation: slideInFromSide 0.8s ease-out forwards;
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
}