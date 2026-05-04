import { Link } from 'react-router-dom';
import { Pill, FlaskConical, Stethoscope, HeartPulse, Apple, Sparkles, Package } from 'lucide-react';
import '../styles/categories.css';

const CATEGORIES = [
  { name: 'Tablets', icon: <Pill size={36} />, color: '#3b82f6', desc: 'Pain relief, antibiotics & more', count: '120+ products' },
  { name: 'Syrups', icon: <FlaskConical size={36} />, color: '#8b5cf6', desc: 'Cough, cold & wellness syrups', count: '45+ products' },
  { name: 'Equipment', icon: <Stethoscope size={36} />, color: '#06b6d4', desc: 'Monitors, thermometers & tools', count: '30+ products' },
  { name: 'First Aid', icon: <HeartPulse size={36} />, color: '#ef4444', desc: 'Bandages, kits & essentials', count: '50+ products' },
  { name: 'Supplements', icon: <Apple size={36} />, color: '#22c55e', desc: 'Vitamins, minerals & nutrition', count: '80+ products' },
  { name: 'Hygiene', icon: <Sparkles size={36} />, color: '#f59e0b', desc: 'Sanitizers, masks & hygiene', count: '60+ products' },
  { name: 'General', icon: <Package size={36} />, color: '#64748b', desc: 'Everyday health essentials', count: '90+ products' },
];

export default function Categories() {
  return (
    <div className="page container" id="categories-page">
      <div className="categories-header">
        <h1 className="categories-title">Shop by Category</h1>
        <p className="categories-subtitle">
          Browse our wide range of healthcare products organized by category. Find exactly what you need.
        </p>
      </div>

      <div className="categories-grid">
        {CATEGORIES.map((cat, i) => (
          <Link
            key={cat.name}
            to={`/category/${cat.name}`}
            className="category-card animate-fade-in-up"
            style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
          >
            <div className="category-card-icon" style={{ background: `${cat.color}15`, color: cat.color }}>
              {cat.icon}
            </div>
            <div className="category-card-info">
              <h3 className="category-card-name">{cat.name}</h3>
              <p className="category-card-desc">{cat.desc}</p>
              <span className="category-card-count">{cat.count}</span>
            </div>
            <div className="category-card-arrow" style={{ color: cat.color }}>→</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
