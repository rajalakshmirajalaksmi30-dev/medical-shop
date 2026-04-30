import { Link, useLocation } from 'react-router-dom';
import { XCircle, RefreshCw, Home } from 'lucide-react';
import '../styles/checkout.css';

export default function OrderFailure() {
  const location = useLocation();
  const { reason } = location.state || {};

  return (
    <div className="page container" id="order-failure-page">
      <div className="order-result">
        <div className="order-result-icon failure">
          <XCircle size={72} />
        </div>

        <h1 className="order-result-title">Payment Failed</h1>
        <p className="order-result-text">
          Unfortunately, your payment could not be processed.
          {reason && ` Reason: ${reason}`}
        </p>
        <p className="order-result-text">
          Don't worry, no amount has been deducted. Please try again.
        </p>

        <div className="order-result-actions">
          <Link to="/checkout" className="btn btn-primary btn-lg">
            <RefreshCw size={18} /> Try Again
          </Link>
          <Link to="/" className="btn btn-secondary btn-lg">
            <Home size={18} /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
