import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginPage() {
  return (
    <main className="auth-scene auth-scene--signin">
      <section className="auth-copy">
        <div className="section-label">Catalog builder for shop owners</div>
        <h1>Build one shareable catalog link for every customer, channel, and product drop.</h1>
        <p>
          Add products, organize images, publish updates, and send one clean catalog URL anywhere you sell.
        </p>
      </section>

      <Card className="auth-form">
        <CardContent className="p-8">
          <div className="section-label">Welcome back</div>
          <h1>Sign in</h1>
          <p>Access your store workspace and continue editing the catalog your customers already know.</p>
          <form className="auth-form-grid">
          <label className="field">
            <span>Email</span>
            <Input type="email" placeholder="owner@company.com" />
          </label>
          <label className="field">
            <span>Password</span>
            <Input type="password" placeholder="Enter your password" />
          </label>
          <div className="form-actions">
            <Button variant="rust" type="submit">
              Log in
            </Button>
          </div>
        </form>
        <p className="form-note">
          New account? <Link to="/signup">Create one</Link>
        </p>
        </CardContent>
      </Card>
    </main>
  );
}
