import { Link } from 'react-router-dom';
import Wheel from '../components/Wheel.jsx';
import { usePageTitle } from '../components/ui.jsx';

export default function NotFound() {
  usePageTitle('Page not found');
  return (
    <section className="notfound">
      <Wheel className="nf-wheel" ring="var(--navy)" />
      <h1>This page does not exist</h1>
      <p>The link may be old or mistyped.</p>
      <Link to="/" className="btn btn-primary">Go to the home page</Link>
    </section>
  );
}
